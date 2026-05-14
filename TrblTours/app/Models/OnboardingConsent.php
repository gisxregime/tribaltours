<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OnboardingConsent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'terms_accepted',
        'privacy_accepted',
        'info_accuracy_confirmed',
        'verification_consent',
        'commission_policy_accepted',
        'safety_guidelines_accepted',
        'consented_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'terms_accepted' => 'boolean',
            'privacy_accepted' => 'boolean',
            'info_accuracy_confirmed' => 'boolean',
            'verification_consent' => 'boolean',
            'commission_policy_accepted' => 'boolean',
            'safety_guidelines_accepted' => 'boolean',
            'consented_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
