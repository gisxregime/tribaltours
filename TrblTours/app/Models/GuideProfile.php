<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GuideProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nbi_expiration_date',
        'barangay_issued_date',
        'guide_certificate_number',
        'years_of_experience',
        'languages_spoken',
        'areas_of_expertise',
        'tour_categories',
    ];

    protected function casts(): array
    {
        return [
            'nbi_expiration_date' => 'date',
            'barangay_issued_date' => 'date',
            'years_of_experience' => 'integer',
            'tour_categories' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
