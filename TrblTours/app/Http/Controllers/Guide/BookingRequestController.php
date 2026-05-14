<?php

namespace App\Http\Controllers\Guide;

use App\Events\BookingStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Support\DomainNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class BookingRequestController extends Controller
{
    public function index(Request $request): View|JsonResponse
    {
        $query = Booking::query()
            ->where('guide_id', $request->user()->id)
            ->with(['tourListing', 'tourist'])
            ->latest();

        if ($request->expectsJson() || $request->wantsJson()) {
            $bookings = $query->limit(120)->get()->map(function (Booking $booking) {
                return $this->presentBooking($booking);
            })->values();

            return response()->json([
                'ok' => true,
                'bookings' => $bookings,
                'pusher' => [
                    'key' => env('PUSHER_APP_KEY'),
                    'cluster' => env('PUSHER_APP_CLUSTER', 'ap1'),
                ],
            ]);
        }

        $bookings = $query->paginate(20);

        return view('legacy.pages.booking-requests', ['bookings' => $bookings]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): RedirectResponse
    {
        return redirect()->route('guide.booking-requests.index');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        return redirect()->route('guide.booking-requests.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Booking $booking): View
    {
        abort_unless($booking->guide_id === Auth::id(), 403);

        return view('legacy.pages.booking-requests', ['booking' => $booking->load(['tourListing', 'tourist'])]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Booking $booking): RedirectResponse
    {
        return redirect()->route('guide.booking-requests.show', $booking);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Booking $booking): RedirectResponse|JsonResponse
    {
        abort_unless($booking->guide_id === Auth::id(), 403);

        $payload = $request->validate([
            'status' => ['required', 'in:pending,accepted,declined,confirmed,completed,cancelled'],
            'payment_status' => ['nullable', 'in:unpaid,partial,paid,refunded'],
            'notes' => ['nullable', 'string'],
        ]);

        if ($payload['status'] === 'accepted') {
            $payload['approved_at'] = now();
        }
        if ($payload['status'] === 'declined') {
            $payload['declined_at'] = now();
        }
        if ($payload['status'] === 'cancelled') {
            $payload['cancelled_at'] = now();
        }
        if ($payload['status'] === 'completed') {
            $payload['completed_at'] = now();
        }

        $booking->update($payload);

        $booking->loadMissing(['tourist', 'tourListing']);
        $tourTitle = trim((string) ($booking->tourListing?->title ?? 'your booking'));
        $status = strtolower((string) $booking->status);
        $notificationType = match ($status) {
            'accepted', 'confirmed' => 'booking.accepted',
            'declined' => 'booking.rejected',
            'cancelled' => 'booking.cancelled',
            'completed' => 'booking.completed',
            default => 'booking.updated',
        };

        DomainNotification::notifyUser(
            $booking->tourist,
            $notificationType,
            'Your booking status changed to ' . strtoupper((string) $booking->status) . ' for ' . $tourTitle . '.',
            [
                'bookingId' => (string) $booking->id,
                'status' => (string) $booking->status,
            ]
        );

        event(new BookingStatusUpdated($booking->fresh(['guide', 'tourListing'])));

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'ok' => true,
                'booking' => $this->presentBooking($booking->fresh(['tourListing', 'tourist'])),
            ]);
        }

        return back()->with('status', 'Booking request updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Booking $booking): RedirectResponse
    {
        abort_unless($booking->guide_id === Auth::id(), 403);
        $booking->delete();

        return back()->with('status', 'Booking removed.');
    }

    private function presentBooking(Booking $booking): array
    {
        $tour = $booking->tourListing;
        $tourist = $booking->tourist;

        return [
            'id' => (string) $booking->id,
            'tourId' => $tour ? (string) $tour->id : null,
            'tourTitle' => (string) ($tour->title ?? 'Custom Tour Booking'),
            'tourImage' => (string) ($tour->cover_image_path ?? 'images/pangasinan.jpg'),
            'touristName' => trim((string) ($tourist->name ?? 'Tourist')),
            'touristAvatar' => (string) (($tourist && $tourist->avatar_path) ? $tourist->avatar_path : 'images/manila.jpg'),
            'bookingDate' => optional($booking->booked_for_date)->toDateString(),
            'guests' => (int) ($booking->guest_count ?? 1) . ' guest' . ((int) ($booking->guest_count ?? 1) > 1 ? 's' : ''),
            'guestCount' => (int) ($booking->guest_count ?? 1),
            'status' => ucfirst((string) $booking->status),
            'statusRaw' => (string) $booking->status,
            'total' => (float) ($booking->total_amount ?? 0),
            'reference' => (string) $booking->booking_reference,
            'updatedAt' => optional($booking->updated_at)->toISOString(),
        ];
    }
}
