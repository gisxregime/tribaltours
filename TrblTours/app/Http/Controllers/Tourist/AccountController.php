<?php

namespace App\Http\Controllers\Tourist;

use App\Events\TourRequestUpdated;
use App\Http\Controllers\Controller;
use App\Models\TourRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;

class AccountController extends Controller
{
    private const DEFAULT_AVATAR = '/images/manila.jpg';

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $preferences = $this->resolvePreferences($user->account_preferences);
        $settings = $this->resolveSettings($user->account_settings);

        return response()->json([
            'ok' => true,
            'account' => [
                'id' => (string) $user->id,
                'name' => (string) $user->name,
                'email' => (string) $user->email,
                'phone' => (string) ($user->phone ?? ''),
                'bio' => (string) ($user->bio ?? ''),
                'avatar' => $this->resolveAvatarPath($user->avatar_path),
                'role' => (string) ($user->role ?: 'tourist'),
                'joinedDate' => optional($user->created_at)->format('F d, Y'),
                'status' => $user->email_verified_at ? 'Active' : 'Pending Verification',
            ],
            'preferences' => $preferences,
            'settings' => $settings,
            'pusher' => [
                'key' => (string) env('PUSHER_APP_KEY'),
                'cluster' => (string) env('PUSHER_APP_CLUSTER', 'ap1'),
            ],
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

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
            'bio' => ['nullable', 'string', 'max:1000'],
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
            'bio' => $payload['bio'] ?? null,
        ]);

        $user->save();

        if ($avatarChanged) {
            $this->deleteStoredAvatar($oldAvatarPath);

            TourRequest::query()
                ->where('tourist_id', $user->id)
                ->with(['tourist', 'selectedGuide'])
                ->latest('id')
                ->limit(200)
                ->get()
                ->each(function (TourRequest $tourRequest): void {
                    event(new TourRequestUpdated($tourRequest));
                });
        }

        return response()->json([
            'ok' => true,
            'message' => 'Profile updated successfully.',
            'account' => [
                'id' => (string) $user->id,
                'name' => (string) $user->name,
                'email' => (string) $user->email,
                'phone' => (string) ($user->phone ?? ''),
                'bio' => (string) ($user->bio ?? ''),
                'avatar' => $this->resolveAvatarPath($user->avatar_path),
                'role' => (string) ($user->role ?: 'tourist'),
                'joinedDate' => optional($user->created_at)->format('F d, Y'),
                'status' => $user->email_verified_at ? 'Active' : 'Pending Verification',
            ],
        ]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::min(8)->letters()->numbers(), 'confirmed'],
        ]);

        $request->user()->forceFill([
            'password' => Hash::make($payload['password']),
        ])->save();

        return response()->json([
            'ok' => true,
            'message' => 'Password updated successfully.',
        ]);
    }

    public function updatePreferences(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'interests' => ['nullable', 'array'],
            'interests.*' => ['string', 'max:80'],
            'notify_booking_updates' => ['nullable', 'boolean'],
            'notify_messages' => ['nullable', 'boolean'],
            'notify_weekly_suggestions' => ['nullable', 'boolean'],
        ]);

        $user = $request->user();
        $preferences = $this->resolvePreferences($user->account_preferences);

        $preferences['interests'] = array_values(array_unique(array_filter(array_map(function ($value) {
            return trim((string) $value);
        }, $payload['interests'] ?? $preferences['interests']))));
        $preferences['notify_booking_updates'] = array_key_exists('notify_booking_updates', $payload)
            ? (bool) $payload['notify_booking_updates']
            : $preferences['notify_booking_updates'];
        $preferences['notify_messages'] = array_key_exists('notify_messages', $payload)
            ? (bool) $payload['notify_messages']
            : $preferences['notify_messages'];
        $preferences['notify_weekly_suggestions'] = array_key_exists('notify_weekly_suggestions', $payload)
            ? (bool) $payload['notify_weekly_suggestions']
            : $preferences['notify_weekly_suggestions'];

        $user->forceFill([
            'account_preferences' => $preferences,
        ])->save();

        return response()->json([
            'ok' => true,
            'message' => 'Preferences saved successfully.',
            'preferences' => $preferences,
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'email_notifications' => ['nullable', 'boolean'],
            'private_profile' => ['nullable', 'boolean'],
        ]);

        $user = $request->user();
        $settings = $this->resolveSettings($user->account_settings);

        $settings['email_notifications'] = array_key_exists('email_notifications', $payload)
            ? (bool) $payload['email_notifications']
            : $settings['email_notifications'];
        $settings['private_profile'] = array_key_exists('private_profile', $payload)
            ? (bool) $payload['private_profile']
            : $settings['private_profile'];

        $user->forceFill([
            'account_settings' => $settings,
        ])->save();

        return response()->json([
            'ok' => true,
            'message' => 'Settings saved successfully.',
            'settings' => $settings,
        ]);
    }

    private function resolvePreferences(mixed $raw): array
    {
        $defaults = [
            'interests' => ['Trekking', 'Nature', 'Water Sports'],
            'notify_booking_updates' => true,
            'notify_messages' => true,
            'notify_weekly_suggestions' => false,
        ];

        $input = is_array($raw) ? $raw : [];

        return [
            'interests' => array_values(array_unique(array_filter(array_map(function ($value) {
                return trim((string) $value);
            }, is_array($input['interests'] ?? null) ? $input['interests'] : $defaults['interests'])))),
            'notify_booking_updates' => array_key_exists('notify_booking_updates', $input)
                ? (bool) $input['notify_booking_updates']
                : $defaults['notify_booking_updates'],
            'notify_messages' => array_key_exists('notify_messages', $input)
                ? (bool) $input['notify_messages']
                : $defaults['notify_messages'],
            'notify_weekly_suggestions' => array_key_exists('notify_weekly_suggestions', $input)
                ? (bool) $input['notify_weekly_suggestions']
                : $defaults['notify_weekly_suggestions'],
        ];
    }

    private function resolveSettings(mixed $raw): array
    {
        $defaults = [
            'email_notifications' => true,
            'private_profile' => false,
        ];

        $input = is_array($raw) ? $raw : [];

        return [
            'email_notifications' => array_key_exists('email_notifications', $input)
                ? (bool) $input['email_notifications']
                : $defaults['email_notifications'],
            'private_profile' => array_key_exists('private_profile', $input)
                ? (bool) $input['private_profile']
                : $defaults['private_profile'],
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
