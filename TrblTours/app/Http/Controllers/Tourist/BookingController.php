<?php

namespace App\Http\Controllers\Tourist;

use App\Events\BookingStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\TourListing;
use App\Support\DomainNotification;
use Illuminate\Support\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\View\View;

class BookingController extends Controller
{
    public function index(Request $request): View|JsonResponse
    {
        $query = $request->user()->bookingsAsTourist()->with(['tourListing', 'guide'])->latest();

        if ($request->expectsJson() || $request->wantsJson()) {
            $bookings = $query->limit(120)->get()->map(function (Booking $booking) {
                return $this->presentBooking($booking);
            })->values();

            return response()->json([
                'ok' => true,
                'bookings' => $bookings,
            ]);
        }

        $bookings = $query->paginate(12);

        return view('legacy.root.my-bookings', ['bookings' => $bookings]);
    }

    public function mine(Request $request): JsonResponse
    {
        $bookings = $request->user()->bookingsAsTourist()
            ->with(['tourListing', 'guide'])
            ->latest()
            ->limit(120)
            ->get()
            ->map(function (Booking $booking) {
                return $this->presentBooking($booking);
            })
            ->values();

        return response()->json([
            'ok' => true,
            'bookings' => $bookings,
        ]);
    }

    public function create(): View
    {
        return view('legacy.root.booking-details');
    }

    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $payload = $request->validate([
            'tour_listing_id' => ['required', 'exists:tour_listings,id'],
            'booked_for_date' => ['nullable', 'date'],
            'booked_for_time' => ['nullable', 'string', 'max:60'],
            'guest_count' => ['nullable', 'integer', 'min:1', 'max:100'],
            'notes' => ['nullable', 'string'],
            'client_token' => ['nullable', 'string', 'max:120'],
            'payment_status' => ['nullable', 'in:unpaid,partial,paid,refunded'],
            'payment_method' => ['nullable', 'string', 'max:120'],
            'payment_reference' => ['nullable', 'string', 'max:120'],
        ]);

        $listing = TourListing::query()->findOrFail($payload['tour_listing_id']);
        abort_unless($listing->status === 'published' && (bool) $listing->is_active, 422);

        $clientToken = trim((string) ($payload['client_token'] ?? ''));
        if ($clientToken !== '') {
            $existing = Booking::query()
                ->where('tourist_id', $request->user()->id)
                ->where('client_token', $clientToken)
                ->with(['guide', 'tourListing'])
                ->first();

            if ($existing) {
                return response()->json([
                    'ok' => true,
                    'booking' => $this->presentBooking($existing),
                    'deduplicated' => true,
                ]);
            }
        }

        $guestCount = (int) ($payload['guest_count'] ?? 1);
        $unitPrice = (float) $listing->price;
        $total = $listing->price_type === 'per_group' ? $unitPrice : $unitPrice * $guestCount;
        $paymentStatus = (string) ($payload['payment_status'] ?? 'unpaid');

        $booking = Booking::create([
            'booking_reference' => 'TRBL-' . strtoupper(Str::random(10)),
            'client_token' => $clientToken !== '' ? $clientToken : null,
            'tourist_id' => $request->user()->id,
            'guide_id' => $listing->guide_id,
            'tour_listing_id' => $listing->id,
            'booked_for_date' => $payload['booked_for_date'] ?? null,
            'booked_for_time' => $payload['booked_for_time'] ?? null,
            'guest_count' => $guestCount,
            'price_snapshot' => $unitPrice,
            'total_amount' => $total,
            'payment_status' => $paymentStatus,
            'payment_method' => isset($payload['payment_method']) ? trim((string) $payload['payment_method']) : null,
            'payment_reference' => isset($payload['payment_reference']) ? trim((string) $payload['payment_reference']) : null,
            'status' => 'pending',
            'reservation_type' => $listing->reservation_type,
            'notes' => $payload['notes'] ?? null,
            'paid_at' => $paymentStatus === 'paid' ? now() : null,
        ]);

        $booking->loadMissing(['guide', 'tourListing']);
        DomainNotification::notifyUser(
            $booking->guide,
            'booking.submitted',
            trim((string) $request->user()->name) . ' requested a booking for "' . trim((string) $listing->title) . '".',
            [
                'bookingId' => (string) $booking->id,
                'tourId' => (string) $listing->id,
            ]
        );

        if ($paymentStatus === 'paid') {
            DomainNotification::notifyUser(
                $request->user(),
                'payment.successful',
                'Payment successful for "' . trim((string) $listing->title) . '".',
                [
                    'bookingId' => (string) $booking->id,
                    'tourId' => (string) $listing->id,
                ]
            );
        }

