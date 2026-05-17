<?php

namespace App\Http\Controllers\Tourist;

use App\Events\BookingStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Availability;
use App\Models\Booking;
use App\Models\Review;
use App\Models\TourRequest;
use App\Models\TourListing;
use App\Support\DomainNotification;
use Illuminate\Support\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\View\View;

class BookingController extends Controller
{
    public function index(Request $request): View|JsonResponse
    {
        $this->expirePendingBookingsAfterCancellationWindow((int) $request->user()->id);

        $query = $request->user()->bookingsAsTourist()->with(['tourListing', 'tourRequest', 'guide.guideProfile', 'reviews'])->latest();

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
        $this->expirePendingBookingsAfterCancellationWindow((int) $request->user()->id);

        $bookings = $request->user()->bookingsAsTourist()
            ->with(['tourListing', 'tourRequest', 'guide.guideProfile', 'reviews'])
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

    public function checkAvailability(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'tour_listing_id' => ['required', 'exists:tour_listings,id'],
            'guest_count' => ['required', 'integer', 'min:1', 'max:100'],
            'booked_for_date' => ['required', 'date', 'after:today'],
            'booked_for_time' => ['required', 'string', 'max:60'],
        ]);

        $listing = TourListing::query()->findOrFail((int) $payload['tour_listing_id']);
        if ($listing->status !== 'published' || !(bool) $listing->is_active) {
            return response()->json([
                'ok' => false,
                'available' => false,
                'message' => 'Selected slot is not available. Please choose another date/time.',
            ], 422);
        }

        $guests = (int) $payload['guest_count'];
        $minGuests = max(1, (int) ($listing->min_guests ?? 1));
        $maxGuests = max($minGuests, (int) ($listing->max_guests ?? $minGuests));
        if ($guests < $minGuests || $guests > $maxGuests) {
            return response()->json([
                'ok' => false,
                'available' => false,
                'message' => 'Selected slot is not available. Please choose another date/time.',
            ], 422);
        }

        $requestedDate = Carbon::parse((string) $payload['booked_for_date'])->toDateString();
        $requestedTimeLabel = trim((string) $payload['booked_for_time']);
        $requestedTime = $this->normalizeRequestedTime($requestedTimeLabel);

        if ($requestedTime === null) {
            return response()->json([
                'ok' => false,
                'available' => false,
                'message' => 'Selected slot is not available. Please choose another date/time.',
            ], 422);
        }

        $slotQuery = Availability::query()
            ->where('tour_listing_id', $listing->id)
            ->whereDate('date', $requestedDate);

        $hasConfiguredSlots = $slotQuery->exists();
        $matchingSlot = null;

        if ($hasConfiguredSlots) {
            $matchingSlot = Availability::query()
                ->where('tour_listing_id', $listing->id)
                ->whereDate('date', $requestedDate)
                ->where(function ($query) use ($requestedTime) {
                    $query->whereNull('start_time')
                        ->orWhere('start_time', '<=', $requestedTime);
                })
                ->where(function ($query) use ($requestedTime) {
                    $query->whereNull('end_time')
                        ->orWhere('end_time', '>=', $requestedTime);
                })
                ->orderByRaw("CASE WHEN status = 'available' THEN 0 ELSE 1 END")
                ->orderBy('start_time')
                ->first();

            if (!$matchingSlot || $matchingSlot->status !== 'available') {
                return response()->json([
                    'ok' => true,
                    'available' => false,
                    'message' => 'Selected slot is not available. Please choose another date/time.',
                ]);
            }
        }

        $activeStatuses = ['pending', 'accepted', 'confirmed'];
        $existingCount = Booking::query()
            ->where('tour_listing_id', $listing->id)
            ->whereDate('booked_for_date', $requestedDate)
            ->where('booked_for_time', $requestedTimeLabel)
            ->whereIn('status', $activeStatuses)
            ->count();

        $available = true;
        if ($matchingSlot) {
            $capacity = max(1, (int) ($matchingSlot->capacity ?? 1));
            $available = $existingCount < $capacity;
        } elseif ($existingCount > 0) {
            $available = false;
        }

