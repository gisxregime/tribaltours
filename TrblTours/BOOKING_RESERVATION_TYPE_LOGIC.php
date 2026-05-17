// BOOKING CREATION LOGIC - Update for Reservation Type
// File: app/Http/Controllers/Tourist/BookingController.php

// Add new endpoint: POST /tourist/bookings/create-from-listing
public function createFromListing(Request $request): JsonResponse
{
    $payload = $request->validate([
        'tour_listing_id' => ['required', 'exists:tour_listings,id'],
        'guest_count' => ['required', 'integer', 'min:1', 'max:100'],
        'booked_for_date' => ['nullable', 'date', 'after:today'],
        'booked_for_time' => ['nullable', 'string', 'max:60'],
    ]);

    $listing = TourListing::query()->findOrFail((int) $payload['tour_listing_id']);
    abort_unless($listing->status === 'published' && $listing->is_active, 422);

    $guestCount = (int) ($payload['guest_count'] ?? 1);
    $minGuests = (int) $listing->min_guests;
    $maxGuests = (int) $listing->max_guests;
    
    if ($guestCount < $minGuests || $guestCount > $maxGuests) {
        return response()->json([
            'ok' => false,
            'message' => 'Guest count must be between ' . $minGuests . ' and ' . $maxGuests . '.'
        ], 422);
    }

    $reservationType = (string) ($listing->reservation_type ?? 'instant');
    $total = $listing->price_type === 'per_group' ? $listing->price : $listing->price * $guestCount;

    // Determine initial booking status based on reservation type
    $initialStatus = $reservationType === 'manual' ? 'pending' : 'accepted';
    $initialBookingStatus = $reservationType === 'manual' ? 'pending' : 'schedule_confirmed';

    $booking = Booking::create([
        'booking_reference' => 'TRBL-' . strtoupper(Str::random(10)),
        'tourist_id' => $request->user()->id,
        'guide_id' => $listing->guide_id,
        'tour_listing_id' => $listing->id,
        'booked_for_date' => $payload['booked_for_date'] ?? null,
        'booked_for_time' => $payload['booked_for_time'] ?? null,
        'guest_count' => $guestCount,
        'price_snapshot' => (float) $listing->price,
        'total_amount' => $total,
        'payment_status' => 'unpaid',
        'status' => $initialStatus,  // pending for manual, accepted for instant
        'booking_status' => $initialBookingStatus,  // CRITICAL: Different flow based on reservation type
        'reservation_type' => $reservationType,  // Store for reference
    ]);

    $booking->loadMissing(['guide', 'tourListing']);

    // Send notification to guide with appropriate message
    $notificationType = $reservationType === 'manual' ? 'booking.pending_approval' : 'booking.submitted';
    $notificationMessage = $reservationType === 'manual' 
        ? trim((string) $request->user()->name) . ' requested a booking for "' . trim((string) $listing->title) . '". Awaiting your approval.'
        : trim((string) $request->user()->name) . ' booked "' . trim((string) $listing->title) . '".';

    DomainNotification::notifyUser(
        $booking->guide,
        $notificationType,
        $notificationMessage,
        ['bookingId' => (string) $booking->id, 'tourId' => (string) $listing->id]
    );

    event(new BookingStatusUpdated($booking->fresh(['guide', 'tourListing'])));

    return response()->json([
        'ok' => true,
        'booking' => $this->presentBooking($booking),
        'reservation_type' => $reservationType,
        'requires_approval' => $reservationType === 'manual',
    ], 201);
}

// === IMPORTANT: Update store() method for direct tour booking ===
// In store() method, add this logic after booking creation:

// Determine initial statuses based on reservation_type from tour listing
$tourListing = $booking->tourListing;
$reservationType = $tourListing ? (string) ($tourListing->reservation_type ?? 'instant') : 'instant';

if ($reservationType === 'manual') {
    // Manual approval required
    $booking->status = 'pending';
    $booking->booking_status = 'pending';
    
    DomainNotification::notifyUser(
        $booking->guide,
        'booking.pending_approval',
        trim((string) $request->user()->name) . ' requested a booking. Awaiting your approval.',
        ['bookingId' => (string) $booking->id]
    );
} else {
    // Instant booking
    $booking->status = 'accepted';
    $booking->booking_status = 'accepted';
    
    DomainNotification::notifyUser(
        $booking->guide,
        'booking.submitted',
        trim((string) $request->user()->name) . ' booked your tour.',
        ['bookingId' => (string) $booking->id]
    );
}

// === Guide Accept/Decline Endpoint Update ===
// When guide accepts a manual approval booking:
public function acceptBooking(Request $request, Booking $booking): JsonResponse
{
    abort_unless($booking->guide_id === $request->user()->id, 403);

    $reservationType = (string) ($booking->tourListing?->reservation_type ?? 'instant');
    
    // Only guides can approve pending manual bookings
    if ($reservationType === 'manual' && $booking->status === 'pending') {
        $booking->status = 'accepted';
        $booking->booking_status = 'accepted';
        $booking->approved_at = now();
        $booking->save();

        DomainNotification::notifyUser(
            $booking->tourist,
            'booking.approved',
            'Your booking for "' . ($booking->tourListing?->title ?? 'tour') . '" has been approved by the guide!',
            ['bookingId' => (string) $booking->id]
        );

        event(new BookingStatusUpdated($booking->fresh(['guide', 'tourListing'])));

        return response()->json(['ok' => true, 'booking' => $this->presentBooking($booking)]);
    }

    return response()->json(['ok' => false, 'message' => 'Cannot approve this booking.'], 422);
}

// When guide declines:
public function declineBooking(Request $request, Booking $booking): JsonResponse
{
    abort_unless($booking->guide_id === $request->user()->id, 403);

    $reservationType = (string) ($booking->tourListing?->reservation_type ?? 'instant');
    
    if ($reservationType === 'manual' && $booking->status === 'pending') {
        $booking->status = 'declined';
        $booking->booking_status = 'declined';
        $booking->declined_at = now();
        $booking->save();

        DomainNotification::notifyUser(
            $booking->tourist,
            'booking.declined',
            'Your booking request for "' . ($booking->tourListing?->title ?? 'tour') . '" was declined.',
            ['bookingId' => (string) $booking->id]
        );

        event(new BookingStatusUpdated($booking->fresh(['guide', 'tourListing'])));

        return response()->json(['ok' => true, 'booking' => $this->presentBooking($booking)]);
    }

    return response()->json(['ok' => false, 'message' => 'Cannot decline this booking.'], 422);
}
