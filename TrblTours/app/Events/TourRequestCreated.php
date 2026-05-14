<?php

namespace App\Events;

use App\Models\TourRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TourRequestCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $requestPayload;

    public function __construct(TourRequest $tourRequest)
    {
        $tourRequest->loadMissing('tourist');
        $tourist = $tourRequest->tourist;
        $locationBits = array_filter([
            $tourRequest->city,
            $tourRequest->province,
        ]);

        $this->requestPayload = [
            'id' => (string) $tourRequest->id,
            'touristName' => trim((string) ($tourist->name ?? 'Tourist')),
            'touristAvatar' => 'images/manila.jpg',
            'title' => (string) $tourRequest->title,
            'description' => (string) ($tourRequest->description ?? ''),
            'location' => $locationBits ? implode(', ', $locationBits) : 'Philippines',
            'budgetMin' => (float) ($tourRequest->budget_min ?? 0),
            'budgetMax' => (float) ($tourRequest->budget_max ?? ($tourRequest->budget_min ?? 0)),
            'duration' => (string) ($tourRequest->duration_label ?: 'Flexible'),
            'travelers' => (string) ($tourRequest->travelers_label ?: '1 traveler'),
            'interests' => array_values(array_filter(array_map(function ($value) {
                return trim((string) $value);
            }, is_array($tourRequest->interests) ? $tourRequest->interests : []))),
            'status' => (string) $tourRequest->status,
            'createdAt' => optional($tourRequest->created_at)->toISOString(),
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('guide-request-feed'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'tour-request.created';
    }

    public function broadcastWith(): array
    {
        return [
            'request' => $this->requestPayload,
        ];
    }
}
