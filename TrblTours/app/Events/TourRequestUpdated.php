<?php

namespace App\Events;

use App\Models\TourRequest;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TourRequestUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $requestPayload;

    public function __construct(TourRequest $tourRequest)
    {
        $tourRequest->loadMissing(['tourist', 'selectedGuide']);

        $tourist = $tourRequest->tourist;
        $selectedGuide = $tourRequest->selectedGuide;
        $locationBits = array_filter([
            $tourRequest->city,
            $tourRequest->province,
        ]);
        $metadata = is_array($tourRequest->metadata) ? $tourRequest->metadata : [];
        $rawComments = is_array($metadata['comments'] ?? null) ? $metadata['comments'] : [];
        $guideIds = collect($rawComments)->map(function ($entry) {
            if (!is_array($entry) || !isset($entry['guideId'])) {
                return null;
            }

            $value = (int) $entry['guideId'];
            return $value > 0 ? $value : null;
        })->filter()->unique()->values();

        $guideLookup = User::query()
            ->whereIn('id', $guideIds)
            ->get()
            ->keyBy('id');

        $comments = array_values(array_filter(array_map(function ($entry) use ($guideLookup, $tourist) {
            if (!is_array($entry)) {
                return null;
            }

            $text = trim((string) ($entry['text'] ?? ''));
            if ($text === '') {
                return null;
            }

            $guideIdValue = isset($entry['guideId']) ? (int) $entry['guideId'] : 0;
            $guideId = $guideIdValue > 0 ? (string) $guideIdValue : null;
            $guideModel = $guideId !== null ? $guideLookup->get($guideIdValue) : null;

            return [
                'id' => (string) ($entry['id'] ?? uniqid('comment-', true)),
                'guideId' => $guideId,
                'guideName' => trim((string) ($guideModel?->name ?? ($tourist?->name ?? ($entry['guideName'] ?? 'Guide')))),
                'guideAvatar' => $this->resolveAvatarPath(
                    $guideModel?->avatar_path
                        ?? ($guideId === null ? $tourist?->avatar_path : null)
                        ?? ($entry['guideAvatar'] ?? null)
                ),
                'text' => $text,
                'offerAmount' => isset($entry['offerAmount']) ? (float) $entry['offerAmount'] : null,
                'createdAt' => (string) ($entry['createdAt'] ?? now()->toISOString()),
            ];
        }, $rawComments)));

        $this->requestPayload = [
            'id' => (string) $tourRequest->id,
            'touristName' => trim((string) ($tourist->name ?? 'Tourist')),
            'touristAvatar' => $this->resolveAvatarPath($tourist?->avatar_path),
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
            'selectedGuideId' => $tourRequest->selected_guide_id ? (string) $tourRequest->selected_guide_id : null,
            'selectedGuideName' => $selectedGuide ? trim((string) $selectedGuide->name) : null,
            'selectedGuideAvatar' => $this->resolveAvatarPath($selectedGuide?->avatar_path),
            'comments' => $comments,
            'createdAt' => optional($tourRequest->created_at)->toISOString(),
            'updatedAt' => optional($tourRequest->updated_at)->toISOString(),
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('guide-request-feed'),
            new Channel('tourist-requests'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'tour-request.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'request' => $this->requestPayload,
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
