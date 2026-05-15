<?php

namespace App\Http\Controllers;

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

        $totalRequests = TourRequest::query()
            ->where('tourist_id', $user->id)
            ->count();

        $openRequests = TourRequest::query()
            ->where('tourist_id', $user->id)
            ->where('status', 'open')
            ->whereNull('selected_guide_id')
            ->count();

        $selectedGuides = TourRequest::query()
            ->where('tourist_id', $user->id)
            ->whereNotNull('selected_guide_id')
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->count();

        $completedRequests = TourRequest::query()
            ->where('tourist_id', $user->id)
            ->where('status', 'completed')
            ->count();

        return view('tourist.my-posts', [
            'stats' => [
                'total_requests' => $totalRequests,
                'open_requests' => $openRequests,
                'selected_guides' => $selectedGuides,
                'completed' => $completedRequests,
            ],
        ]);
    }
}
