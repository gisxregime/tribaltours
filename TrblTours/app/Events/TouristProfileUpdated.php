<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TouristProfileUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $touristPayload;

    public function __construct(User $tourist)
    {
        $this->touristPayload = [
            'id' => (string) $tourist->id,
            'name' => trim((string) ($tourist->name ?? 'Tourist')),
            'avatar' => $this->resolveAvatarPath($tourist->avatar_path),
            'updatedAt' => optional($tourist->updated_at)->toISOString(),
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('tourist-profiles'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'tourist-profile.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'tourist' => $this->touristPayload,
        ];
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
