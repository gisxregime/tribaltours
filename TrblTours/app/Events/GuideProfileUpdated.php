<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GuideProfileUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $guidePayload;

    public function __construct(User $guide)
    {
        $guide->loadMissing('guideProfile');
        $profile = $guide->guideProfile;
        $publicReviews = $guide->reviewsReceived()->where('is_public', true);
        $reviewsCount = (int) $publicReviews->count();
        $rating = $reviewsCount > 0
            ? round((float) ($publicReviews->avg('rating') ?? 0), 2)
            : 0.0;

        $this->guidePayload = [
            'id' => (string) $guide->id,
            'name' => trim((string) ($guide->name ?? 'Guide')),
            'avatar' => $this->resolveAvatarPath($guide->avatar_path),
            'bio' => (string) ($guide->bio ?? ''),
            'phone' => (string) ($guide->phone ?? ''),
            'email' => (string) ($guide->email ?? ''),
            'location' => (string) ($guide->location ?? ''),
            'specialties' => (string) ($profile?->areas_of_expertise ?? ''),
            'languages' => (string) ($profile?->languages_spoken ?? ''),
            'certifications' => (string) ($profile?->guide_certificate_number ?? ''),
            'yearsOfExperience' => (int) ($profile?->years_of_experience ?? 0),
            'social' => (string) (is_array($guide->account_settings) ? ($guide->account_settings['social_links'] ?? '') : ''),
            'rating' => $rating,
            'reviews' => $reviewsCount,
            'updatedAt' => optional($guide->updated_at)->toISOString(),
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('guide-profiles'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'guide-profile.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'guide' => $this->guidePayload,
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
