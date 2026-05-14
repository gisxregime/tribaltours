<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Report;
use App\Models\TourListing;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\View\View;

class AdminDashboardController extends Controller
{
    public function index(Request $request): View
    {
        $stats = [
            'users_total' => User::query()->count(),
            'guides_pending_verification' => User::query()->where('role', 'guide')->where('guide_verification_status', 'pending')->count(),
            'active_listings' => TourListing::query()->where('status', 'published')->count(),
            'bookings_total' => Booking::query()->count(),
            'open_reports' => Report::query()->whereIn('status', ['open', 'investigating'])->count(),
        ];

        return view('admin.dashboard', ['adminStats' => $stats]);
    }
}
