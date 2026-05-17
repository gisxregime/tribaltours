<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class DomainNotification
{
    public static function notifyUser(?User $user, string $type, string $text, array $payload = []): void
    {
        if (!$user) {
            return;
        }

        $enrichedPayload = self::enrichPayload($payload);
        $actorId = self::extractActorId($enrichedPayload);
        $actorName = self::extractActorName($enrichedPayload);
        $actorAvatar = self::extractActorAvatar($enrichedPayload);

        $user->notifications()->create([
            'id' => (string) Str::uuid(),
            'type' => $type,
            'data' => [
                'type' => $type,
                'text' => $text,
                'payload' => $enrichedPayload,
                'actor_id' => $actorId > 0 ? $actorId : null,
                'actor_name' => $actorName !== '' ? $actorName : null,
                'actor_avatar' => $actorAvatar !== '' ? $actorAvatar : null,
            ],
        ]);
    }

    /**
     * @param iterable<User> $users
     */
    public static function notifyUsers(iterable $users, string $type, string $text, array $payload = []): void
    {
        foreach ($users as $user) {
            self::notifyUser($user, $type, $text, $payload);
        }
    }

    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>
     */
    private static function enrichPayload(array $payload): array
    {
        $actor = Auth::user();
        if (!$actor instanceof User) {
            return $payload;
        }

        if (!array_key_exists('actorId', $payload) && !array_key_exists('actor_id', $payload) && !array_key_exists('senderId', $payload) && !array_key_exists('sender_id', $payload)) {
            $payload['actorId'] = (string) $actor->id;
            $payload['actor_id'] = (string) $actor->id;
        }

        $name = trim((string) ($actor->name ?? ''));
        if ($name !== '' && !array_key_exists('actorName', $payload) && !array_key_exists('actor_name', $payload) && !array_key_exists('senderName', $payload) && !array_key_exists('sender_name', $payload)) {
            $payload['actorName'] = $name;
            $payload['actor_name'] = $name;
        }

        $avatar = self::resolveAvatarPath($actor->avatar_path);
        if ($avatar !== '' && !array_key_exists('actorAvatar', $payload) && !array_key_exists('actor_avatar', $payload) && !array_key_exists('senderAvatar', $payload) && !array_key_exists('sender_avatar', $payload) && !array_key_exists('avatar', $payload)) {
            $payload['actorAvatar'] = $avatar;
            $payload['actor_avatar'] = $avatar;
        }

        return $payload;
    }

    /**
     * @param array<string, mixed> $payload
     */
    private static function extractActorId(array $payload): int
    {
        $candidates = [
            $payload['actorId'] ?? null,
            $payload['actor_id'] ?? null,
            $payload['senderId'] ?? null,
            $payload['sender_id'] ?? null,
        ];

        foreach ($candidates as $candidate) {
            if (is_int($candidate) || is_float($candidate) || (is_string($candidate) && trim($candidate) !== '')) {
                $value = (int) $candidate;
                if ($value > 0) {
                    return $value;
                }
            }
        }

        return 0;
    }

    /**
     * @param array<string, mixed> $payload
     */
    private static function extractActorName(array $payload): string
    {
        $candidates = [
            $payload['actorName'] ?? null,
            $payload['actor_name'] ?? null,
            $payload['senderName'] ?? null,
            $payload['sender_name'] ?? null,
        ];

        foreach ($candidates as $candidate) {
            if (!is_string($candidate)) {
                continue;
            }

            $value = trim($candidate);
            if ($value !== '') {
                return $value;
            }
        }

        return '';
    }

    /**
     * @param array<string, mixed> $payload
     */
    private static function extractActorAvatar(array $payload): string
    {
        $candidates = [
            $payload['actorAvatar'] ?? null,
            $payload['actor_avatar'] ?? null,
            $payload['senderAvatar'] ?? null,
            $payload['sender_avatar'] ?? null,
            $payload['avatar'] ?? null,
        ];

        foreach ($candidates as $candidate) {
            if (!is_string($candidate)) {
                continue;
            }

            $value = trim($candidate);
            if ($value !== '') {
                return self::resolveAvatarPath($value);
            }
        }

        return '';
    }

    private static function resolveAvatarPath(?string $path): string
    {
        $raw = trim((string) ($path ?? ''));
        if ($raw === '') {
            return '';
        }

        if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://') || str_starts_with($raw, 'data:')) {
            return $raw;
        }

        return '/' . ltrim($raw, '/');
    }
}
