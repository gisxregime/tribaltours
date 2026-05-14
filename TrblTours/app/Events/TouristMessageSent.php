<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TouristMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $messagePayload;

    public function __construct(Message $message)
    {
        $message->loadMissing(['conversation', 'sender']);
        $conversation = $message->conversation;
        $sender = $message->sender;

        $this->messagePayload = [
            'id' => (string) $message->id,
            'conversationId' => $conversation ? (string) $conversation->id : null,
            'touristId' => $conversation ? (string) $conversation->tourist_id : null,
            'guideId' => $conversation ? (string) $conversation->guide_id : null,
            'senderId' => $sender ? (string) $sender->id : null,
            'senderName' => trim((string) ($sender->name ?? 'User')),
            'body' => (string) ($message->body ?? ''),
            'isRead' => (bool) $message->is_read,
            'readAt' => optional($message->read_at)->toISOString(),
            'createdAt' => optional($message->created_at)->toISOString(),
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('tourist-messages'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'message' => $this->messagePayload,
        ];
    }
}