        return response()->json([
            'ok' => true,
            'available' => $available,
            'message' => $available
                ? 'Slot available! You can now proceed to Book Now.'
                : 'Selected slot is not available. Please choose another date/time.',
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
            'traveler_full_name' => ['nullable', 'string', 'max:150'],
            'traveler_email' => ['nullable', 'email', 'max:190'],
            'traveler_phone' => ['nullable', 'string', 'max:60'],
            'traveler_emergency_contact' => ['nullable', 'string', 'max:150'],
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

        $bookingCreateData = [
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
            'traveler_full_name' => isset($payload['traveler_full_name']) ? trim((string) $payload['traveler_full_name']) : null,
            'traveler_email' => isset($payload['traveler_email']) ? trim((string) $payload['traveler_email']) : null,
            'traveler_phone' => isset($payload['traveler_phone']) ? trim((string) $payload['traveler_phone']) : null,
            'traveler_emergency_contact' => isset($payload['traveler_emergency_contact']) ? trim((string) $payload['traveler_emergency_contact']) : null,
            'paid_at' => $paymentStatus === 'paid' ? now() : null,
        ];

        if (Schema::hasColumn('bookings', 'payment_received_at')) {
            $bookingCreateData['payment_received_at'] = $paymentStatus === 'paid' ? now() : null;
        }
        if (Schema::hasColumn('bookings', 'tour_start_date')) {
            $bookingCreateData['tour_start_date'] = isset($payload['booked_for_date'])
                ? Carbon::parse((string) $payload['booked_for_date'] . ' ' . (string) ($payload['booked_for_time'] ?? '23:59'))
                : null;
        }
        if (Schema::hasColumn('bookings', 'confirmed_booking_date')) {
            $bookingCreateData['confirmed_booking_date'] = isset($payload['booked_for_date'])
                ? Carbon::parse((string) $payload['booked_for_date'] . ' ' . (string) ($payload['booked_for_time'] ?? '23:59'))
                : null;
        }
        if (Schema::hasColumn('bookings', 'booking_status')) {
            $bookingCreateData['booking_status'] = $paymentStatus === 'paid'
                ? (isset($payload['booked_for_date']) ? 'date_confirmed' : 'date_pending')
                : 'payment_pending';
        }

        $booking = Booking::create($bookingCreateData);

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

        $booking->load(['tourListing', 'guide', 'tourist']);
        $detail = $this->presentBooking($booking);
        $detail['traveler'] = [
            'fullName' => trim((string) ($booking->traveler_full_name ?? $booking->tourist?->name ?? '')),
            'email' => trim((string) ($booking->traveler_email ?? $booking->tourist?->email ?? '')),
            'phone' => trim((string) ($booking->traveler_phone ?? $booking->tourist?->phone ?? '')),
            'emergency' => trim((string) ($booking->traveler_emergency_contact ?? '')),
            'notes' => trim((string) ($booking->notes ?? '')),
        ];

        return view('tourist.booking-details', [
            'booking' => $booking,
            'bookingDetail' => $detail,
        ]);
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

            if (!$this->canTouristMarkCompleted($booking)) {
                return response()->json([
                    'ok' => false,
                    'message' => 'You can only mark this booking completed after payment is paid and a confirmed booking date/time exists.',
                    'completionSecondsLeft' => $this->completionSecondsLeft($booking),
                ], 422);
            }

            $booking->status = 'completed';
            $booking->completed_at = Carbon::now();
        }

        $this->syncLifecycleFields($booking);

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

    public function complete(Request $request, Booking $booking): JsonResponse
    {
        $request->merge(['action' => 'mark_completed']);

        return $this->transition($request, $booking);
    }

    public function accept(Request $request, Booking $booking): JsonResponse
    {
        abort_unless($booking->tourist_id === Auth::id(), 403);

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
            $booking->guide,
            'booking.accepted',
            trim((string) $request->user()->name) . ' accepted the booking.',
            ['bookingId' => (string) $booking->id]
        );

        event(new BookingStatusUpdated($booking->fresh(['guide', 'tourListing'])));

        return response()->json([
            'ok' => true,
            'booking' => $this->presentBooking($booking->fresh(['guide', 'tourListing'])),
        ]);
    }

