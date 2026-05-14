<?php

namespace App\Http\Controllers\Guide;

use App\Http\Controllers\Controller;
use App\Models\Availability;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class AvailabilityController extends Controller
{
    public function index(Request $request): View
    {
        $availabilities = Availability::query()
            ->where('guide_id', $request->user()->id)
            ->with('listing')
            ->orderBy('date')
            ->paginate(30);

        return view('legacy.pages.availability', ['availabilities' => $availabilities]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): View
    {
        return view('legacy.pages.availability');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $payload = $request->validate([
            'tour_listing_id' => ['nullable', 'exists:tour_listings,id'],
            'date' => ['required', 'date'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'status' => ['nullable', 'in:available,unavailable,booked'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        $payload['guide_id'] = $request->user()->id;
        Availability::create($payload);

        return back()->with('status', 'Availability saved.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Availability $availability): View
    {
        abort_unless($availability->guide_id === Auth::id(), 403);

        return view('legacy.pages.availability', ['availability' => $availability]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Availability $availability): View
    {
        abort_unless($availability->guide_id === Auth::id(), 403);

        return view('legacy.pages.availability', ['availability' => $availability]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Availability $availability): RedirectResponse
    {
        abort_unless($availability->guide_id === Auth::id(), 403);

        $payload = $request->validate([
            'date' => ['required', 'date'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'status' => ['nullable', 'in:available,unavailable,booked'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        $availability->update($payload);

        return back()->with('status', 'Availability updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Availability $availability): RedirectResponse
    {
        abort_unless($availability->guide_id === Auth::id(), 403);
        $availability->delete();

        return back()->with('status', 'Availability removed.');
    }
}
