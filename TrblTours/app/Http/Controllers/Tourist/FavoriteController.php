<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class FavoriteController extends Controller
{
    public function index(Request $request): View
    {
        $favorites = Favorite::query()
            ->with('listing')
            ->where('tourist_id', $request->user()->id)
            ->latest()
            ->paginate(20);

        return view('legacy.root.likes', ['favorites' => $favorites]);
    }

    public function create(): RedirectResponse
    {
        return redirect()->route('tourist.favorites.index');
    }

    public function mine(Request $request): JsonResponse
    {
        $listingIds = Favorite::query()
            ->where('tourist_id', $request->user()->id)
            ->pluck('tour_listing_id')
            ->map(function ($id) {
                return (string) $id;
            })
            ->values();

        return response()->json([
            'ok' => true,
            'likes' => $listingIds,
        ]);
    }

    public function toggle(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'tour_listing_id' => ['required', 'exists:tour_listings,id'],
        ]);

        $favorite = Favorite::query()->where([
            'tourist_id' => $request->user()->id,
            'tour_listing_id' => $payload['tour_listing_id'],
        ])->first();

        if ($favorite) {
            $favorite->delete();

            return response()->json([
                'ok' => true,
                'liked' => false,
            ]);
        }

        Favorite::query()->create([
            'tourist_id' => $request->user()->id,
            'tour_listing_id' => $payload['tour_listing_id'],
        ]);

        return response()->json([
            'ok' => true,
            'liked' => true,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $payload = $request->validate([
            'tour_listing_id' => ['required', 'exists:tour_listings,id'],
        ]);

        Favorite::firstOrCreate([
            'tourist_id' => $request->user()->id,
            'tour_listing_id' => $payload['tour_listing_id'],
        ]);

        return back()->with('status', 'Added to favorites.');
    }

    public function show(Favorite $favorite): RedirectResponse
    {
        abort_unless($favorite->tourist_id === Auth::id(), 403);

        return redirect()->route('tourist.favorites.index');
    }

    public function edit(Favorite $favorite): RedirectResponse
    {
        abort_unless($favorite->tourist_id === Auth::id(), 403);

        return redirect()->route('tourist.favorites.index');
    }

    public function update(Request $request, Favorite $favorite): RedirectResponse
    {
        abort_unless($favorite->tourist_id === Auth::id(), 403);

        return back()->with('status', 'Favorite already up to date.');
    }

    public function destroy(Favorite $favorite): RedirectResponse
    {
        abort_unless($favorite->tourist_id === Auth::id(), 403);
        $favorite->delete();

        return back()->with('status', 'Favorite removed.');
    }
}
