<?php

namespace Tests\Feature\Auth;

use App\Models\OtpVerification;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LegacyOnboardingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(ValidateCsrfToken::class);
    }

    private function issueAndVerifyOtp(string $email): void
    {
        $issueResponse = $this->postJson(route('auth.otp.issue'), [
            'email' => $email,
            'purpose' => 'register',
            'channel' => 'email',
        ]);

        $issueResponse->assertOk();

        $otpCode = OtpVerification::query()
            ->where('email', $email)
            ->where('purpose', 'register')
            ->latest('id')
            ->value('otp_code');

        $this->assertNotNull($otpCode);

        $verifyResponse = $this->postJson(route('auth.otp.verify'), [
            'email' => $email,
            'purpose' => 'register',
            'otp_code' => $otpCode,
        ]);

        $verifyResponse->assertOk()->assertJson([
            'message' => 'OTP verified.',
        ]);
    }

    public function test_otp_can_be_issued_and_verified_via_json_endpoints(): void
    {
        $email = 'legacy.user@example.test';
        $this->issueAndVerifyOtp($email);
    }

    public function test_legacy_registration_creates_and_logs_in_user_with_normalized_onboarding_data(): void
    {
        $email = 'legacy.register@example.test';
        $this->issueAndVerifyOtp($email);

        $response = $this->postJson(route('auth.register.legacy'), [
            'name' => 'Legacy User',
            'email' => $email,
            'password' => 'Str0ng!Pass',
            'password_confirmation' => 'Str0ng!Pass',
            'role' => 'tourist',
            'phone' => '+639123456789',
            'location' => 'Cebu, Philippines',
            'bio' => 'Legacy onboarding test account',
            'otp_verified' => true,
            'personal_information' => [
                'full_name' => [
                    'first_name' => 'Legacy',
                    'middle_name' => 'Q',
                    'last_name' => 'User',
                    'suffix' => 'Jr',
                ],
                'gender' => 'Male',
                'birth_date' => '1998-04-21',
                'age' => 27,
                'nationality' => 'Filipino',
                'email_address' => $email,
                'phone_number' => [
                    'country_code' => '+63',
                    'local_number' => '9123456789',
                    'e164' => '+639123456789',
                ],
            ],
            'address_information' => [
                'full_address' => 'IT Park, Lahug',
                'city' => 'Cebu City',
                'province' => 'Cebu',
                'country' => 'Philippines',
            ],
            'agreements' => [
                'terms_accepted' => true,
                'privacy_accepted' => true,
                'info_accuracy_confirmed' => true,
                'verification_consent' => true,
                'commission_policy_accepted' => false,
                'safety_guidelines_accepted' => false,
            ],
            'metadata' => [
                'source' => 'web_onboarding_ui',
                'account_review_status' => 'pending_review',
                'generated_at' => now()->toIso8601String(),
            ],
        ]);

        $response->assertOk()->assertJsonStructure(['message', 'redirect']);
        $response->assertJsonPath('redirect', '/?signup=success&role=tourist');

        $this->assertDatabaseHas('users', [
            'email' => $email,
            'role' => 'tourist',
            'is_profile_completed' => true,
        ]);

        $this->assertDatabaseHas('user_profiles', [
            'email_address' => $email,
            'city' => 'Cebu City',
            'country' => 'Philippines',
        ]);

        $this->assertDatabaseHas('onboarding_consents', [
            'terms_accepted' => true,
            'privacy_accepted' => true,
            'verification_consent' => true,
        ]);

        $user = User::query()->where('email', $email)->first();
        $this->assertNotNull($user?->email_verified_at);
        $this->assertAuthenticatedAs($user);
    }

    public function test_guide_registration_persists_guide_profile_and_verification_documents(): void
    {
        $email = 'legacy.guide@example.test';
        $this->issueAndVerifyOtp($email);

        $response = $this->postJson(route('auth.register.legacy'), [
            'name' => 'Guide Legacy',
            'email' => $email,
            'password' => 'Str0ng!Pass',
            'password_confirmation' => 'Str0ng!Pass',
            'role' => 'guide',
            'otp_verified' => true,
            'personal_information' => [
                'full_name' => [
                    'first_name' => 'Guide',
                    'last_name' => 'Legacy',
                ],
                'phone_number' => [
                    'country_code' => '+63',
                    'local_number' => '9455555555',
                    'e164' => '+639455555555',
                ],
            ],
            'address_information' => [
                'city' => 'Davao City',
                'province' => 'Davao del Sur',
                'country' => 'Philippines',
            ],
            'agreements' => [
                'terms_accepted' => true,
                'privacy_accepted' => true,
                'info_accuracy_confirmed' => true,
                'verification_consent' => true,
                'commission_policy_accepted' => true,
                'safety_guidelines_accepted' => true,
            ],
            'identity_verification' => [
                'government_id_type' => 'Passport',
                'government_id_front' => [
                    'id' => 'f_front',
                    'name' => 'passport-front.jpg',
                    'status' => 'uploaded',
                ],
            ],
            'professional_verification' => [
                'nbi_expiration_date' => '2027-01-31',
                'barangay_issued_date' => '2026-11-01',
                'guide_certificate_number' => 'GUIDE-7788',
                'years_of_experience' => '6',
                'languages_spoken' => 'English, Filipino',
                'areas_of_expertise' => 'Hiking and culture',
                'tour_categories' => ['Hiking', 'Cultural Tours'],
                'nbi_clearance' => [
                    'id' => 'f_nbi',
                    'name' => 'nbi-clearance.pdf',
                    'status' => 'uploaded',
                ],
                'tourism_accreditation_upload' => [
                    'id' => 'f_acc',
                    'name' => 'tourism-accreditation.pdf',
                    'status' => 'uploaded',
                ],
            ],
        ]);

        $response->assertOk();
        $response->assertJsonPath('redirect', '/?signup=success&application=pending&role=guide');

        $this->assertDatabaseHas('users', [
            'email' => $email,
            'role' => 'guide',
            'guide_verification_status' => 'pending',
        ]);

        $this->assertDatabaseHas('guide_profiles', [
            'guide_certificate_number' => 'GUIDE-7788',
            'years_of_experience' => 6,
        ]);

        $this->assertDatabaseCount('verification_documents', 3);
    }

    public function test_legacy_registration_requires_verified_otp_flag(): void
    {
        $response = $this->postJson(route('auth.register.legacy'), [
            'name' => 'No OTP User',
            'email' => 'legacy.nootp@example.test',
            'password' => 'Str0ng!Pass',
            'password_confirmation' => 'Str0ng!Pass',
            'role' => 'guide',
            'otp_verified' => false,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['otp_verified']);
    }
}
