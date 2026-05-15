<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TourRequestComment extends Model
{
    use HasFactory;
    use HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'tour_request_id',
        'parent_comment_id',
        'author_id',
        'author_role',
        'author_name',
        'author_avatar_url',
        'text',
        'offer_amount',
    ];

    protected function casts(): array
    {
        return [
            'offer_amount' => 'decimal:2',
        ];
    }

    public function tourRequest(): BelongsTo
    {
        return $this->belongsTo(TourRequest::class, 'tour_request_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(TourRequestComment::class, 'parent_comment_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(TourRequestComment::class, 'parent_comment_id');
    }
}
