<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'role',
        'location',
        'avatar_path',
        'bio',
        'onboarding_step',
        'is_profile_completed',
        'guide_verification_status',
        'guide_verified_at',
        'last_seen_at',
        'email_verified_at',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'guide_verified_at' => 'datetime',
            'last_seen_at' => 'datetime',
            'is_profile_completed' => 'boolean',
            'password' => 'hashed',
        ];
    }

    public function tourListings(): HasMany
    {
        return $this->hasMany(TourListing::class, 'guide_id');
    }

    public function tours(): HasMany
    {
        return $this->hasMany(Tour::class, 'guide_id');
    }

    public function tourRequests(): HasMany
    {
        return $this->hasMany(TourRequest::class, 'tourist_id');
    }

    public function bookingsAsTourist(): HasMany
    {
        return $this->hasMany(Booking::class, 'tourist_id');
    }

    public function bookingsAsGuide(): HasMany
    {
        return $this->hasMany(Booking::class, 'guide_id');
    }

    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function reviewsAuthored(): HasMany
    {
        return $this->hasMany(Review::class, 'tourist_id');
    }

    public function reviewsReceived(): HasMany
    {
        return $this->hasMany(Review::class, 'guide_id');
    }

    public function verificationDocuments(): HasMany
    {
        return $this->hasMany(VerificationDocument::class, 'user_id');
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class, 'tourist_id');
    }

    public function availabilities(): HasMany
    {
        return $this->hasMany(Availability::class, 'guide_id');
    }

    public function reportsSubmitted(): HasMany
    {
        return $this->hasMany(Report::class, 'reported_by');
    }

    public function reportsTargeting(): HasMany
    {
        return $this->hasMany(Report::class, 'target_user_id');
    }

    public function otpVerifications(): HasMany
    {
        return $this->hasMany(OtpVerification::class, 'user_id');
    }

    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class, 'user_id');
    }

    public function onboardingConsent(): HasOne
    {
        return $this->hasOne(OnboardingConsent::class, 'user_id');
    }

    public function guideProfile(): HasOne
    {
        return $this->hasOne(GuideProfile::class, 'user_id');
    }

    public function guideApplications(): HasMany
    {
        return $this->hasMany(GuideApplication::class, 'user_id');
    }
}
