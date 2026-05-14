<?php

namespace App\Http\Controllers\Guide;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Models\TourListing;
use Illuminate\Http\Request;
use Illuminate\View\View;

class GuideDashboardController extends Controller
{
    public function index(Request $request): View
    {
        $guideId = $request->user()->id;
        $listingIds = TourListing::query()->where('guide_id', $guideId)->pluck('id');

        $stats = [
            'my_tours' => TourListing::query()->where('guide_id', $guideId)->count(),
            'pending_requests' => Booking::query()->where('guide_id', $guideId)->where('status', 'pending')->count(),
            'accepted' => Booking::query()->where('guide_id', $guideId)->whereIn('status', ['accepted', 'confirmed', 'completed', 'booked'])->count(),
            'total_earnings' => (float) Booking::query()->where('guide_id', $guideId)->whereIn('status', ['accepted', 'confirmed', 'completed', 'booked'])->sum('total_amount'),
            'average_rating' => (float) Review::query()->whereIn('tour_listing_id', $listingIds)->avg('rating'),
        ];

        return view('legacy.pages.dashboard', [
            'dashboardStats' => $stats,
        ]);
    }
}
