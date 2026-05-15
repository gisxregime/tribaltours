<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TourRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tourist_id',
        'selected_guide_id',
        'selected_at',
        'title',
        'description',
        'province',
        'city',
        'budget_min',
        'budget_max',
        'duration_label',
        'travelers_label',
        'interests',
        'status',
        'is_active',
        'closed_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'interests' => 'array',
            'metadata' => 'array',
            'budget_min' => 'decimal:2',
            'budget_max' => 'decimal:2',
            'selected_at' => 'datetime',
            'closed_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function tourist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tourist_id');
    }

    public function selectedGuide(): BelongsTo
    {
        return $this->belongsTo(User::class, 'selected_guide_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TourRequestComment::class)->orderBy('created_at')->orderBy('id');
    }
}
