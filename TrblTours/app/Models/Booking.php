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
        'booked_for_date',
        'booked_for_time',
        'guest_count',
        'price_snapshot',
        'total_amount',
        'payment_status',
        'payment_method',
        'payment_reference',
        'status',
        'reservation_type',
        'notes',
        'paid_at',
        'approved_at',
        'declined_at',
        'cancelled_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'booked_for_date' => 'date',
            'price_snapshot' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'paid_at' => 'datetime',
            'approved_at' => 'datetime',
            'declined_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
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

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
