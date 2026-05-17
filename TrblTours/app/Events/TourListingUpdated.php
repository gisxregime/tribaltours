<?php

namespace App\Events;

use App\Models\TourListing;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class TourListingUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $tourPayload;
    private string $eventName;

    public function __construct(TourListing $tourListing, string $action = 'updated')
    {
        $normalizedAction = in_array($action, ['created', 'updated', 'deleted'], true)
            ? $action
            : 'updated';
        $this->eventName = 'tour-listing.' . $normalizedAction;

        $tourListing->loadMissing(['guide.guideProfile']);
        $guide = $tourListing->guide;
        $guideProfile = $guide?->guideProfile;
        $publicReviews = $tourListing->reviews()->where('is_public', true);
        $liveReviews = (int) $publicReviews->count();
        $liveRating = $publicReviews->avg('rating');
        $rating = $liveReviews > 0
            ? round((float) ($liveRating ?? $tourListing->rating_avg ?? 0), 2)
            : 0.0;
        $locationBits = array_filter([
            $tourListing->city,
            $tourListing->province,
        ]);

        $gallery = array_values(array_filter(array_map(function ($path) {
            return $this->sanitizeBroadcastAssetPath((string) $path);
        }, is_array($tourListing->gallery_paths) ? $tourListing->gallery_paths : [])));

        $coverImage = $this->sanitizeBroadcastAssetPath((string) ($tourListing->cover_image_path ?: 'images/pangasinan.jpg'));
        if (!$coverImage && $gallery) {
            $coverImage = (string) $gallery[0];
        }
        if (!$coverImage) {
            $coverImage = 'images/pangasinan.jpg';
        }

        if (!$gallery) {
            $gallery = [$coverImage];
        }

        $tags = array_values(array_filter(array_map(function ($tag) {
            return trim((string) $tag);
        }, is_array($tourListing->tags) ? $tourListing->tags : [])));
        $tags = array_slice($tags, 0, 6);

        $description = Str::limit((string) ($tourListing->short_description ?: 'Custom guided experience.'), 320, '...');
        $guideBio = Str::limit((string) ($guide?->bio ?? ''), 220, '...');
        $guideSpecialties = Str::limit((string) ($guideProfile?->areas_of_expertise ?? ''), 220, '...');

        $this->tourPayload = [
            'id' => (string) $tourListing->id,
            'action' => $normalizedAction,
            'slug' => (string) $tourListing->slug,
            'legacyKey' => (string) $tourListing->slug,
            'guideId' => $guide ? (string) $guide->id : '',
            'location' => $locationBits ? implode(', ', $locationBits) : 'Philippines',
            'title' => (string) $tourListing->title,
            'guide' => trim((string) ($guide->name ?? 'Guide')),
            'rating' => $rating,
            'reviews' => $liveReviews,
            'duration' => (string) ($tourListing->duration_label ?: 'Flexible'),
            'pax' => (int) ($tourListing->min_guests ?? 1) . '-' . (int) ($tourListing->max_guests ?? 10) . ' pax',
            'difficulty' => (string) ($tourListing->difficulty ?: 'Moderate'),
            'price' => (float) ($tourListing->price ?? 0),
            'badge' => (string) ($tourListing->category ?: 'Featured'),
            'image' => $coverImage,
            'coverImage' => $coverImage,
            'guideAvatar' => $this->resolveAvatarPath($guide?->avatar_path),
            'guidePhoto' => $this->resolveAvatarPath($guide?->avatar_path),
            'tags' => $tags,
            'latest' => optional($tourListing->updated_at)->getTimestamp() ?: time(),
            'provider' => trim((string) ($guide->name ?? 'Guide')),
            'durationHours' => (string) ($tourListing->duration_label ?: 'Flexible'),
            'languages' => (string) ($guideProfile?->languages_spoken ?: $tourListing->languages ?: 'English, Filipino'),
            'meetingPoint' => (string) ($tourListing->meeting_point ?: 'Main tourist pickup point'),
            'description' => $description,
            'gallery' => array_slice($gallery, 0, 4),
            'region' => 'all',
            'status' => (string) ($tourListing->status ?: 'draft'),
            'isActive' => (bool) ($tourListing->is_active ?? false),
            'guideBio' => $guideBio,
            'guideLocation' => (string) ($guide?->location ?? ''),
            'guideContact' => (string) ($guide?->phone ?? ''),
            'guideSpecialties' => $guideSpecialties,
            'guideCertifications' => (string) ($guideProfile?->guide_certificate_number ?? ''),
            'guideExperienceYears' => (int) ($guideProfile?->years_of_experience ?? 1),
            'guideSocial' => (string) (is_array($guide?->account_settings) ? ($guide->account_settings['social_links'] ?? '') : ''),
            'guideVerified' => (string) ($guide?->guide_verification_status ?? '') === 'approved',
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('tour-listings'),
        ];
    }

    public function broadcastAs(): string
    {
        return $this->eventName;
    }

    public function broadcastWith(): array
    {
        return [
            'tour' => $this->tourPayload,
        ];
    }

    private function resolveAvatarPath(?string $path): string
    {
        $raw = trim((string) ($path ?? ''));
        if ($raw === '') {
            return '/images/manila.jpg';
        }

        if (str_starts_with($raw, 'data:') || strlen($raw) > 2048) {
            return '/images/manila.jpg';
        }

        if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://')) {
            return $raw;
        }

        return '/' . ltrim($raw, '/');
    }

    private function sanitizeBroadcastAssetPath(string $path): ?string
    {
        $value = trim($path);
        if ($value === '' || str_starts_with($value, 'data:') || strlen($value) > 2048) {
            return null;
        }

        return $value;
    }
}
