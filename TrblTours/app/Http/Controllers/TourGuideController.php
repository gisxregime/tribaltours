<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;

class TourGuideController extends Controller
{
    public function dashboard(): View
    {
        return view('guide.dashboard');
    }

    public function requestPostFeed(): View
    {
        return view('guide.request-post-feed');
    }

    public function messages(): View
    {
        return view('guide.messages');
    }

    public function profile(): View
    {
        return view('guide.profile');
    }

    public function settings(): View
    {
        return view('guide.settings');
    }
}
