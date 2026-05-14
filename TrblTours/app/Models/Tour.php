<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Tour extends Model
{
    use HasFactory;

    protected $table = 'tour_listings';

    protected $fillable = [
        'guide_id',
        'slug',
        'title',
        'short_description',
        'category',
        'province',
        'city',
        'meeting_area',
        'meeting_point',
        'duration_label',
        'min_guests',
        'max_guests',
        'price',
        'price_type',
        'reservation_type',
        'free_cancellation',
        'reserve_now_pay_later',
        'languages',
        'includes',
        'excludes',
        'requirements',
        'safety_info',
        'difficulty',
        'tags',
        'weather_suitability',
        'best_season',
        'child_friendly',
        'pet_friendly',
        'rating_avg',
        'reviews_count',
        'status',
        'cover_image_path',
        'gallery_paths',
        'is_active',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'includes' => 'array',
            'tags' => 'array',
            'gallery_paths' => 'array',
            'free_cancellation' => 'boolean',
            'reserve_now_pay_later' => 'boolean',
            'child_friendly' => 'boolean',
            'pet_friendly' => 'boolean',
            'is_active' => 'boolean',
            'published_at' => 'datetime',
            'price' => 'decimal:2',
            'rating_avg' => 'decimal:2',
        ];
    }

    public function guide(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guide_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'tour_listing_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'tour_listing_id');
    }
}
