<?php

namespace App\Http\Controllers\Tourist;

use App\Events\TouristMessageSent;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\TourRequest;
use App\Models\User;
use App\Support\DomainNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\View\View;

class MessageController extends Controller
{
    public function index(Request $request): View|JsonResponse
    {
        $query = Conversation::query()
            ->where('tourist_id', $request->user()->id)
            ->with(['guide.guideProfile', 'request'])
            ->orderByRaw('COALESCE(last_message_at, updated_at) DESC')
            ->orderByDesc('id');

        if ($request->expectsJson() || $request->wantsJson()) {
            $conversations = $this->buildConversationSummariesForTourist((int) $request->user()->id);

            return response()->json([
                'ok' => true,
                'conversations' => $conversations,
            ]);
        }

        $conversations = $query->paginate(20);

        return view('legacy.root.messages', ['conversations' => $conversations]);
    }

    public function threads(Request $request): JsonResponse
    {
        $conversations = $this->buildConversationSummariesForTourist((int) $request->user()->id);

        return response()->json([
            'ok' => true,
            'conversations' => $conversations,
            'pusher' => [
                'key' => env('PUSHER_APP_KEY'),
                'cluster' => env('PUSHER_APP_CLUSTER', 'ap1'),
            ],
        ]);
    }

    public function thread(Conversation $conversation, Request $request): JsonResponse
    {
        abort_unless($conversation->tourist_id === Auth::id(), 403);

        $conversation->loadMissing(['guide.guideProfile', 'request']);
        $group = $this->conversationsForPair((int) $conversation->tourist_id, (int) $conversation->guide_id);
        $conversationIds = $group->pluck('id')->map(function ($id) {
            return (int) $id;
        })->filter()->values();

        if ($conversationIds->isEmpty()) {
            $conversationIds = collect([(int) $conversation->id]);
        }

        Message::query()
            ->whereIn('conversation_id', $conversationIds->all())
            ->where('sender_id', '!=', $request->user()->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        $messages = Message::query()
            ->whereIn('conversation_id', $conversationIds->all())
            ->with('sender')
            ->orderBy('created_at')
            ->orderBy('id')
            ->get()
            ->map(function (Message $message) use ($request) {
                return $this->presentMessage($message, (int) $request->user()->id);
            })
            ->values();

        $summary = $this->presentConversationGroupSummary(
            $group->isEmpty() ? collect([$conversation]) : $group,
            (int) $request->user()->id
        );

        return response()->json([
            'ok' => true,
            'conversation' => $summary ? collect($summary)->except(['sortTimestamp'])->all() : null,
            'messages' => $messages,
        ]);
    }

    public function sendToThread(Request $request, Conversation $conversation): JsonResponse
    {
        abort_unless($conversation->tourist_id === Auth::id(), 403);

        $payload = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $canonical = $this->canonicalConversationForPair(
            (int) $request->user()->id,
            (int) $conversation->guide_id
        ) ?: $conversation;

        $message = Message::query()->create([
            'conversation_id' => $canonical->id,
            'sender_id' => $request->user()->id,
            'body' => trim((string) $payload['body']),
            'is_read' => false,
        ]);

        $canonical->update(['last_message_at' => now()]);

        $canonical->loadMissing('guide');
        DomainNotification::notifyUser(
            $canonical->guide,
            'message.received',
            trim((string) $request->user()->name) . ' sent you a new message.',
            [
                'conversationId' => (string) $canonical->id,
                'senderId' => (string) $request->user()->id,
            ]
        );

        event(new TouristMessageSent($message->fresh(['conversation', 'sender'])));

        return response()->json([
            'ok' => true,
            'message' => $this->presentMessage($message->fresh(['sender']), (int) $request->user()->id),
        ], 201);
    }

    public function start(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'tour_request_id' => ['nullable', 'exists:tour_requests,id'],
            'guide_id' => ['required', 'exists:users,id'],
            'body' => ['nullable', 'string', 'max:2000'],
        ]);

