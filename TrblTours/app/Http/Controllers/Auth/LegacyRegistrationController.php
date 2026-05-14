<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\GuideProfile;
use App\Models\OnboardingConsent;
use App\Models\OtpVerification;
use App\Models\User;
use App\Models\UserProfile;
use App\Models\VerificationDocument;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class LegacyRegistrationController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', 'in:tourist,guide'],
            'phone' => ['nullable', 'string', 'max:40'],
            'location' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'otp_verified' => ['nullable', 'boolean'],
            'personal_information' => ['nullable', 'array'],
            'personal_information.full_name' => ['nullable', 'array'],
            'personal_information.full_name.first_name' => ['nullable', 'string', 'max:120'],
            'personal_information.full_name.middle_name' => ['nullable', 'string', 'max:120'],
            'personal_information.full_name.last_name' => ['nullable', 'string', 'max:120'],
            'personal_information.full_name.suffix' => ['nullable', 'string', 'max:20'],
            'personal_information.gender' => ['nullable', 'string', 'max:40'],
            'personal_information.birth_date' => ['nullable', 'date'],
            'personal_information.age' => ['nullable', 'integer', 'min:0', 'max:120'],
            'personal_information.nationality' => ['nullable', 'string', 'max:120'],
            'personal_information.email_address' => ['nullable', 'email', 'max:255'],
            'personal_information.phone_number' => ['nullable', 'array'],
            'personal_information.phone_number.country_code' => ['nullable', 'string', 'max:10'],
            'personal_information.phone_number.local_number' => ['nullable', 'string', 'max:40'],
            'personal_information.phone_number.e164' => ['nullable', 'string', 'max:40'],
            'address_information' => ['nullable', 'array'],
            'address_information.full_address' => ['nullable', 'string', 'max:1000'],
            'address_information.city' => ['nullable', 'string', 'max:120'],
            'address_information.province' => ['nullable', 'string', 'max:120'],
            'address_information.country' => ['nullable', 'string', 'max:120'],
            'agreements' => ['nullable', 'array'],
            'agreements.terms_accepted' => ['nullable', 'boolean'],
            'agreements.privacy_accepted' => ['nullable', 'boolean'],
            'agreements.info_accuracy_confirmed' => ['nullable', 'boolean'],
            'agreements.verification_consent' => ['nullable', 'boolean'],
            'agreements.commission_policy_accepted' => ['nullable', 'boolean'],
            'agreements.safety_guidelines_accepted' => ['nullable', 'boolean'],
            'identity_verification' => ['nullable', 'array'],
            'identity_verification.government_id_type' => ['nullable', 'string', 'max:100'],
            'identity_verification.government_id_front' => ['nullable', 'array'],
            'identity_verification.government_id_back' => ['nullable', 'array'],
            'professional_verification' => ['nullable', 'array'],
            'professional_verification.nbi_expiration_date' => ['nullable', 'date'],
            'professional_verification.barangay_issued_date' => ['nullable', 'date'],
            'professional_verification.guide_certificate_number' => ['nullable', 'string', 'max:120'],
            'professional_verification.years_of_experience' => ['nullable', 'string', 'max:10'],
            'professional_verification.languages_spoken' => ['nullable', 'string', 'max:255'],
            'professional_verification.areas_of_expertise' => ['nullable', 'string', 'max:1000'],
            'professional_verification.tour_categories' => ['nullable', 'array'],
            'professional_verification.tour_categories.*' => ['string', 'max:80'],
            'professional_verification.nbi_clearance' => ['nullable', 'array'],
            'professional_verification.barangay_clearance' => ['nullable', 'array'],
            'professional_verification.guide_certificate_upload' => ['nullable', 'array'],
            'professional_verification.tourism_accreditation_upload' => ['nullable', 'array'],
            'metadata' => ['nullable', 'array'],
            'metadata.source' => ['nullable', 'string', 'max:80'],
            'metadata.account_review_status' => ['nullable', 'string', 'max:50'],
            'metadata.generated_at' => ['nullable', 'string', 'max:50'],
        ]);

        if (!($payload['otp_verified'] ?? false)) {
            return response()->json([
                'message' => 'OTP verification is required before account creation.',
                'errors' => [
                    'otp_verified' => ['OTP verification is required before account creation.'],
                ],
            ], 422);
        }

        $otpVerified = OtpVerification::query()
            ->where('email', $payload['email'])
            ->where('purpose', 'register')
            ->whereNotNull('verified_at')
            ->exists();

        if (!$otpVerified) {
            return response()->json([
                'message' => 'No verified OTP found for this email. Please verify OTP first.',
                'errors' => [
                    'otp_verified' => ['No verified OTP found for this email. Please verify OTP first.'],
                ],
            ], 422);
        }

        $fullName = (array) data_get($payload, 'personal_information.full_name', []);
        $phone = (array) data_get($payload, 'personal_information.phone_number', []);
        $address = (array) data_get($payload, 'address_information', []);
        $agreements = (array) data_get($payload, 'agreements', []);
        $identity = (array) data_get($payload, 'identity_verification', []);
        $professional = (array) data_get($payload, 'professional_verification', []);
        $metadata = (array) data_get($payload, 'metadata', []);

        $resolvedLocation = $payload['location']
            ?? collect([
                data_get($address, 'city'),
                data_get($address, 'province'),
                data_get($address, 'country'),
            ])->filter()->join(', ');

        $user = DB::transaction(function () use ($payload, $fullName, $phone, $address, $agreements, $identity, $professional, $metadata, $resolvedLocation) {
            $user = User::query()->create([
                'name' => $payload['name'],
                'email' => $payload['email'],
                'phone' => $payload['phone'] ?? data_get($phone, 'e164'),
                'role' => $payload['role'],
                'location' => $resolvedLocation ?: null,
                'bio' => $payload['bio'] ?? data_get($address, 'full_address'),
                'onboarding_step' => 4,
                'is_profile_completed' => true,
                'guide_verification_status' => $payload['role'] === 'guide' ? 'pending' : null,
                'email_verified_at' => now(),
                'password' => $payload['password'],
            ]);

            UserProfile::query()->create([
                'user_id' => $user->id,
                'first_name' => data_get($fullName, 'first_name'),
                'middle_name' => data_get($fullName, 'middle_name'),
                'last_name' => data_get($fullName, 'last_name'),
                'suffix' => data_get($fullName, 'suffix'),
                'gender' => data_get($payload, 'personal_information.gender'),
                'birth_date' => data_get($payload, 'personal_information.birth_date'),
                'age' => data_get($payload, 'personal_information.age'),
                'nationality' => data_get($payload, 'personal_information.nationality'),
                'mobile_country_code' => data_get($phone, 'country_code'),
                'mobile_number_local' => data_get($phone, 'local_number'),
                'mobile_number_e164' => data_get($phone, 'e164'),
                'email_address' => data_get($payload, 'personal_information.email_address', $payload['email']),
                'current_address' => data_get($address, 'full_address'),
                'city' => data_get($address, 'city'),
                'province_state' => data_get($address, 'province'),
                'country' => data_get($address, 'country'),
            ]);

            OnboardingConsent::query()->create([
                'user_id' => $user->id,
                'terms_accepted' => (bool) data_get($agreements, 'terms_accepted'),
                'privacy_accepted' => (bool) data_get($agreements, 'privacy_accepted'),
                'info_accuracy_confirmed' => (bool) data_get($agreements, 'info_accuracy_confirmed'),
                'verification_consent' => (bool) data_get($agreements, 'verification_consent'),
                'commission_policy_accepted' => (bool) data_get($agreements, 'commission_policy_accepted'),
                'safety_guidelines_accepted' => (bool) data_get($agreements, 'safety_guidelines_accepted'),
                'consented_at' => now(),
                'metadata' => [
                    'source' => data_get($metadata, 'source', 'legacy_onboarding_ui'),
                    'account_review_status' => data_get($metadata, 'account_review_status', 'pending_review'),
                    'generated_at' => data_get($metadata, 'generated_at'),
                ],
            ]);

            if ($payload['role'] === 'guide') {
                $yearsRaw = data_get($professional, 'years_of_experience');
                GuideProfile::query()->create([
                    'user_id' => $user->id,
                    'nbi_expiration_date' => data_get($professional, 'nbi_expiration_date'),
                    'barangay_issued_date' => data_get($professional, 'barangay_issued_date'),
                    'guide_certificate_number' => data_get($professional, 'guide_certificate_number'),
                    'years_of_experience' => is_numeric($yearsRaw) ? (int) $yearsRaw : null,
                    'languages_spoken' => data_get($professional, 'languages_spoken'),
                    'areas_of_expertise' => data_get($professional, 'areas_of_expertise'),
                    'tour_categories' => data_get($professional, 'tour_categories', []),
                ]);
            }

            $this->createVerificationDocument(
                $user,
                data_get($identity, 'government_id_front'),
                'government_id',
                data_get($identity, 'government_id_type'),
                'Government ID Front'
            );
            $this->createVerificationDocument(
                $user,
                data_get($identity, 'government_id_back'),
                'government_id',
                data_get($identity, 'government_id_type'),
                'Government ID Back'
            );
            $this->createVerificationDocument(
                $user,
                data_get($professional, 'nbi_clearance'),
                'license',
                null,
                'NBI Clearance'
            );
            $this->createVerificationDocument(
                $user,
                data_get($professional, 'barangay_clearance'),
                'other',
                null,
                'Barangay Clearance'
            );
            $this->createVerificationDocument(
                $user,
                data_get($professional, 'guide_certificate_upload'),
                'license',
                data_get($professional, 'guide_certificate_number'),
                'Guide Certificate'
            );
            $this->createVerificationDocument(
                $user,
                data_get($professional, 'tourism_accreditation_upload'),
                'business_permit',
                null,
                'Tourism Accreditation'
            );

            return $user;
        });

        event(new Registered($user));

        Auth::login($user);
        $request->session()->regenerate();

        $isGuide = ($payload['role'] ?? 'tourist') === 'guide';

        return response()->json([
            'message' => $isGuide
                ? 'Account created successfully. Your guide application is pending admin approval.'
                : 'Account created successfully.',
            'redirect' => $isGuide
                ? '/?signup=success&application=pending&role=guide'
                : '/?signup=success&role=tourist',
        ]);
    }

    private function createVerificationDocument(User $user, mixed $document, string $documentType, ?string $documentNumber, string $label): void
    {
        if (!is_array($document)) {
            return;
        }

        $fileName = (string) data_get($document, 'name', '');
        $status = strtolower((string) data_get($document, 'status', ''));
        if ($fileName === '' || ($status !== '' && $status !== 'uploaded')) {
            return;
        }

        $baseName = pathinfo($fileName, PATHINFO_FILENAME);
        $extension = strtolower((string) pathinfo($fileName, PATHINFO_EXTENSION));
        $extension = $extension !== '' ? $extension : 'bin';
        $slug = Str::slug($baseName ?: $label) ?: 'document';
        $filePath = sprintf(
            'legacy-onboarding/%d/%s-%s.%s',
            $user->id,
            $slug,
            (string) data_get($document, 'id', Str::random(8)),
            $extension
        );

        VerificationDocument::query()->create([
            'user_id' => $user->id,
            'document_type' => $documentType,
            'document_number' => $documentNumber,
            'file_path' => $filePath,
            'status' => 'pending',
            'notes' => json_encode([
                'label' => $label,
                'source' => 'legacy_onboarding_ui',
                'original_name' => $fileName,
                'client_payload' => $document,
            ], JSON_UNESCAPED_SLASHES),
        ]);
    }
}
