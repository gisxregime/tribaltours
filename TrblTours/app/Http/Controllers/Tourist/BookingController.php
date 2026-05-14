<?php

namespace App\Http\Controllers\Tourist;

use App\Events\BookingStatusUpdated;
use App\Http\Controllers\Controller;
use App\Models\Availability;
use App\Models\Booking;
use App\Models\Review;
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
        $query = $request->user()->bookingsAsTourist()->with(['tourListing', 'guide.guideProfile', 'reviews'])->latest();

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
            ->with(['tourListing', 'guide.guideProfile', 'reviews'])
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
        $guide = $booking->guide;
        $guideProfile = $guide?->guideProfile;
        $review = $booking->relationLoaded('reviews')
            ? $booking->reviews->first()
            : $booking->reviews()->latest('id')->first();
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
            'guideBio' => (string) ($guide?->bio ?? ''),
            'guideLocation' => (string) ($guide?->location ?? ''),
            'guideLanguages' => (string) ($guideProfile?->languages_spoken ?? ''),
            'guideSpecialties' => (string) ($guideProfile?->areas_of_expertise ?? ''),
            'guideCertifications' => (string) ($guideProfile?->guide_certificate_number ?? ''),
            'bookingDate' => optional($booking->booked_for_date)->toDateString(),
            'guestCount' => (int) ($booking->guest_count ?? 1),
            'total' => (float) ($booking->total_amount ?? 0),
            'paymentStatus' => (string) ($booking->payment_status ?? 'unpaid'),
            'paymentMethod' => (string) ($booking->payment_method ?? ''),
            'paymentReference' => (string) ($booking->payment_reference ?? ''),
            'status' => (string) ($booking->status ?? 'pending'),
            'state' => $state,
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

        return max(0, now()->diffInSeconds($windowEnd, false));
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