    public function decline(Request $request, Booking $booking): JsonResponse
    {
        abort_unless($booking->tourist_id === Auth::id(), 403);

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
            $booking->guide,
            'booking.declined',
            trim((string) $request->user()->name) . ' declined the booking.',
            ['bookingId' => (string) $booking->id]
        );

        event(new BookingStatusUpdated($booking->fresh(['guide', 'tourListing'])));

        return response()->json([
            'ok' => true,
            'booking' => $this->presentBooking($booking->fresh(['guide', 'tourListing'])),
        ]);
    }

    public function paymentSuccess(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'booking_id' => ['required_without:tour_request_id', 'nullable', 'exists:bookings,id'],
            'tour_request_id' => ['required_without:booking_id', 'nullable', 'exists:tour_requests,id'],
            'payment_method' => ['nullable', 'string', 'max:120'],
            'payment_reference' => ['nullable', 'string', 'max:120'],
        ]);

        $query = Booking::query()->where('tourist_id', (int) $request->user()->id);
        if (!empty($payload['booking_id'])) {
            $query->whereKey((int) $payload['booking_id']);
        } else {
            $query->where('tour_request_id', (int) $payload['tour_request_id']);
        }

        $booking = $query->latest('id')->firstOrFail();

        $booking->payment_status = 'paid';
        if (Schema::hasColumn('bookings', 'payment_received_at')) {
            $booking->payment_received_at = now();
        }
        $booking->paid_at = $booking->paid_at ?: now();
        if (array_key_exists('payment_method', $payload)) {
            $booking->payment_method = trim((string) ($payload['payment_method'] ?? '')) ?: $booking->payment_method;
        }
        if (array_key_exists('payment_reference', $payload)) {
            $booking->payment_reference = trim((string) ($payload['payment_reference'] ?? '')) ?: $booking->payment_reference;
        }

        $this->syncLifecycleFields($booking);
        $booking->save();

        event(new BookingStatusUpdated($booking->fresh(['guide', 'tourListing'])));

        return response()->json([
            'ok' => true,
            'booking' => $this->presentBooking($booking->fresh(['guide', 'tourListing', 'tourRequest'])),
        ]);
    }

    public function setDate(Request $request, ?Booking $booking = null): JsonResponse
    {
        $payload = $request->validate([
            'booking_id' => ['nullable', 'exists:bookings,id'],
            'tour_request_id' => ['nullable', 'exists:tour_requests,id'],
            'tour_date' => ['required', 'date'],
            'tour_time' => ['nullable', 'string', 'max:60'],
        ]);

        $target = $booking;
        if (!$target) {
            $query = Booking::query()->where('tourist_id', (int) $request->user()->id);
            if (!empty($payload['booking_id'])) {
                $query->whereKey((int) $payload['booking_id']);
            } elseif (!empty($payload['tour_request_id'])) {
                $query->where('tour_request_id', (int) $payload['tour_request_id']);
            } else {
                return response()->json([
                    'ok' => false,
                    'message' => 'Booking identifier is required.',
                ], 422);
            }

            $target = $query->latest('id')->first();
            if (!$target && !empty($payload['tour_request_id'])) {
                $tourRequest = TourRequest::query()
                    ->whereKey((int) $payload['tour_request_id'])
                    ->where('tourist_id', (int) $request->user()->id)
                    ->first();

                if (!$tourRequest) {
                    return response()->json([
                        'ok' => false,
                        'message' => 'Tour request not found for this account.',
                    ], 404);
                }

                $guideId = (int) ($tourRequest->selected_guide_id ?? 0);
                if ($guideId <= 0) {
                    return response()->json([
                        'ok' => false,
                        'message' => 'Please select a guide before setting booking date.',
                    ], 422);
                }

                $guestCount = 1;
                if ($tourRequest->travelers_label && preg_match('/(\d+)/', (string) $tourRequest->travelers_label, $matches) === 1) {
                    $guestCount = max(1, (int) $matches[1]);
                }

                $amount = (float) ($tourRequest->budget_max ?? $tourRequest->budget_min ?? 0);
                $createData = [
                    'booking_reference' => 'TRBL-' . strtoupper(Str::random(10)),
                    'tourist_id' => (int) $request->user()->id,
                    'guide_id' => $guideId,
                    'tour_request_id' => (int) $tourRequest->id,
                    'tour_listing_id' => null,
                    'guest_count' => $guestCount,
                    'price_snapshot' => $amount,
                    'total_amount' => $amount,
                    'payment_status' => 'unpaid',
                    'status' => 'pending',
                    'booking_status' => 'pending',
                    'reservation_type' => 'manual',
                    'notes' => 'Created from tour request.',
                ];

                $target = Booking::query()->create($createData);
            }

            if (!$target) {
                return response()->json([
                    'ok' => false,
                    'message' => 'No booking found for this request yet.',
                ], 404);
            }
        }

        abort_unless((int) $target->tourist_id === (int) $request->user()->id, 403);

        // Parse tour date
        $tourDate = Carbon::parse((string) $payload['tour_date'])->toDateString();
        $tourTime = trim((string) ($payload['tour_time'] ?? ''));

        // Validate time format if provided
        if ($tourTime !== '') {
            try {
                $timeObj = Carbon::parse($tourTime);
                $tourTime = $timeObj->format('H:i');
            } catch (\Throwable $_) {
                return response()->json([
                    'ok' => false,
                    'message' => 'Invalid time format provided.',
                ], 422);
            }
        } else {
            return response()->json([
                'ok' => false,
                'message' => 'Tour time is required.',
            ], 422);
        }

        // Update booking with new schedule
        $target->tour_date = $tourDate;
        $target->tour_time = $tourTime;
        $target->booked_for_date = $tourDate;
        $target->booked_for_time = $tourTime;

        // If in accepted state, move to schedule_confirmed
        if ((string) $target->booking_status === 'accepted') {
            $target->booking_status = 'schedule_confirmed';
            $target->schedule_confirmed_at = $target->schedule_confirmed_at ?: now();
        }

        $this->syncLifecycleFields($target);
        $target->save();

        DomainNotification::notifyUser(
            $target->guide,
            'booking.schedule.confirmed',
            trim((string) $request->user()->name) . ' confirmed the tour schedule.',
            [
                'bookingId' => (string) $target->id,
                'tourDate' => $tourDate,
                'tourTime' => $tourTime,
            ]
        );

        event(new BookingStatusUpdated($target->fresh(['guide', 'tourListing'])));

        return response()->json([
            'ok' => true,
            'booking' => $this->presentBooking($target->fresh(['guide', 'tourListing', 'tourRequest'])),
        ]);
    }

    public function storeReview(Request $request, Booking $booking): JsonResponse
    {
        abort_unless($booking->tourist_id === Auth::id(), 403);

        if ((string) $booking->status !== 'completed') {
            return response()->json([
                'ok' => false,
                'message' => 'Only completed bookings can be reviewed.',
            ], 422);
        }

        if (!$booking->tour_listing_id || !$booking->guide_id) {
            return response()->json([
                'ok' => false,
                'message' => 'This booking is not linked to a published listing.',
            ], 422);
        }

        $payload = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:120'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'is_public' => ['nullable', 'boolean'],
        ]);

        $title = trim((string) ($payload['title'] ?? ''));
        $comment = trim((string) ($payload['comment'] ?? ''));

        if ($title === '' && $comment !== '') {
            $title = Str::limit($comment, 80, '');
        }

        $review = Review::query()->updateOrCreate(
            [
                'booking_id' => $booking->id,
                'tourist_id' => $request->user()->id,
            ],
            [
                'tour_listing_id' => $booking->tour_listing_id,
                'guide_id' => $booking->guide_id,
                'rating' => (int) $payload['rating'],
                'title' => $title !== '' ? $title : null,
                'comment' => $comment !== '' ? $comment : null,
                'is_public' => array_key_exists('is_public', $payload) ? (bool) $payload['is_public'] : true,
            ]
        );

        $this->refreshTourListingRatings((int) $booking->tour_listing_id);

        $booking->loadMissing(['guide', 'tourListing']);
        DomainNotification::notifyUser(
            $booking->guide,
            'tour.reviewed',
            trim((string) $request->user()->name) . ' left a review for "' . trim((string) ($booking->tourListing?->title ?? 'your listing')) . '".',
            [
                'bookingId' => (string) $booking->id,
                'tourId' => (string) $booking->tour_listing_id,
                'rating' => (int) $review->rating,
            ]
        );

        return response()->json([
            'ok' => true,
            'review' => $this->presentReview($review->fresh()),
            'booking' => $this->presentBooking($booking->fresh(['guide', 'tourListing', 'reviews'])),
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
        $requestSource = $booking->tourRequest;
        $guide = $booking->guide;
        $guideProfile = $guide?->guideProfile;
        $review = $booking->relationLoaded('reviews')
            ? $booking->reviews->first()
            : $booking->reviews()->latest('id')->first();
        $cancellableUntil = optional($booking->created_at)->copy()?->addDay();
        $secondsLeft = $this->cancellationSecondsLeft($booking);
        $scheduledAt = $this->bookingScheduledAt($booking);
        $completionSecondsLeft = $this->completionSecondsLeft($booking);

        $state = match ($booking->status) {
            'accepted', 'confirmed' => 'booked',
            'completed' => 'completed',
            'cancelled', 'declined' => 'cancelled',
            default => 'pending',
        };

        $currentBookingStatus = (string) ($booking->booking_status ?? 'pending');
        
        $requestMetadata = is_array($requestSource?->metadata) ? $requestSource->metadata : [];
        $requestImage = trim((string) ($requestMetadata['image'] ?? $requestMetadata['coverImage'] ?? ''));
        $coverImage = $this->normalizeAssetPath($listing?->cover_image_path ?: $requestImage, 'images/pangasinan.jpg');
        $guideAvatar = $this->normalizeAssetPath($guide?->avatar_path, 'images/manila.jpg');
        $listingLocation = trim(implode(', ', array_filter([
            trim((string) ($listing?->city ?? '')),
            trim((string) ($listing?->province ?? '')),
        ])));
        $requestLocation = trim(implode(', ', array_filter([
            trim((string) ($requestSource?->city ?? '')),
            trim((string) ($requestSource?->province ?? '')),
        ])));
        $resolvedTourTitle = trim((string) ($listing?->title ?? $requestSource?->title ?? 'Custom Tour Booking'));
        $resolvedTourLocation = $listingLocation !== '' ? $listingLocation : $requestLocation;

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
                $tourTimeFormatted = Carbon::parse($booking->tour_time)->format('g:i A');
            } catch (\Throwable $_) {
                $tourTimeFormatted = (string) $booking->tour_time;
            }
        }

        return [
            'id' => (string) $booking->id,
            'bookingId' => (string) $booking->id,
            'reference' => (string) $booking->booking_reference,
            'tourId' => $listing ? (string) $listing->id : '',
            'tourRequestId' => $requestSource ? (string) $requestSource->id : '',
            'tourPreviewUrl' => $listing ? route('tour-preview', ['tour' => (string) $listing->id]) : '',
            'bookingDetailsUrl' => route('tourist.bookings.show', ['booking' => $booking->id]),
            'tourTitle' => $resolvedTourTitle !== '' ? $resolvedTourTitle : 'Custom Tour Booking',
            'tourLocation' => $resolvedTourLocation,
            'image' => $coverImage,
            'guideName' => trim((string) ($guide->name ?? 'Guide')),
            'guideAvatar' => $guideAvatar,
            'guideBio' => (string) ($guide?->bio ?? ''),
            'guideLocation' => (string) ($guide?->location ?? ''),
            'guideLanguages' => (string) ($guideProfile?->languages_spoken ?? ''),
            'guideSpecialties' => (string) ($guideProfile?->areas_of_expertise ?? ''),
            'guideCertifications' => (string) ($guideProfile?->guide_certificate_number ?? ''),
            'bookingDate' => optional($booking->booked_for_date)->toDateString() ?? 'Date not set',
            'bookingTime' => (string) ($booking->booked_for_time ?? 'Time not set'),
            'bookingDateTime' => $scheduledAt?->toISOString(),
            'tourDate' => $tourDateFormatted,
            'tourTime' => $tourTimeFormatted,
            'tourDateRaw' => optional($booking->tour_date)->toDateString(),
            'tourTimeRaw' => (string) ($booking->tour_time ?? ''),
            'tourStartDate' => optional($booking->tour_start_date)->toISOString(),
            'confirmedBookingDate' => optional($booking->confirmed_booking_date)->toISOString(),
            'paymentReceivedAt' => optional($booking->payment_received_at ?? $booking->paid_at)->toISOString(),
            'bookingStatus' => $currentBookingStatus,
            'hasBookingSchedule' => $booking->tour_date !== null && $booking->tour_time !== null,
            'guestCount' => (int) ($booking->guest_count ?? 1),
            'priceSnapshot' => (float) ($booking->price_snapshot ?? 0),
            'total' => (float) ($booking->total_amount ?? 0),
            'paymentStatus' => (string) ($booking->payment_status ?? 'unpaid'),
            'paymentMethod' => (string) ($booking->payment_method ?? ''),
            'paymentReference' => (string) ($booking->payment_reference ?? ''),
            'notes' => (string) ($booking->notes ?? ''),
            'traveler' => [
                'fullName' => (string) ($booking->traveler_full_name ?? ''),
                'email' => (string) ($booking->traveler_email ?? ''),
                'phone' => (string) ($booking->traveler_phone ?? ''),
                'emergency' => (string) ($booking->traveler_emergency_contact ?? ''),
            ],
            'status' => (string) ($booking->status ?? 'pending'),
            'state' => $state,
            'isCompletable' => $this->canTouristMarkCompleted($booking),
            'canMarkComplete' => $this->canTouristMarkCompleted($booking),
            'canAccept' => $booking->canAccept(),
            'canDecline' => $booking->canDecline(),
            'canConfirmSchedule' => $booking->canConfirmSchedule(),
            'canPay' => $booking->canPay(),
            'completionSecondsLeft' => $completionSecondsLeft,
            'completionAvailableAt' => $scheduledAt?->toISOString(),
            'hasReview' => $review !== null,
            'review' => $review ? $this->presentReview($review) : null,
            'cancellableUntil' => $cancellableUntil?->toISOString(),
            'cancellationSecondsLeft' => $secondsLeft,
            'isCancellable' => $this->canCancelBooking($booking),
            'cancelledAt' => optional($booking->cancelled_at)->toISOString(),
            'paidAt' => optional($booking->paid_at)->toISOString(),
            'createdAt' => optional($booking->created_at)->toISOString(),
            'updatedAt' => optional($booking->updated_at)->toISOString(),
        ];
    }

    private function presentReview(Review $review): array
    {
        return [
            'id' => (string) $review->id,
            'rating' => (int) ($review->rating ?? 0),
            'title' => (string) ($review->title ?? ''),
            'comment' => (string) ($review->comment ?? ''),
            'isPublic' => (bool) $review->is_public,
            'createdAt' => optional($review->created_at)->toISOString(),
        ];
    }

    private function refreshTourListingRatings(int $tourListingId): void
    {
        if ($tourListingId <= 0) {
            return;
        }

        $aggregate = Review::query()
            ->where('tour_listing_id', $tourListingId)
            ->where('is_public', true)
            ->selectRaw('COUNT(*) as reviews_count, AVG(rating) as rating_avg')
            ->first();

        $reviewsCount = (int) ($aggregate?->reviews_count ?? 0);
        $ratingAvg = $reviewsCount > 0
            ? round((float) ($aggregate?->rating_avg ?? 0), 2)
            : 0;

        TourListing::query()
            ->whereKey($tourListingId)
            ->update([
                'reviews_count' => $reviewsCount,
                'rating_avg' => $ratingAvg,
            ]);
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

        return max(0, (int) floor((float) now()->diffInSeconds($windowEnd, false)));
    }

    private function expirePendingBookingsAfterCancellationWindow(int $touristId): void
    {
        if ($touristId <= 0) {
            return;
        }

        $expiredPendingBookings = Booking::query()
            ->where('tourist_id', $touristId)
            ->where('status', 'pending')
            ->where('created_at', '<=', now()->subDay())
            ->get();

        if ($expiredPendingBookings->isEmpty()) {
            return;
        }

        foreach ($expiredPendingBookings as $expiredBooking) {
            if (!$expiredBooking instanceof Booking) {
                continue;
            }

            $expiredBooking->status = 'cancelled';
            $expiredBooking->cancelled_at = $expiredBooking->cancelled_at ?: now();

            if (Schema::hasColumn('bookings', 'booking_status')) {
                $expiredBooking->booking_status = 'cancelled';
            }

            $expiredBooking->save();

            event(new BookingStatusUpdated($expiredBooking->fresh(['guide', 'tourListing'])));
        }
    }

    private function canTouristMarkCompleted(Booking $booking): bool
    {
        if (!in_array((string) $booking->status, ['accepted', 'confirmed'], true)) {
            return false;
        }

        if (Schema::hasColumn('bookings', 'confirmed_booking_date') && $booking->confirmed_booking_date === null) {
            return false;
        }

        return strtolower((string) ($booking->payment_status ?? '')) === 'paid';
    }

    private function completionSecondsLeft(Booking $booking): int
    {
        $scheduledAt = $this->bookingScheduledAt($booking);
        if (!$scheduledAt) {
            return 0;
        }

        return max(0, (int) floor((float) now()->diffInSeconds($scheduledAt, false)));
    }

    private function bookingScheduledAt(Booking $booking): ?Carbon
    {
        if (Schema::hasColumn('bookings', 'confirmed_booking_date') && $booking->confirmed_booking_date) {
            return Carbon::parse((string) $booking->confirmed_booking_date);
        }

        if (Schema::hasColumn('bookings', 'tour_start_date') && $booking->tour_start_date) {
            return Carbon::parse((string) $booking->tour_start_date);
        }

        $date = $booking->booked_for_date;
        if (!$date) {
            return null;
        }

        $base = $date instanceof \DateTimeInterface
            ? Carbon::instance($date)->startOfDay()
            : Carbon::parse((string) $date)->startOfDay();
        $rawTime = trim((string) ($booking->booked_for_time ?? ''));
        if ($rawTime === '') {
            return $base->copy()->endOfDay();
        }

        $formats = ['h:i A', 'g:i A', 'H:i', 'H:i:s'];
        foreach ($formats as $format) {
            try {
                $parsed = Carbon::createFromFormat($format, $rawTime);
                if ($parsed !== false) {
                    return $base->copy()->setTime((int) $parsed->format('H'), (int) $parsed->format('i'), (int) $parsed->format('s'));
                }
            } catch (\Throwable $_error) {
                // Try the next format.
            }
        }

        try {
            $parsed = Carbon::parse($rawTime);

            return $base->copy()->setTime((int) $parsed->format('H'), (int) $parsed->format('i'), (int) $parsed->format('s'));
        } catch (\Throwable $_error) {
            return $base->copy()->endOfDay();
        }
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

    private function normalizeRequestedTime(string $timeLabel): ?string
    {
        $raw = trim($timeLabel);
        if ($raw === '') {
            return null;
        }

        $formats = ['h:i A', 'g:i A', 'H:i', 'H:i:s'];
        foreach ($formats as $format) {
            try {
                $parsed = Carbon::createFromFormat($format, $raw);
                if ($parsed !== false) {
                    return $parsed->format('H:i:s');
                }
            } catch (\Throwable $_error) {
                // Try the next format.
            }
        }

        try {
            return Carbon::parse($raw)->format('H:i:s');
        } catch (\Throwable $_error) {
            return null;
        }
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
