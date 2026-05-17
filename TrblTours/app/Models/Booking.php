<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_reference',
        'client_token',
        'tourist_id',
        'guide_id',
        'tour_listing_id',
        'tour_request_id',
        'conversation_id',
        'booked_for_date',
        'booked_for_time',
        'tour_date',
        'tour_time',
        'guest_count',
        'price_snapshot',
        'total_amount',
        'payment_status',
        'payment_method',
        'payment_reference',
        'tour_start_date',
        'confirmed_booking_date',
        'payment_received_at',
        'booking_status',
        'status',
        'reservation_type',
        'notes',
        'traveler_full_name',
        'traveler_email',
        'traveler_phone',
        'traveler_emergency_contact',
        'paid_at',
        'approved_at',
        'declined_at',
        'cancelled_at',
        'schedule_confirmed_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'booked_for_date' => 'date',
            'tour_date' => 'date',
            'price_snapshot' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'tour_start_date' => 'datetime',
            'confirmed_booking_date' => 'datetime',
            'payment_received_at' => 'datetime',
            'paid_at' => 'datetime',
            'approved_at' => 'datetime',
            'declined_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'schedule_confirmed_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    // State machine methods
    public function canAccept(): bool
    {
        return (string) ($this->booking_status ?? $this->status ?? '') === 'pending';
    }

    public function canDecline(): bool
    {
        return (string) ($this->booking_status ?? $this->status ?? '') === 'pending';
    }

    public function canConfirmSchedule(): bool
    {
        $currentStatus = (string) ($this->booking_status ?? $this->status ?? '');
        return in_array($currentStatus, ['accepted', 'schedule_confirmed'], true) &&
               $this->tour_date !== null &&
               $this->tour_time !== null;
    }

    public function canPay(): bool
    {
        $currentStatus = (string) ($this->booking_status ?? $this->status ?? '');
        return in_array($currentStatus, ['schedule_confirmed', 'waiting_payment'], true) &&
               $this->tour_date !== null &&
               $this->tour_time !== null;
    }

    public function canMarkCompleted(): bool
    {
        $currentStatus = (string) ($this->booking_status ?? $this->status ?? '');
        $paymentStatus = strtolower((string) ($this->payment_status ?? 'unpaid'));
        return in_array($currentStatus, ['paid', 'waiting_payment', 'schedule_confirmed'], true) &&
               $paymentStatus === 'paid' &&
               $this->tour_date !== null &&
               $this->tour_time !== null;
    }

    public function getTourDateFormatted(): string
    {
        if ($this->tour_date === null) {
            return 'Date not set';
        }
        return optional($this->tour_date)->format('M d, Y') ?? 'Date not set';
    }

    public function getTourTimeFormatted(): string
    {
        if (!$this->tour_time) {
            return 'Time not set';
        }
        try {
            return \Illuminate\Support\Carbon::parse($this->tour_time)->format('g:i A');
        } catch (\Throwable $_) {
            return $this->tour_time;
        }
    }

    public function tourist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tourist_id');
    }

    public function guide(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guide_id');
    }

    public function tourListing(): BelongsTo
    {
        return $this->belongsTo(TourListing::class);
    }

    public function tourRequest(): BelongsTo
    {
        return $this->belongsTo(TourRequest::class);
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