        $guide = User::query()->findOrFail($payload['guide_id']);
        $tourRequestId = $payload['tour_request_id'] ?? null;

        if ($tourRequestId) {
            $tourRequest = TourRequest::query()->findOrFail($tourRequestId);
            abort_unless($tourRequest->tourist_id === Auth::id(), 403);
        }

        $conversation = $this->canonicalConversationForRequest(
            (int) $request->user()->id,
            (int) $guide->id,
            $tourRequestId ? (int) $tourRequestId : null
        );

        if (!$conversation) {
            $conversation = Conversation::query()->create([
                'tourist_id' => $request->user()->id,
                'guide_id' => $guide->id,
                'tour_request_id' => $tourRequestId,
                'last_message_at' => now(),
            ]);
        }

        $body = trim((string) ($payload['body'] ?? ''));
        if ($body !== '') {
            $message = Message::query()->create([
                'conversation_id' => $conversation->id,
                'sender_id' => $request->user()->id,
                'body' => $body,
                'is_read' => false,
            ]);
            $conversation->update(['last_message_at' => now()]);
            DomainNotification::notifyUser(
                $guide,
                'message.received',
                trim((string) $request->user()->name) . ' sent you a new message.',
                [
                    'conversationId' => (string) $conversation->id,
                    'senderId' => (string) $request->user()->id,
                ]
            );
            event(new TouristMessageSent($message->fresh(['conversation', 'sender'])));
        }

