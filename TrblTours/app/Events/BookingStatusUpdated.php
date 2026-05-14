<?php

namespace App\Events;

use App\Models\Booking;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookingStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $bookingPayload;

    public function __construct(Booking $booking)
    {
        $booking->loadMissing(['guide.guideProfile', 'tourListing']);
        $listing = $booking->tourListing;
        $guide = $booking->guide;
        $guideProfile = $guide?->guideProfile;

        $state = match ($booking->status) {
            'accepted', 'confirmed' => 'booked',
            'completed' => 'completed',
            'cancelled', 'declined' => 'cancelled',
            default => 'pending',
        };

        $cancellableUntil = optional($booking->created_at)->copy()?->addDay();
        $secondsLeft = $cancellableUntil
            ? max(0, now()->diffInSeconds($cancellableUntil, false))
            : 0;

        $this->bookingPayload = [
            'id' => (string) $booking->id,
            'reference' => (string) $booking->booking_reference,
            'touristId' => (string) $booking->tourist_id,
            'guideId' => (string) $booking->guide_id,
            'tourId' => $listing ? (string) $listing->id : null,
            'tourTitle' => (string) ($listing->title ?? 'Custom Tour Booking'),
            'image' => (string) ($listing->cover_image_path ?? 'images/pangasinan.jpg'),
            'guideName' => trim((string) ($guide->name ?? 'Guide')),
            'guideAvatar' => $this->resolveAvatarPath($guide?->avatar_path),
            'guideBio' => (string) ($guide?->bio ?? ''),
            'guideLocation' => (string) ($guide?->location ?? ''),
            'guideLanguages' => (string) ($guideProfile?->languages_spoken ?? ''),
            'guideSpecialties' => (string) ($guideProfile?->areas_of_expertise ?? ''),
            'guideCertifications' => (string) ($guideProfile?->guide_certificate_number ?? ''),
            'bookingDate' => optional($booking->booked_for_date)->toDateString(),
            'total' => (float) ($booking->total_amount ?? 0),
            'paymentStatus' => (string) ($booking->payment_status ?? 'unpaid'),
            'paymentMethod' => (string) ($booking->payment_method ?? ''),
            'status' => (string) $booking->status,
            'state' => $state,
            'cancellableUntil' => $cancellableUntil?->toISOString(),
            'cancellationSecondsLeft' => $secondsLeft,
            'updatedAt' => optional($booking->updated_at)->toISOString(),
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('tourist-bookings'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'booking.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'booking' => $this->bookingPayload,
        ];
    }

    private function resolveAvatarPath(?string $path): string
    {
        $raw = trim((string) ($path ?? ''));
        if ($raw === '') {
            return '/images/manila.jpg';
        }

        if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://') || str_starts_with($raw, 'data:')) {
            return $raw;
        }

        return '/' . ltrim($raw, '/');
    }
}
