<?php

namespace App\Http\Controllers\Guide;

use App\Events\BookingStatusUpdated;
use App\Events\GuideProfileUpdated;
use App\Events\TourListingUpdated;
use App\Events\TourRequestUpdated;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\GuideProfile;
use App\Models\TourListing;
use App\Models\TourRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\Rule;

class AccountController extends Controller
{
    private const DEFAULT_AVATAR = '/images/manila.jpg';

    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->loadMissing('guideProfile');

        return response()->json([
            'ok' => true,
            'profile' => $this->presentProfile($user),
            'pusher' => [
                'key' => (string) env('PUSHER_APP_KEY'),
                'cluster' => (string) env('PUSHER_APP_CLUSTER', 'ap1'),
            ],
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user()->loadMissing('guideProfile');

        $payload = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'phone' => ['nullable', 'string', 'max:40'],
            'location' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'specialties' => ['nullable', 'string', 'max:2000'],
            'languages' => ['nullable', 'string', 'max:255'],
            'certifications' => ['nullable', 'string', 'max:255'],
            'social' => ['nullable', 'string', 'max:1000'],
            'years_of_experience' => ['nullable', 'integer', 'min:0', 'max:80'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        $oldAvatarPath = (string) ($user->avatar_path ?? '');
        $avatarChanged = false;

        if ($request->hasFile('avatar')) {
            $avatarFile = $request->file('avatar');
            $avatarDir = public_path('images/avatars');
            if (!File::exists($avatarDir)) {
                File::makeDirectory($avatarDir, 0755, true);
            }

            $avatarFileName = 'avatar_' . $user->id . '_' . now()->format('YmdHis') . '_' . mt_rand(1000, 9999) . '.' . strtolower((string) $avatarFile->getClientOriginalExtension());
            $avatarFile->move($avatarDir, $avatarFileName);
            $user->avatar_path = 'images/avatars/' . $avatarFileName;
            $avatarChanged = true;
        }

        $user->fill([
            'name' => $payload['name'],
            'email' => $payload['email'],
            'phone' => $payload['phone'] ?? null,
            'location' => $payload['location'] ?? null,
            'bio' => $payload['bio'] ?? null,
        ]);

        $settings = is_array($user->account_settings) ? $user->account_settings : [];
        $settings['social_links'] = trim((string) ($payload['social'] ?? ''));
        $user->account_settings = $settings;
        $user->save();

        $guideProfile = GuideProfile::query()->firstOrNew([
            'user_id' => $user->id,
        ]);

        $guideProfile->fill([
            'areas_of_expertise' => trim((string) ($payload['specialties'] ?? '')),
            'languages_spoken' => trim((string) ($payload['languages'] ?? '')),
            'guide_certificate_number' => trim((string) ($payload['certifications'] ?? '')),
            'years_of_experience' => array_key_exists('years_of_experience', $payload)
                ? (int) $payload['years_of_experience']
                : $guideProfile->years_of_experience,
        ]);
        $guideProfile->save();

        if ($avatarChanged) {
            $this->deleteStoredAvatar($oldAvatarPath);
        }

        $freshGuide = $user->fresh(['guideProfile']);
        event(new GuideProfileUpdated($freshGuide));

        TourListing::query()
            ->where('guide_id', $user->id)
            ->with('guide')
            ->latest('id')
            ->limit(200)
            ->get()
            ->each(function (TourListing $tourListing): void {
                event(new TourListingUpdated($tourListing, 'updated'));
            });

        TourRequest::query()
            ->where('selected_guide_id', $user->id)
            ->with(['tourist', 'selectedGuide'])
            ->latest('id')
            ->limit(200)
            ->get()
            ->each(function (TourRequest $tourRequest): void {
                event(new TourRequestUpdated($tourRequest));
            });

        Booking::query()
            ->where('guide_id', $user->id)
            ->with(['guide', 'tourListing'])
            ->latest('id')
            ->limit(200)
            ->get()
            ->each(function (Booking $booking): void {
                event(new BookingStatusUpdated($booking));
            });

        return response()->json([
            'ok' => true,
            'message' => 'Guide profile updated successfully.',
            'profile' => $this->presentProfile($freshGuide),
        ]);
    }

    private function presentProfile(User $user): array
    {
        $profile = $user->guideProfile;
        $settings = is_array($user->account_settings) ? $user->account_settings : [];

        return [
            'id' => (string) $user->id,
            'name' => (string) ($user->name ?? ''),
            'email' => (string) ($user->email ?? ''),
            'phone' => (string) ($user->phone ?? ''),
            'location' => (string) ($user->location ?? ''),
            'bio' => (string) ($user->bio ?? ''),
            'avatar' => $this->resolveAvatarPath($user->avatar_path),
            'specialties' => (string) ($profile?->areas_of_expertise ?? ''),
            'languages' => (string) ($profile?->languages_spoken ?? ''),
            'certifications' => (string) ($profile?->guide_certificate_number ?? ''),
            'yearsOfExperience' => (int) ($profile?->years_of_experience ?? 0),
            'social' => (string) ($settings['social_links'] ?? ''),
            'verificationStatus' => (string) ($user->guide_verification_status ?? 'pending'),
            'joinedDate' => optional($user->created_at)->format('F d, Y'),
        ];
    }

    private function resolveAvatarPath(?string $path): string
    {
        $raw = trim((string) ($path ?? ''));
        if ($raw === '') {
            return self::DEFAULT_AVATAR;
        }

        if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://') || str_starts_with($raw, 'data:')) {
            return $raw;
        }

        return '/' . ltrim($raw, '/');
    }

    private function deleteStoredAvatar(string $path): void
    {
        $normalized = ltrim(trim($path), '/');
        if (!str_starts_with($normalized, 'images/avatars/')) {
            return;
        }

        $absolutePath = public_path($normalized);
        if (File::exists($absolutePath)) {
            File::delete($absolutePath);
        }
    }
}
