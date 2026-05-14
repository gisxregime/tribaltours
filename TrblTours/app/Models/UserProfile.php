<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'gender',
        'birth_date',
        'age',
        'nationality',
        'mobile_country_code',
        'mobile_number_local',
        'mobile_number_e164',
        'email_address',
        'current_address',
        'city',
        'province_state',
        'country',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'age' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
