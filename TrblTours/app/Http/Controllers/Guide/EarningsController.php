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
        $eligibleEarningsBookings = Booking::query()
            ->where('guide_id', $request->user()->id)
            ->where('payment_status', 'paid')
            ->whereNotIn('status', ['cancelled', 'declined']);

        $bookings = Booking::query()
            ->where('guide_id', $request->user()->id)
            ->where('payment_status', 'paid')
            ->whereNotIn('status', ['cancelled', 'declined'])
            ->latest()
            ->paginate(30);

        $summary = [
            'total_earnings' => (float) (clone $eligibleEarningsBookings)->sum('total_amount'),
            'total_bookings' => (clone $eligibleEarningsBookings)->count(),
        ];

        return view('legacy.pages.dashboard', [
            'earningsBookings' => $bookings,
            'earningsSummary' => $summary,
        ]);
    }
}
