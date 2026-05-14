<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'tourist_id',
        'guide_id',
        'tour_listing_id',
        'tour_request_id',
        'last_message_at',
        'is_archived',
    ];

    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
            'is_archived' => 'boolean',
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

    public function listing(): BelongsTo
    {
        return $this->belongsTo(TourListing::class, 'tour_listing_id');
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(TourRequest::class, 'tour_request_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }
}
