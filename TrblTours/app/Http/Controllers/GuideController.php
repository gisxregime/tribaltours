<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;

class GuideController extends Controller
{
    public function dashboard(): View
    {
        return view('guide.dashboard');
    }

    public function requestPostFeed(): View
    {
        return view('guide.request-post-feed');
    }

    public function bookingRequests(): View
    {
        return view('guide.booking-requests');
    }

    public function tours(): View
    {
        return view('guide.tours');
    }

    public function profile(): View
    {
        return view('guide.profile');
    }

    public function settings(): View
    {
        return view('guide.settings');
    }

    public function availability(): View
    {
        return view('guide.availability');
    }
}
