<?php

namespace App\Services;

use App\Models\Booking;
use App\Support\DomainNotification;
use Illuminate\Support\Carbon;

class BookingStateManager
{
    /**
     * Get valid next states based on current state
     */
    public static function getValidNextStates(string $currentState): array
    {
        return match ($currentState) {
            'pending' => ['accepted', 'declined', 'cancelled'],
            'accepted' => ['schedule_confirmed', 'declined', 'cancelled'],
            'schedule_confirmed' => ['waiting_payment', 'cancelled'],
            'waiting_payment' => ['paid', 'cancelled'],
            'paid' => ['completed'],
            'completed' => [],
            'declined' => [],
            'cancelled' => [],
            default => [],
        };
    }

    /**
     * Transition booking to a new state with validation
     */
    public static function transitionTo(Booking $booking, string $newState, string $reason = ''): bool
    {
        $currentState = (string) ($booking->booking_status ?? 'pending');
        $validStates = self::getValidNextStates($currentState);

        if (!in_array($newState, $validStates, true)) {
            return false;
        }

        // Validate state-specific requirements
        if ($newState === 'schedule_confirmed') {
            if ($booking->tour_date === null || $booking->tour_time === null) {
                return false;
            }
        }

        if ($newState === 'paid') {
            if (strtolower((string) ($booking->payment_status ?? '')) !== 'paid') {
                return false;
            }
        }

        if ($newState === 'completed') {
            if ($booking->tour_date === null || $booking->tour_time === null) {
                return false;
            }
            if (strtolower((string) ($booking->payment_status ?? '')) !== 'paid') {
                return false;
            }
        }

        // Update status
        $booking->booking_status = $newState;

        // Set timestamp columns based on state
        if ($newState === 'accepted') {
            $booking->approved_at = $booking->approved_at ?: now();
        } elseif ($newState === 'declined') {
            $booking->declined_at = $booking->declined_at ?: now();
        } elseif ($newState === 'completed') {
            $booking->completed_at = $booking->completed_at ?: now();
        } elseif ($newState === 'schedule_confirmed') {
            $booking->schedule_confirmed_at = $booking->schedule_confirmed_at ?: now();
        }

        return true;
    }

    /**
     * Auto-transition based on payment and date status
     */
    public static function syncStateFromPaymentAndSchedule(Booking $booking): void
    {
        $currentState = (string) ($booking->booking_status ?? 'pending');
        $isPaid = strtolower((string) ($booking->payment_status ?? '')) === 'paid';
        $hasSchedule = $booking->tour_date !== null && $booking->tour_time !== null;

        // If already in a terminal state, don't change
        if (in_array($currentState, ['completed', 'declined', 'cancelled'], true)) {
            return;
        }

        // Handle payment reception
        if ($isPaid && in_array($currentState, ['schedule_confirmed', 'waiting_payment'], true)) {
            $booking->booking_status = 'paid';
            $booking->payment_received_at = $booking->payment_received_at ?: now();
        }

        // Handle date confirmation
        if ($hasSchedule && $currentState === 'accepted') {
            $booking->booking_status = 'schedule_confirmed';
            $booking->schedule_confirmed_at = $booking->schedule_confirmed_at ?: now();
        } elseif (!$hasSchedule && $currentState === 'schedule_confirmed') {
            $booking->booking_status = 'waiting_payment';
        }
    }

    /**
     * Notify both parties of state change
     */
    public static function notifyStateChange(Booking $booking, string $previousState, string $actor = 'system'): void
    {
        $newState = (string) $booking->booking_status;
        if ($previousState === $newState) {
            return;
        }

        $messages = [
            'accepted' => 'Booking has been accepted.',
            'declined' => 'Booking has been declined.',
            'schedule_confirmed' => 'Tour schedule has been confirmed.',
            'waiting_payment' => 'Waiting for payment confirmation.',
            'paid' => 'Payment has been received.',
            'completed' => 'Tour has been marked as completed.',
            'cancelled' => 'Booking has been cancelled.',
        ];

        $message = $messages[$newState] ?? 'Booking status updated.';

        DomainNotification::notifyUser(
            $booking->tourist,
            'booking.status.changed',
            $message,
            [
                'bookingId' => (string) $booking->id,
                'status' => $newState,
            ]
        );

        if ($booking->tourist_id !== $booking->guide_id) {
            DomainNotification::notifyUser(
                $booking->guide,
                'booking.status.changed',
                $message,
                [
                    'bookingId' => (string) $booking->id,
                    'status' => $newState,
                ]
            );
        }
    }
}
