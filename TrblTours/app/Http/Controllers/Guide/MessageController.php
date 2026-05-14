<?php

namespace App\Http\Controllers\Guide;

use App\Events\TouristMessageSent;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
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
            ->with(['tourist'])
            ->orderByRaw('COALESCE(last_message_at, updated_at) DESC')
            ->orderByDesc('id')
            ->limit(200)
            ->get();

        $summaries = $conversations
            ->filter(function (Conversation $conversation) {
                return (int) $conversation->tourist_id > 0;
            })
            ->groupBy('tourist_id')
            ->map(function (Collection $group) use ($request) {
                return $this->presentConversationGroupSummary($group, (int) $request->user()->id);
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

        $pairConversations = Conversation::query()
            ->where('guide_id', $conversation->guide_id)
            ->where('tourist_id', $conversation->tourist_id)
            ->with('tourist')
            ->orderByRaw('COALESCE(last_message_at, updated_at) DESC')
            ->orderByDesc('id')
            ->get();

        $pairConversationIds = $pairConversations->pluck('id')->map(function ($id) {
            return (int) $id;
        })->filter()->values();

        if ($pairConversationIds->isEmpty()) {
            $pairConversationIds = collect([(int) $conversation->id]);
        }

        Message::query()
            ->whereIn('conversation_id', $pairConversationIds->all())
            ->where('sender_id', '!=', $request->user()->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        $messages = Message::query()
            ->whereIn('conversation_id', $pairConversationIds->all())
            ->with('sender')
            ->orderBy('created_at')
            ->orderBy('id')
            ->get()
            ->map(function (Message $message) use ($request) {
                return $this->presentMessage($message, (int) $request->user()->id);
            })
            ->values();

        $summary = $this->presentConversationGroupSummary(
            $pairConversations->isNotEmpty() ? $pairConversations : collect([$conversation]),
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

        $canonicalConversation = $this->canonicalConversationForPair(
            (int) $conversation->guide_id,
            (int) $conversation->tourist_id
        ) ?: $conversation;

        $payload = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $message = Message::query()->create([
            'conversation_id' => $canonicalConversation->id,
            'sender_id' => $request->user()->id,
            'body' => trim((string) $payload['body']),
            'is_read' => false,
        ]);

        $canonicalConversation->update(['last_message_at' => now()]);

        $canonicalConversation->loadMissing('tourist');
        DomainNotification::notifyUser(
            $canonicalConversation->tourist,
            'message.received',
            trim((string) $request->user()->name) . ' sent you a new message.',
            [
                'conversationId' => (string) $canonicalConversation->id,
                'senderId' => (string) $request->user()->id,
            ]
        );

        event(new TouristMessageSent($message->fresh(['conversation', 'sender'])));

        return response()->json([
            'ok' => true,
            'message' => $this->presentMessage($message->fresh(['sender']), (int) $request->user()->id),
        ], 201);
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
            'touristId' => $canonical->tourist_id ? (string) $canonical->tourist_id : null,
            'guideId' => $canonical->guide_id ? (string) $canonical->guide_id : null,
            'sortTimestamp' => $sortTimestamp,
        ];
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
