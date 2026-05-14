<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GuideApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'motivation',
        'experience_years',
        'languages_spoken',
        'areas_of_expertise',
        'tour_categories',
        'status',
        'payload',
        'submitted_at',
        'reviewed_by',
        'reviewed_at',
        'reviewer_notes',
    ];

    protected function casts(): array
    {
        return [
            'tour_categories' => 'array',
            'payload' => 'array',
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