        event(new BookingStatusUpdated($booking->fresh(['guide', 'tourListing'])));

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'ok' => true,
                'booking' => $this->presentBooking($booking->fresh(['guide', 'tourListing'])),
                'deduplicated' => false,
            ], 201);
        }

        return back()->with('status', 'Booking request submitted.');
    }

    public function show(Booking $booking): View
    {
        abort_unless($booking->tourist_id === Auth::id(), 403);

        return view('legacy.root.booking-details', ['booking' => $booking->load(['tourListing', 'guide'])]);
    }

    public function edit(Booking $booking): View
    {
        abort_unless($booking->tourist_id === Auth::id(), 403);

        return view('legacy.root.booking-details', ['booking' => $booking]);
    }

    public function update(Request $request, Booking $booking): RedirectResponse
    {
        abort_unless($booking->tourist_id === Auth::id(), 403);

        $payload = $request->validate([
            'booked_for_date' => ['nullable', 'date'],
            'booked_for_time' => ['nullable', 'string', 'max:60'],
            'guest_count' => ['nullable', 'integer', 'min:1', 'max:100'],
            'notes' => ['nullable', 'string'],
            'status' => ['nullable', 'in:cancelled'],
        ]);

        if (($payload['status'] ?? null) === 'cancelled') {
            if (!$this->canCancelBooking($booking)) {
                return back()->withErrors(['status' => 'Cancellation is only allowed within 24 hours after booking.']);
            }
            $payload['cancelled_at'] = now();
        }

        $booking->update($payload);

        event(new BookingStatusUpdated($booking->fresh(['guide', 'tourListing'])));

        return back()->with('status', 'Booking updated.');
    }

    public function transition(Request $request, Booking $booking): JsonResponse
    {
        abort_unless($booking->tourist_id === Auth::id(), 403);

        $payload = $request->validate([
            'action' => ['required', 'in:cancel,mark_completed'],
        ]);

        $action = $payload['action'];
        if ($action === 'cancel') {
            if (!in_array($booking->status, ['pending', 'accepted', 'confirmed'], true)) {
                return response()->json([
                    'ok' => false,
                    'message' => 'Only pending or booked requests can be cancelled.',
                ], 422);
            }

            if (!$this->canCancelBooking($booking)) {
                return response()->json([
                    'ok' => false,
                    'message' => 'Cancellation is only allowed within 24 hours after booking submission.',
                    'remainingSeconds' => 0,
                ], 422);
            }

            $booking->status = 'cancelled';
            $booking->cancelled_at = Carbon::now();
        }

        if ($action === 'mark_completed') {
            if (!in_array($booking->status, ['accepted', 'confirmed'], true)) {
                return response()->json([
                    'ok' => false,
                    'message' => 'Only booked tours can be marked completed.',
                ], 422);
            }
            $booking->status = 'completed';
            $booking->completed_at = Carbon::now();
        }

        $booking->save();

        $booking->loadMissing(['guide', 'tourListing']);
        DomainNotification::notifyUser(
            $booking->guide,
            $action === 'cancel' ? 'booking.cancelled' : 'booking.completed',
            trim((string) $request->user()->name) . ' changed booking status to ' . strtoupper((string) $booking->status) . '.',
            [
                'bookingId' => (string) $booking->id,
                'status' => (string) $booking->status,
            ]
        );

        event(new BookingStatusUpdated($booking->fresh(['guide', 'tourListing'])));

        return response()->json([
            'ok' => true,
            'booking' => $this->presentBooking($booking->fresh(['guide', 'tourListing'])),
        ]);
    }

    public function destroy(Booking $booking): RedirectResponse
    {
        abort_unless($booking->tourist_id === Auth::id(), 403);
        $booking->delete();

        return back()->with('status', 'Booking removed.');
    }

    private function presentBooking(Booking $booking): array
    {
        $listing = $booking->tourListing;
        $guide = $booking->guide;
        $cancellableUntil = optional($booking->created_at)->copy()?->addDay();
        $secondsLeft = $this->cancellationSecondsLeft($booking);

        $state = match ($booking->status) {
            'accepted', 'confirmed' => 'booked',
            'completed' => 'completed',
            'cancelled', 'declined' => 'cancelled',
            default => 'pending',
        };

        $coverImage = $this->normalizeAssetPath($listing?->cover_image_path, 'images/pangasinan.jpg');
        $guideAvatar = $this->normalizeAssetPath($guide?->avatar_path, 'images/manila.jpg');

        return [
            'id' => (string) $booking->id,
            'bookingId' => (string) $booking->id,
            'reference' => (string) $booking->booking_reference,
            'tourId' => $listing ? (string) $listing->id : '',
            'tourTitle' => (string) ($listing->title ?? 'Custom Tour Booking'),
            'image' => $coverImage,
            'guideName' => trim((string) ($guide->name ?? 'Guide')),
            'guideAvatar' => $guideAvatar,
            'bookingDate' => optional($booking->booked_for_date)->toDateString(),
            'guestCount' => (int) ($booking->guest_count ?? 1),
            'total' => (float) ($booking->total_amount ?? 0),
            'paymentStatus' => (string) ($booking->payment_status ?? 'unpaid'),
            'paymentMethod' => (string) ($booking->payment_method ?? ''),
            'paymentReference' => (string) ($booking->payment_reference ?? ''),
            'status' => (string) ($booking->status ?? 'pending'),
            'state' => $state,
            'cancellableUntil' => $cancellableUntil?->toISOString(),
            'cancellationSecondsLeft' => $secondsLeft,
            'isCancellable' => $this->canCancelBooking($booking),
            'cancelledAt' => optional($booking->cancelled_at)->toISOString(),
            'paidAt' => optional($booking->paid_at)->toISOString(),
            'createdAt' => optional($booking->created_at)->toISOString(),
            'updatedAt' => optional($booking->updated_at)->toISOString(),
        ];
    }

    private function canCancelBooking(Booking $booking): bool
    {
        if (!in_array((string) $booking->status, ['pending', 'accepted', 'confirmed'], true)) {
            return false;
        }

        return $this->cancellationSecondsLeft($booking) > 0;
    }

    private function cancellationSecondsLeft(Booking $booking): int
    {
        $windowEnd = optional($booking->created_at)->copy()?->addDay();
        if (!$windowEnd) {
            return 0;
        }

        return max(0, now()->diffInSeconds($windowEnd, false));
    }

    private function normalizeAssetPath(?string $path, string $fallback): string
    {
        $raw = trim((string) ($path ?? ''));

        if ($raw === '') {
            return $fallback;
        }

        if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://') || str_starts_with($raw, 'data:') || str_starts_with($raw, '/')) {
            return $raw;
        }

        return ltrim($raw, './');
    }
}
