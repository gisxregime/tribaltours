<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\TourListing;
use Illuminate\Http\JsonResponse;

class TourListingFeedController extends Controller
{
    public function index(): JsonResponse
    {
        $tours = TourListing::query()
            ->with('guide')
            ->where('status', 'published')
            ->where('is_active', true)
            ->latest('updated_at')
            ->limit(120)
            ->get()
            ->map(fn (TourListing $tourListing) => $this->presentTour($tourListing))
            ->values();

        return response()->json([
            'ok' => true,
            'tours' => $tours,
        ]);
    }

    public function show(TourListing $tourListing): JsonResponse
    {
        abort_unless($tourListing->status === 'published' && $tourListing->is_active, 404);

        $tourListing->loadMissing('guide');

        return response()->json([
            'ok' => true,
            'tour' => $this->presentTour($tourListing),
        ]);
    }

    private function presentTour(TourListing $tourListing): array
    {
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

        return [
            'id' => (string) $tourListing->id,
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
            'priceType' => $tourListing->price_type === 'per_group' ? 'Per group' : 'Per person',
            'minGuests' => (int) ($tourListing->min_guests ?? 1),
            'maxGuests' => (int) ($tourListing->max_guests ?? 10),
            'reservationType' => $tourListing->reservation_type === 'manual' ? 'Manual approval' : 'Instant booking',
            'freeCancellation' => (bool) $tourListing->free_cancellation,
            'reserveNowPayLater' => (bool) $tourListing->reserve_now_pay_later,
            'includes' => array_values(array_filter(array_map(function ($value) {
                return trim((string) $value);
            }, is_array($tourListing->includes) ? $tourListing->includes : []))),
            'excludes' => (string) ($tourListing->excludes ?: ''),
            'requirements' => (string) ($tourListing->requirements ?: ''),
            'safetyInfo' => (string) ($tourListing->safety_info ?: ''),
            'guideVerified' => false,
            'guideExperienceYears' => 1,
            'guideContact' => (string) (($guide && $guide->phone) ? $guide->phone : ''),
            'guideSocial' => '',
            'weatherSuitability' => (string) ($tourListing->weather_suitability ?: ''),
            'bestSeason' => (string) ($tourListing->best_season ?: ''),
            'childFriendly' => (bool) $tourListing->child_friendly,
            'petFriendly' => (bool) $tourListing->pet_friendly,
            'status' => (string) $tourListing->status,
            'isActive' => (bool) $tourListing->is_active,
        ];
    }
}