        return response()->json([
            'ok' => true,
            'conversationId' => (string) $conversation->id,
            'redirect' => '/messages/' . urlencode((string) $guide->id)
                . '?conversation=' . urlencode((string) $conversation->id)
                . ($tourRequestId ? '&request=' . urlencode((string) $tourRequestId) : ''),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): RedirectResponse
    {
        return redirect()->route('tourist.messages.index');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $payload = $request->validate([
            'conversation_id' => ['required', 'exists:conversations,id'],
            'body' => ['required', 'string'],
        ]);

        $conversation = Conversation::query()->findOrFail($payload['conversation_id']);
        abort_unless($conversation->tourist_id === $request->user()->id, 403);

        $canonical = $this->canonicalConversationForPair(
            (int) $request->user()->id,
            (int) $conversation->guide_id
        ) ?: $conversation;

        $message = Message::query()->create([
            'conversation_id' => $canonical->id,
            'sender_id' => $request->user()->id,
            'body' => $payload['body'],
        ]);

        $canonical->update(['last_message_at' => now()]);
        $canonical->loadMissing('guide');
        DomainNotification::notifyUser(
            $canonical->guide,
            'message.received',
            trim((string) $request->user()->name) . ' sent you a new message.',
            [
                'conversationId' => (string) $canonical->id,
                'senderId' => (string) $request->user()->id,
            ]
        );
        event(new TouristMessageSent($message->fresh(['conversation', 'sender'])));

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'ok' => true,
                'message' => $this->presentMessage($message->fresh(['sender']), (int) $request->user()->id),
            ], 201);
        }

        return back()->with('status', 'Message sent.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Message $message): View
    {
        $conversation = $message->conversation;
        abort_unless($conversation && $conversation->tourist_id === Auth::id(), 403);

        return view('legacy.root.messages', ['message' => $message]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Message $message): RedirectResponse
    {
        return redirect()->route('tourist.messages.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Message $message): RedirectResponse
    {
        abort_unless($message->sender_id === Auth::id(), 403);
        $payload = $request->validate([
            'body' => ['required', 'string'],
        ]);
        $message->update($payload);

        return back()->with('status', 'Message updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Message $message): RedirectResponse
    {
        abort_unless($message->sender_id === Auth::id(), 403);
        $message->delete();

        return back()->with('status', 'Message removed.');
    }

    private function presentConversationSummary(Conversation $conversation, int $userId): array
    {
        $guide = $conversation->guide;
        $guideProfile = $guide?->guideProfile;
        $tourRequest = $conversation->request;
        $tourContext = $this->presentTourRequestContext($tourRequest);
        $latest = $conversation->messages->sortByDesc('created_at')->first();
        $unread = $conversation->messages->filter(function (Message $message) use ($userId) {
            return (int) $message->sender_id !== $userId && !$message->is_read;
        })->count();

        return [
            'id' => (string) $conversation->id,
            'guideId' => $conversation->guide_id ? (string) $conversation->guide_id : null,
            'touristId' => $conversation->tourist_id ? (string) $conversation->tourist_id : null,
            'name' => trim((string) ($guide?->name ?? 'Guide')),
            'avatar' => $this->resolveAvatarPath($guide?->avatar_path),
            'guideBio' => (string) ($guide?->bio ?? ''),
            'guideLocation' => (string) ($guide?->location ?? ''),
            'guideLanguages' => (string) ($guideProfile?->languages_spoken ?? ''),
            'guideSpecialties' => (string) ($guideProfile?->areas_of_expertise ?? ''),
            'guideCertifications' => (string) ($guideProfile?->guide_certificate_number ?? ''),
            'last' => (string) ($latest?->body ?? ''),
            'time' => optional($latest?->created_at)->toISOString() ?: optional($conversation->updated_at)->toISOString(),
            'unread' => $unread,
            'tourRequestId' => $conversation->tour_request_id ? (string) $conversation->tour_request_id : null,
            'tourTitle' => $tourContext['title'],
            'budgetMin' => $tourContext['budgetMin'],
            'budgetMax' => $tourContext['budgetMax'],
        ];
    }

    private function dedupeConversationsByGuide($conversations)
    {
        return $conversations
            ->filter(function (Conversation $conversation) {
                return (int) $conversation->guide_id > 0;
            })
            ->unique(function (Conversation $conversation) {
                return (string) $conversation->guide_id;
            })
            ->values();
    }

    private function presentMessage(Message $message, int $userId): array
    {
        return [
            'id' => (string) $message->id,
            'mine' => (int) $message->sender_id === $userId,
            'text' => (string) ($message->body ?? ''),
            'senderId' => (string) $message->sender_id,
            'senderName' => trim((string) ($message->sender?->name ?? 'User')),
            'senderAvatar' => $this->resolveAvatarPath($message->sender?->avatar_path),
            'isRead' => (bool) $message->is_read,
            'readAt' => optional($message->read_at)->toISOString(),
            'createdAt' => optional($message->created_at)->toISOString(),
        ];
    }

    private function buildConversationSummariesForTourist(int $touristId): Collection
    {
        $conversations = Conversation::query()
            ->where('tourist_id', $touristId)
            ->with(['guide.guideProfile', 'request'])
            ->orderByRaw('COALESCE(last_message_at, updated_at) DESC')
            ->orderByDesc('id')
            ->limit(200)
            ->get();

        return $conversations
            ->filter(function (Conversation $conversation) {
                return (int) $conversation->guide_id > 0;
            })
            ->groupBy(function (Conversation $conversation) {
                return (string) $conversation->guide_id;
            })
            ->map(function (Collection $group) use ($touristId) {
                return $this->presentConversationGroupSummary($group->values(), $touristId);
            })
            ->filter()
            ->sortByDesc('sortTimestamp')
            ->values()
            ->map(function (array $summary) {
                unset($summary['sortTimestamp']);

                return $summary;
            });
    }

    private function presentConversationGroupSummary(Collection $group, int $userId): ?array
    {
        if ($group->isEmpty()) {
            return null;
        }

        $canonical = $group->sortByDesc(function (Conversation $conversation) {
            return (int) (
                optional($conversation->last_message_at)->getTimestamp()
                ?? optional($conversation->updated_at)->getTimestamp()
                ?? 0
            );
        })->first();

        if (!$canonical || (int) $canonical->guide_id <= 0) {
            return null;
        }

        $conversationIds = $group->pluck('id')->map(function ($id) {
            return (int) $id;
        })->filter()->values();

        if ($conversationIds->isEmpty()) {
            return null;
        }

        $latest = Message::query()
            ->whereIn('conversation_id', $conversationIds->all())
            ->latest('created_at')
            ->first();

        $unread = (int) Message::query()
            ->whereIn('conversation_id', $conversationIds->all())
            ->where('sender_id', '!=', $userId)
            ->where('is_read', false)
            ->count();

        $guide = $canonical->guide;
        $guideProfile = $guide?->guideProfile;
        $tourRequest = $canonical->request;
        $tourContext = $this->presentTourRequestContext($tourRequest);

        $sortTimestamp = (int) (
            optional($latest?->created_at)->getTimestamp()
            ?? optional($canonical->last_message_at)->getTimestamp()
            ?? optional($canonical->updated_at)->getTimestamp()
            ?? 0
        );

        return [
            'id' => (string) $canonical->id,
            'guideId' => $canonical->guide_id ? (string) $canonical->guide_id : null,
            'touristId' => $canonical->tourist_id ? (string) $canonical->tourist_id : null,
            'name' => trim((string) ($guide?->name ?? 'Guide')),
            'avatar' => $this->resolveAvatarPath($guide?->avatar_path),
            'guideBio' => (string) ($guide?->bio ?? ''),
            'guideLocation' => (string) ($guide?->location ?? ''),
            'guideLanguages' => (string) ($guideProfile?->languages_spoken ?? ''),
            'guideSpecialties' => (string) ($guideProfile?->areas_of_expertise ?? ''),
            'guideCertifications' => (string) ($guideProfile?->guide_certificate_number ?? ''),
            'last' => (string) ($latest?->body ?? ''),
            'time' => optional($latest?->created_at)->toISOString()
                ?: optional($canonical->last_message_at)->toISOString()
                ?: optional($canonical->updated_at)->toISOString(),
            'unread' => $unread,
            'tourRequestId' => $canonical->tour_request_id ? (string) $canonical->tour_request_id : null,
            'tourTitle' => $tourContext['title'],
            'budgetMin' => $tourContext['budgetMin'],
            'budgetMax' => $tourContext['budgetMax'],
            'sortTimestamp' => $sortTimestamp,
        ];
    }

    private function presentTourRequestContext(?TourRequest $tourRequest): array
    {
        if (!$tourRequest) {
            return [
                'title' => 'Tour request',
                'budgetMin' => 0.0,
                'budgetMax' => 0.0,
            ];
        }

        return [
            'title' => trim((string) ($tourRequest->title ?? 'Tour request')) ?: 'Tour request',
            'budgetMin' => (float) ($tourRequest->budget_min ?? 0),
            'budgetMax' => (float) ($tourRequest->budget_max ?? 0),
        ];
    }

    private function canonicalConversationForRequest(int $touristId, int $guideId, ?int $tourRequestId): ?Conversation
    {
        $canonical = $this->canonicalConversationForPair($touristId, $guideId);

        if ($canonical && $tourRequestId && !$canonical->tour_request_id) {
            $canonical->tour_request_id = $tourRequestId;
            $canonical->save();
        }

        return $canonical;
    }

    private function canonicalConversationForPair(int $touristId, int $guideId): ?Conversation
    {
        return Conversation::query()
            ->where('tourist_id', $touristId)
            ->where('guide_id', $guideId)
            ->orderByRaw('COALESCE(last_message_at, updated_at) DESC')
            ->orderByDesc('id')
            ->first();
    }

    private function conversationsForPair(int $touristId, int $guideId): Collection
    {
        return Conversation::query()
            ->where('tourist_id', $touristId)
            ->where('guide_id', $guideId)
            ->with(['guide.guideProfile', 'request'])
            ->orderByRaw('COALESCE(last_message_at, updated_at) DESC')
            ->orderByDesc('id')
            ->get();
    }

    private function resolveAvatarPath(?string $path): string
    {
        $raw = trim((string) ($path ?? ''));
        if ($raw === '') {
            return '/images/manila.jpg';
        }

        if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://') || str_starts_with($raw, 'data:')) {
            return $raw;
        }

        return '/' . ltrim($raw, '/');
    }
}
