<?php

namespace App\Http\Controllers\Guide;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Models\TourListing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class GuideDashboardController extends Controller
{
    public function index(Request $request): View|JsonResponse
    {
        $guideId = (int) $request->user()->id;
        $stats = $this->buildStats($guideId);

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'ok' => true,
                'stats' => $stats,
                'reviews' => $this->buildReviews($guideId),
            ]);
        }

        return view('legacy.pages.dashboard', [
            'dashboardStats' => $stats,
        ]);
    }

    public function earningsBreakdown(Request $request): View
    {
        return view('legacy.pages.earnings-breakdown');
    }

    public function requestPayments(Request $request): View
    {
        return view('legacy.pages.tour-request-payments');
    }

    public function reviewsPage(Request $request): View
    {
        return view('legacy.pages.guide-reviews');
    }

    private function buildStats(int $guideId): array
    {
        $listingIds = TourListing::query()->where('guide_id', $guideId)->pluck('id');

        return [
            'my_tours' => TourListing::query()->where('guide_id', $guideId)->count(),
            'pending_requests' => Booking::query()->where('guide_id', $guideId)->where('status', 'pending')->count(),
            'accepted' => Booking::query()->where('guide_id', $guideId)->whereIn('status', ['accepted', 'confirmed', 'completed', 'booked'])->count(),
            'total_earnings' => (float) Booking::query()->where('guide_id', $guideId)->whereIn('status', ['accepted', 'confirmed', 'completed', 'booked'])->sum('total_amount'),
            'average_rating' => round((float) Review::query()->whereIn('tour_listing_id', $listingIds)->where('is_public', true)->avg('rating'), 1),
        ];
    }

    private function buildReviews(int $guideId): array
    {
        return Review::query()
            ->with(['listing:id,title,cover_image_path', 'booking:id,booked_for_date,guest_count', 'tourist:id,name,avatar_path'])
            ->where('guide_id', $guideId)
            ->where('is_public', true)
            ->latest('created_at')
            ->limit(80)
            ->get()
            ->map(function (Review $review) {
                $touristName = trim((string) ($review->tourist?->name ?? 'Tourist'));
                $guestCount = (int) ($review->booking?->guest_count ?? 1);

                return [
                    'id' => (string) $review->id,
                    'tourId' => (string) ($review->tour_listing_id ?? ''),
                    'listingTitle' => (string) ($review->listing?->title ?? 'Tour Listing'),
                    'listingImage' => (string) ($review->listing?->cover_image_path ?? 'images/pangasinan.jpg'),
                    'reviewer' => $touristName !== '' ? $touristName : 'Tourist',
                    'touristAvatar' => $this->resolveAvatarPath($review->tourist?->avatar_path),
                    'reviewerAvatar' => $this->resolveAvatarPath($review->tourist?->avatar_path),
                    'rating' => (int) ($review->rating ?? 0),
                    'comment' => (string) ($review->comment ?? ''),
                    'title' => (string) ($review->title ?? ''),
                    'bookedDate' => optional($review->booking?->booked_for_date)->toDateString(),
                    'guests' => $guestCount . ' guest' . ($guestCount > 1 ? 's' : ''),
                    'createdAt' => optional($review->created_at)->toISOString(),
                ];
            })
            ->values()
            ->all();
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
