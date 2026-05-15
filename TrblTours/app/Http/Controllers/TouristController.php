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
            ->where(function ($query) {
                $query->where(function ($inner) {
                    $inner->whereNull('selected_guide_id')
                        ->whereIn('status', ['open', 'negotiating'])
                        ->where('is_active', true);
                })->orWhereNotNull('selected_guide_id');
            })
            ->count();

        $openRequests = TourRequest::query()
            ->where('tourist_id', $user->id)
            ->whereIn('status', ['open', 'negotiating'])
            ->where('is_active', true)
            ->whereNull('selected_guide_id')
            ->count();

        $selectedGuides = TourRequest::query()
            ->where('tourist_id', $user->id)
            ->whereNotNull('selected_guide_id')
            ->count();

        return view('tourist.my-posts', [
            'stats' => [
                'total_requests' => $totalRequests,
                'open_requests' => $openRequests,
                'selected_guides' => $selectedGuides,
            ],
        ]);
    }
}
