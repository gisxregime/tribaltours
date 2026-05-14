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
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\View\View;

class MessageController extends Controller
{
    public function index(Request $request): View|JsonResponse
    {
        $query = Conversation::query()
            ->where('tourist_id', $request->user()->id)
            ->with(['guide', 'messages' => function ($query) {
                $query->latest()->limit(1);
            }])
            ->latest('last_message_at');

        if ($request->expectsJson() || $request->wantsJson()) {
            $conversations = $query->limit(100)->get()->map(function (Conversation $conversation) use ($request) {
                return $this->presentConversationSummary($conversation, (int) $request->user()->id);
            })->values();

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
        $conversations = Conversation::query()
            ->where('tourist_id', $request->user()->id)
            ->with(['guide', 'messages' => function ($query) {
                $query->latest();
            }])
            ->latest('last_message_at')
            ->limit(100)
            ->get()
            ->map(function (Conversation $conversation) use ($request) {
                return $this->presentConversationSummary($conversation, (int) $request->user()->id);
            })
            ->values();

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

        $conversation->load(['guide', 'messages.sender']);
        Message::query()
            ->where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', $request->user()->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        $messages = $conversation->messages()->with('sender')->oldest()->get()->map(function (Message $message) use ($request) {
            return $this->presentMessage($message, (int) $request->user()->id);
        })->values();

        return response()->json([
            'ok' => true,
            'conversation' => $this->presentConversationSummary($conversation->fresh(['guide', 'messages']), (int) $request->user()->id),
            'messages' => $messages,
        ]);
    }

    public function sendToThread(Request $request, Conversation $conversation): JsonResponse
    {
        abort_unless($conversation->tourist_id === Auth::id(), 403);

        $payload = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $message = Message::query()->create([
            'conversation_id' => $conversation->id,
            'sender_id' => $request->user()->id,
            'body' => trim((string) $payload['body']),
            'is_read' => false,
        ]);

        $conversation->update(['last_message_at' => now()]);

        $conversation->loadMissing('guide');
        DomainNotification::notifyUser(
            $conversation->guide,
            'message.received',
            trim((string) $request->user()->name) . ' sent you a new message.',
            [
                'conversationId' => (string) $conversation->id,
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

        $conversation = Conversation::query()->firstOrCreate(
            [
                'tourist_id' => $request->user()->id,
                'guide_id' => $guide->id,
                'tour_request_id' => $tourRequestId,
            ],
            [
                'last_message_at' => now(),
            ]
        );

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
            'redirect' => '/messages?conversation=' . urlencode((string) $conversation->id),
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

        $message = Message::query()->create([
            'conversation_id' => $conversation->id,
            'sender_id' => $request->user()->id,
            'body' => $payload['body'],
        ]);

        $conversation->update(['last_message_at' => now()]);
        $conversation->loadMissing('guide');
        DomainNotification::notifyUser(
            $conversation->guide,
            'message.received',
            trim((string) $request->user()->name) . ' sent you a new message.',
            [
                'conversationId' => (string) $conversation->id,
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
        $latest = $conversation->messages->sortByDesc('created_at')->first();
        $unread = $conversation->messages->filter(function (Message $message) use ($userId) {
            return (int) $message->sender_id !== $userId && !$message->is_read;
        })->count();

        return [
            'id' => (string) $conversation->id,
            'name' => trim((string) ($guide->name ?? 'Guide')),
            'avatar' => (string) (($guide && $guide->avatar_path) ? $guide->avatar_path : 'images/manila.jpg'),
            'last' => (string) ($latest?->body ?? ''),
            'time' => optional($latest?->created_at)->toISOString() ?: optional($conversation->updated_at)->toISOString(),
            'unread' => $unread,
            'tourRequestId' => $conversation->tour_request_id ? (string) $conversation->tour_request_id : null,
        ];
    }

    private function presentMessage(Message $message, int $userId): array
    {
        return [
            'id' => (string) $message->id,
            'mine' => (int) $message->sender_id === $userId,
            'text' => (string) ($message->body ?? ''),
            'senderId' => (string) $message->sender_id,
            'senderName' => trim((string) ($message->sender?->name ?? 'User')),
            'isRead' => (bool) $message->is_read,
            'readAt' => optional($message->read_at)->toISOString(),
            'createdAt' => optional($message->created_at)->toISOString(),
        ];
    }
}
