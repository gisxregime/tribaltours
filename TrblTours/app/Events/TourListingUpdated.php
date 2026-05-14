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
        $tourListing->loadMissing('guide');
        $guide = $tourListing->guide;
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
            'location' => $locationBits ? implode(', ', $locationBits) : 'Philippines',
            'title' => (string) $tourListing->title,
            'guide' => trim((string) ($guide->name ?? 'Guide')),
            'rating' => (float) ($tourListing->rating_avg ?? 0),
            'reviews' => (int) ($tourListing->reviews_count ?? 0),
            'duration' => (string) ($tourListing->duration_label ?: 'Flexible'),
            'pax' => (int) ($tourListing->min_guests ?? 1) . '-' . (int) ($tourListing->max_guests ?? 10) . ' pax',
            'difficulty' => (string) ($tourListing->difficulty ?: 'Moderate'),
            'price' => (float) ($tourListing->price ?? 0),
            'badge' => (string) ($tourListing->category ?: 'Featured'),
            'image' => $coverImage,
            'coverImage' => $coverImage,
            'guideAvatar' => (string) (($guide && $guide->avatar_path) ? $guide->avatar_path : 'images/manila.jpg'),
            'tags' => $tags,
            'latest' => optional($tourListing->updated_at)->getTimestamp() ?: time(),
            'provider' => trim((string) ($guide->name ?? 'Guide')),
            'durationHours' => (string) ($tourListing->duration_label ?: 'Flexible'),
            'languages' => (string) ($tourListing->languages ?: 'English, Filipino'),
            'meetingPoint' => (string) ($tourListing->meeting_point ?: 'Main tourist pickup point'),
            'description' => (string) ($tourListing->short_description ?: 'Custom guided experience.'),
            'gallery' => $gallery,
            'region' => 'all',
            'status' => (string) ($tourListing->status ?: 'draft'),
            'isActive' => (bool) ($tourListing->is_active ?? false),
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
}
