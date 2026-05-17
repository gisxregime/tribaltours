<?php

namespace App\Http\Controllers\Guide;

use App\Events\BookingStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Support\DomainNotification;
use Illuminate\Support\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
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
            if ($booking->confirmed_booking_date === null || strtolower((string) ($booking->payment_status ?? '')) !== 'paid') {
                return response()->json([
                    'ok' => false,
                    'message' => 'Cannot mark completed until payment is paid and booking date is confirmed.',
                ], 422);
            }
            $payload['completed_at'] = now();
        }

        $booking->update($payload);
        $this->syncLifecycleFields($booking);
        $booking->save();

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

    public function accept(Request $request, Booking $booking): JsonResponse
    {
        abort_unless($booking->guide_id === Auth::id(), 403);

        if (!$booking->canAccept()) {
            return response()->json([
                'ok' => false,
                'message' => 'This booking cannot be accepted in its current state.',
            ], 422);
        }

        $booking->booking_status = 'accepted';
        $booking->approved_at = $booking->approved_at ?: now();
        $booking->save();

        DomainNotification::notifyUser(
            $booking->tourist,
            'booking.accepted',
            'Your booking has been accepted by the guide.',
            ['bookingId' => (string) $booking->id]
        );

        event(new BookingStatusUpdated($booking->fresh(['tourist', 'tourListing'])));

        return response()->json([
            'ok' => true,
            'booking' => $this->presentBooking($booking->fresh(['tourist', 'tourListing'])),
        ]);
    }

    public function decline(Request $request, Booking $booking): JsonResponse
    {
        abort_unless($booking->guide_id === Auth::id(), 403);

        if (!$booking->canDecline()) {
            return response()->json([
                'ok' => false,
                'message' => 'This booking cannot be declined in its current state.',
            ], 422);
        }

        $booking->booking_status = 'declined';
        $booking->declined_at = $booking->declined_at ?: now();
        $booking->save();

        DomainNotification::notifyUser(
            $booking->tourist,
            'booking.declined',
            'Your booking has been declined by the guide.',
            ['bookingId' => (string) $booking->id]
        );

        event(new BookingStatusUpdated($booking->fresh(['tourist', 'tourListing'])));

        return response()->json([
            'ok' => true,
            'booking' => $this->presentBooking($booking->fresh(['tourist', 'tourListing'])),
        ]);
    }

    public function setDate(Request $request, Booking $booking): JsonResponse
    {
        abort_unless($booking->guide_id === Auth::id(), 403);

        $payload = $request->validate([
            'tour_start_date' => ['required', 'date'],
            'tour_start_time' => ['nullable', 'string', 'max:60'],
            'confirm' => ['nullable', 'boolean'],
        ]);

        $scheduledAt = Carbon::parse((string) $payload['tour_start_date']);
        $timeRaw = trim((string) ($payload['tour_start_time'] ?? ''));
        if ($timeRaw !== '') {
            try {
                $time = Carbon::parse($timeRaw);
                $scheduledAt->setTime((int) $time->format('H'), (int) $time->format('i'), 0);
                $booking->booked_for_time = $time->format('g:i A');
            } catch (\Throwable $_error) {
                $booking->booked_for_time = $timeRaw;
                $scheduledAt->endOfDay();
            }
        } else {
            $scheduledAt->endOfDay();
        }

        if (Schema::hasColumn('bookings', 'tour_start_date')) {
            $booking->tour_start_date = $scheduledAt;
        }

        if (Schema::hasColumn('bookings', 'confirmed_booking_date') && ($payload['confirm'] ?? false) === true) {
            $booking->confirmed_booking_date = $scheduledAt;
        } elseif (Schema::hasColumn('bookings', 'confirmed_booking_date')) {
            $booking->confirmed_booking_date = null;
        }

        $this->syncLifecycleFields($booking);
        $booking->save();

        DomainNotification::notifyUser(
            $booking->tourist,
            'booking.date.proposed',
            'Guide proposed a tour schedule update for booking ' . trim((string) $booking->booking_reference) . '.',
            [
                'bookingId' => (string) $booking->id,
                'tourStartDate' => optional($booking->tour_start_date)->toISOString(),
                'confirmedBookingDate' => optional($booking->confirmed_booking_date)->toISOString(),
            ]
        );

        event(new BookingStatusUpdated($booking->fresh(['guide', 'tourListing'])));

        return response()->json([
            'ok' => true,
            'booking' => $this->presentBooking($booking->fresh(['tourListing', 'tourist'])),
        ]);
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
        $currentBookingStatus = (string) ($booking->booking_status ?? 'pending');

        // Format tour date and time properly - fix the "Jan 1, 1970" bug
        $tourDateFormatted = 'Date not set';
        $tourTimeFormatted = 'Time not set';

        if ($booking->tour_date !== null) {
            try {
                $tourDateFormatted = optional($booking->tour_date)->format('M d, Y') ?? 'Date not set';
            } catch (\Throwable $_) {
                $tourDateFormatted = 'Date not set';
            }
        }

        if ($booking->tour_time !== null && trim((string) $booking->tour_time) !== '') {
            try {
                $tourTimeFormatted = \Illuminate\Support\Carbon::parse($booking->tour_time)->format('g:i A');
            } catch (\Throwable $_) {
                $tourTimeFormatted = (string) $booking->tour_time;
            }
        }

        return [
            'id' => (string) $booking->id,
            'tourId' => $tour ? (string) $tour->id : null,
            'tourTitle' => (string) ($tour->title ?? 'Custom Tour Booking'),
            'tourImage' => $this->resolveAssetPath($tour?->cover_image_path, '/images/pangasinan.jpg'),
            'touristName' => trim((string) ($tourist->name ?? 'Tourist')),
            'touristAvatar' => $this->resolveAssetPath($tourist?->avatar_path, '/images/manila.jpg'),
            'bookingDate' => optional($booking->booked_for_date)->toDateString() ?? 'Date not set',
            'tourDate' => $tourDateFormatted,
            'tourTime' => $tourTimeFormatted,
            'tourDateRaw' => optional($booking->tour_date)->toDateString(),
            'tourTimeRaw' => (string) ($booking->tour_time ?? ''),
            'tourStartDate' => optional($booking->tour_start_date)->toISOString(),
            'confirmedBookingDate' => optional($booking->confirmed_booking_date)->toISOString(),
            'paymentReceivedAt' => optional($booking->payment_received_at ?? $booking->paid_at)->toISOString(),
            'paymentStatus' => (string) ($booking->payment_status ?? 'unpaid'),
            'paymentMethod' => (string) ($booking->payment_method ?? ''),
            'bookingStatus' => $currentBookingStatus,
            'hasBookingSchedule' => $booking->tour_date !== null && $booking->tour_time !== null,
            'canAccept' => $booking->canAccept(),
            'canDecline' => $booking->canDecline(),
            'canMarkCompleted' => $booking->canMarkCompleted(),
            'guests' => (int) ($booking->guest_count ?? 1) . ' guest' . ((int) ($booking->guest_count ?? 1) > 1 ? 's' : ''),
            'guestCount' => (int) ($booking->guest_count ?? 1),
            'status' => ucfirst((string) $booking->status),
            'statusRaw' => (string) $booking->status,
            'total' => (float) ($booking->total_amount ?? 0),
            'reference' => (string) $booking->booking_reference,
            'updatedAt' => optional($booking->updated_at)->toISOString(),
        ];
    }

    private function syncLifecycleFields(Booking $booking): void
    {
        if (!Schema::hasColumn('bookings', 'booking_status')) {
            return;
        }

        $isPaid = strtolower((string) ($booking->payment_status ?? '')) === 'paid';
        $hasSchedule = $booking->tour_date !== null && $booking->tour_time !== null;
        $currentState = (string) ($booking->booking_status ?? 'pending');

        // Terminal states should not transition
        if (in_array($currentState, ['completed', 'declined', 'cancelled'], true)) {
            return;
        }

        // State transitions based on payment and schedule
        if ($currentState === 'pending') {
            // Stay in pending until explicit accept
        } elseif ($currentState === 'accepted') {
            if ($hasSchedule) {
                $booking->booking_status = 'schedule_confirmed';
                $booking->schedule_confirmed_at = $booking->schedule_confirmed_at ?: now();
            }
        } elseif ($currentState === 'schedule_confirmed') {
            if ($isPaid) {
                $booking->booking_status = 'paid';
                $booking->payment_received_at = $booking->payment_received_at ?: now();
            } else {
                $booking->booking_status = 'waiting_payment';
            }
        } elseif ($currentState === 'waiting_payment') {
            if ($isPaid) {
                $booking->booking_status = 'paid';
                $booking->payment_received_at = $booking->payment_received_at ?: now();
            }
        }
    }

    private function resolveAssetPath(?string $path, string $fallback): string
    {
        $value = trim((string) $path);
        if ($value === '') {
            return $fallback;
        }

        if (preg_match('/^https?:\/\//i', $value) === 1 || str_starts_with($value, '/')) {
            return $value;
        }

        if (str_starts_with($value, 'images/') || str_starts_with($value, 'storage/')) {
            return '/' . $value;
        }

        return '/storage/' . ltrim($value, '/');
    }
}
