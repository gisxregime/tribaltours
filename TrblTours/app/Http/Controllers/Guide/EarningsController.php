<?php

namespace App\Http\Controllers\Guide;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\View\View;

class EarningsController extends Controller
{
    public function index(Request $request): View
    {
        $bookings = Booking::query()
            ->where('guide_id', $request->user()->id)
            ->whereIn('status', ['accepted', 'confirmed', 'completed', 'booked'])
            ->latest()
            ->paginate(30);

        $summary = [
            'total_earnings' => (float) Booking::query()
                ->where('guide_id', $request->user()->id)
                ->whereIn('status', ['accepted', 'confirmed', 'completed', 'booked'])
                ->sum('total_amount'),
            'total_bookings' => Booking::query()
                ->where('guide_id', $request->user()->id)
                ->count(),
        ];

        return view('legacy.pages.dashboard', [
            'earningsBookings' => $bookings,
            'earningsSummary' => $summary,
        ]);
    }
}
