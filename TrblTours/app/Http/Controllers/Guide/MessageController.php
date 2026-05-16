<?php

namespace App\Http\Controllers\Guide;

use App\Events\TouristMessageSent;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\TourRequest;
use App\Models\User;
use App\Support\DomainNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function threads(Request $request): JsonResponse
    {
        $conversations = Conversation::query()
            ->where('guide_id', $request->user()->id)
            ->with(['tourist', 'request'])
            ->orderByRaw('COALESCE(last_message_at, updated_at) DESC')
            ->orderByDesc('id')
            ->limit(200)
            ->get();

        $summaries = $conversations
            ->filter(function (Conversation $conversation) {
                return (int) $conversation->tourist_id > 0;
            })
            ->groupBy(function (Conversation $conversation) {
                return (string) $conversation->tourist_id;
            })
            ->map(function (Collection $group) use ($request) {
                return $this->presentConversationGroupSummary($group->values(), (int) $request->user()->id);
            })
            ->filter()
            ->sortByDesc('sortTimestamp')
            ->values()
            ->map(function (array $summary) {
                unset($summary['sortTimestamp']);

                return $summary;
            })
            ->values();

        return response()->json([
            'ok' => true,
            'conversations' => $summaries,
            'pusher' => [
                'key' => env('PUSHER_APP_KEY'),
                'cluster' => env('PUSHER_APP_CLUSTER', 'ap1'),
            ],
        ]);
    }

    public function thread(Conversation $conversation, Request $request): JsonResponse
    {
        abort_unless($conversation->guide_id === Auth::id(), 403);

        $conversation->loadMissing(['tourist', 'request']);
        $group = $this->conversationsForPair((int) $conversation->guide_id, (int) $conversation->tourist_id);
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
            'pusher' => [
                'key' => env('PUSHER_APP_KEY'),
                'cluster' => env('PUSHER_APP_CLUSTER', 'ap1'),
            ],
        ]);
    }

    public function sendToThread(Request $request, Conversation $conversation): JsonResponse
    {
        abort_unless($conversation->guide_id === Auth::id(), 403);

        $payload = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $canonical = $this->canonicalConversationForPair(
            (int) $request->user()->id,
            (int) $conversation->tourist_id
        ) ?: $conversation;

        $message = Message::query()->create([
            'conversation_id' => $canonical->id,
            'sender_id' => $request->user()->id,
            'body' => trim((string) $payload['body']),
            'is_read' => false,
        ]);

        $canonical->update(['last_message_at' => now()]);

        $canonical->loadMissing('tourist');
        DomainNotification::notifyUser(
            $canonical->tourist,
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
            'tourist_id' => ['required', 'exists:users,id'],
            'body' => ['nullable', 'string', 'max:2000'],
        ]);

        $tourist = User::query()->findOrFail($payload['tourist_id']);
        $tourRequestId = $payload['tour_request_id'] ?? null;

        if ($tourRequestId) {
            $tourRequest = TourRequest::query()->findOrFail($tourRequestId);

            $selectedGuideId = (int) ($tourRequest->selected_guide_id ?? 0);
            if ($selectedGuideId > 0 && $selectedGuideId !== (int) $request->user()->id) {
                abort(403);
            }
        }

        $conversation = $this->canonicalConversationForRequest(
            (int) $request->user()->id,
            (int) $tourist->id,
            $tourRequestId ? (int) $tourRequestId : null
        );

        if (!$conversation) {
            $conversation = Conversation::query()->create([
                'tourist_id' => $tourist->id,
                'guide_id' => $request->user()->id,
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
                $tourist,
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
            'redirect' => '/guide/messages?conversation=' . urlencode((string) $conversation->id)
                . ($tourRequestId ? '&request=' . urlencode((string) $tourRequestId) : ''),
        ]);
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

        if (!$canonical || (int) $canonical->tourist_id <= 0) {
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

        $tourist = $canonical->tourist;
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
            'name' => trim((string) ($tourist?->name ?? 'Tourist')),
            'avatar' => $this->resolveAvatarPath($tourist?->avatar_path),
            'last' => (string) ($latest?->body ?? ''),
            'time' => optional($latest?->created_at)->toISOString()
                ?: optional($canonical->last_message_at)->toISOString()
                ?: optional($canonical->updated_at)->toISOString(),
            'unread' => $unread,
            'tourRequestId' => $canonical->tour_request_id ? (string) $canonical->tour_request_id : null,
            'tourTitle' => $tourContext['title'],
            'budgetMin' => $tourContext['budgetMin'],
            'budgetMax' => $tourContext['budgetMax'],
            'touristId' => $canonical->tourist_id ? (string) $canonical->tourist_id : null,
            'guideId' => $canonical->guide_id ? (string) $canonical->guide_id : null,
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

    private function canonicalConversationForRequest(int $guideId, int $touristId, ?int $tourRequestId): ?Conversation
    {
        $canonical = $this->canonicalConversationForPair($guideId, $touristId);

        if ($canonical && $tourRequestId && !$canonical->tour_request_id) {
            $canonical->tour_request_id = $tourRequestId;
            $canonical->save();
        }

        return $canonical;
    }

    private function canonicalConversationForPair(int $guideId, int $touristId): ?Conversation
    {
        return Conversation::query()
            ->where('guide_id', $guideId)
            ->where('tourist_id', $touristId)
            ->orderByRaw('COALESCE(last_message_at, updated_at) DESC')
            ->orderByDesc('id')
            ->first();
    }

    private function conversationsForPair(int $guideId, int $touristId): Collection
    {
        return Conversation::query()
            ->where('guide_id', $guideId)
            ->where('tourist_id', $touristId)
            ->with(['tourist', 'request'])
            ->orderByRaw('COALESCE(last_message_at, updated_at) DESC')
            ->orderByDesc('id')
            ->get();
    }

    private function resolveAvatarPath(?string $path): string
    {
        $value = trim((string) $path);
        if ($value === '') {
            return '/images/manila.jpg';
        }

        if (preg_match('/^https?:\/\//i', $value) === 1) {
            return $value;
        }

        if (str_starts_with($value, '/')) {
            return $value;
        }

        if (str_starts_with($value, 'images/')) {
            return '/' . $value;
        }

        if (str_starts_with($value, 'storage/')) {
            return '/' . $value;
        }

        return '/storage/' . ltrim($value, '/');
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
}
