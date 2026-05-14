<?php

namespace App\Events;

use App\Models\TourListing;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TourListingUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $tourPayload;

    public function __construct(TourListing $tourListing, string $action = 'updated')
    {
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

        $coverImage = (string) ($tourListing->cover_image_path ?: 'images/pangasinan.jpg');
        $gallery = array_values(array_filter(array_map(function ($path) {
            return trim((string) $path);
        }, is_array($tourListing->gallery_paths) ? $tourListing->gallery_paths : [])));

        if (!$gallery) {
            $gallery = [$coverImage];
        }

        $tags = array_values(array_filter(array_map(function ($tag) {
            return trim((string) $tag);
        }, is_array($tourListing->tags) ? $tourListing->tags : [])));

        $this->tourPayload = [
            'id' => (string) $tourListing->id,
            'action' => $action,
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
            'description' => (string) ($tourListing->short_description ?: 'Custom guided experience.'),
            'gallery' => $gallery,
            'region' => 'all',
            'status' => (string) ($tourListing->status ?: 'draft'),
            'isActive' => (bool) ($tourListing->is_active ?? false),
            'guideBio' => (string) ($guide?->bio ?? ''),
            'guideLocation' => (string) ($guide?->location ?? ''),
            'guideContact' => (string) ($guide?->phone ?? ''),
            'guideSpecialties' => (string) ($guideProfile?->areas_of_expertise ?? ''),
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
        return 'tour-listing.updated';
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

        if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://') || str_starts_with($raw, 'data:')) {
            return $raw;
        }

        return '/' . ltrim($raw, '/');
    }
}
