<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\TourRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Contracts\View\View;

class TouristController extends Controller
{
    public function index(): View
    {
        return view('index');
    }

    public function portal(): RedirectResponse
    {
        return redirect()->route('explore');
    }

    public function explore(): View
    {
        return view('tourist.explore');
    }

    public function likes(): View
    {
        return view('likes');
    }

    public function myPosts(Request $request): View
    {
        $user = $request->user();

        return view('tourist.my-posts', [
            'stats' => [
                'total_requests' => TourRequest::query()
                    ->where('tourist_id', $user->id)
                    ->count(),
                'open_requests' => TourRequest::query()
                    ->where('tourist_id', $user->id)
                    ->whereIn('status', ['open', 'negotiating'])
                    ->count(),
                'selected_guides' => TourRequest::query()
                    ->where('tourist_id', $user->id)
                    ->whereNotNull('selected_guide_id')
                    ->count(),
                'completed' => Booking::query()
                    ->where('tourist_id', $user->id)
                    ->where('status', 'completed')
                    ->count(),
            ],
        ]);
    }
}
