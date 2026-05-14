<?php

namespace App\Http\Controllers\Guide;

use App\Events\TouristMessageSent;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Support\DomainNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function threads(Request $request): JsonResponse
    {
        $conversations = Conversation::query()
            ->where('guide_id', $request->user()->id)
            ->with(['tourist', 'messages' => function ($query) {
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
        abort_unless($conversation->guide_id === Auth::id(), 403);

        $conversation->load(['tourist', 'messages.sender']);
        Message::query()
            ->where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', $request->user()->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        $messages = $conversation->messages()
            ->with('sender')
            ->oldest()
            ->get()
            ->map(function (Message $message) use ($request) {
                return $this->presentMessage($message, (int) $request->user()->id);
            })
            ->values();

        return response()->json([
            'ok' => true,
            'conversation' => $this->presentConversationSummary($conversation->fresh(['tourist', 'messages']), (int) $request->user()->id),
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

        $message = Message::query()->create([
            'conversation_id' => $conversation->id,
            'sender_id' => $request->user()->id,
            'body' => trim((string) $payload['body']),
            'is_read' => false,
        ]);

        $conversation->update(['last_message_at' => now()]);

        $conversation->loadMissing('tourist');
        DomainNotification::notifyUser(
            $conversation->tourist,
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

    private function presentConversationSummary(Conversation $conversation, int $userId): array
    {
        $tourist = $conversation->tourist;
        $latest = $conversation->messages->sortByDesc('created_at')->first();
        $unread = $conversation->messages->filter(function (Message $message) use ($userId) {
            return (int) $message->sender_id !== $userId && !$message->is_read;
        })->count();

        return [
            'id' => (string) $conversation->id,
            'name' => trim((string) ($tourist->name ?? 'Tourist')),
            'avatar' => (string) (($tourist && $tourist->avatar_path) ? $tourist->avatar_path : 'images/manila.jpg'),
            'last' => (string) ($latest?->body ?? ''),
            'time' => optional($latest?->created_at)->toISOString() ?: optional($conversation->updated_at)->toISOString(),
            'unread' => $unread,
            'tourRequestId' => $conversation->tour_request_id ? (string) $conversation->tour_request_id : null,
            'touristId' => $conversation->tourist_id ? (string) $conversation->tourist_id : null,
            'guideId' => $conversation->guide_id ? (string) $conversation->guide_id : null,
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
