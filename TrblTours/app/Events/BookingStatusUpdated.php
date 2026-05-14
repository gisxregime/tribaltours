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
        $booking->loadMissing(['guide', 'tourListing']);
        $listing = $booking->tourListing;
        $guide = $booking->guide;

        $state = match ($booking->status) {
            'accepted', 'confirmed' => 'booked',
            'completed' => 'completed',
            default => 'pending',
        };

        $this->bookingPayload = [
            'id' => (string) $booking->id,
            'reference' => (string) $booking->booking_reference,
            'touristId' => (string) $booking->tourist_id,
            'guideId' => (string) $booking->guide_id,
            'tourId' => $listing ? (string) $listing->id : null,
            'tourTitle' => (string) ($listing->title ?? 'Custom Tour Booking'),
            'image' => (string) ($listing->cover_image_path ?? 'images/pangasinan.jpg'),
            'guideName' => trim((string) ($guide->name ?? 'Guide')),
            'guideAvatar' => (string) (($guide && $guide->avatar_path) ? $guide->avatar_path : 'images/manila.jpg'),
            'bookingDate' => optional($booking->booked_for_date)->toDateString(),
            'total' => (float) ($booking->total_amount ?? 0),
            'status' => (string) $booking->status,
            'state' => $state,
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
}
