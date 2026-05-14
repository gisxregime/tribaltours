<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Str;

class DomainNotification
{
    public static function notifyUser(?User $user, string $type, string $text, array $payload = []): void
    {
        if (!$user) {
            return;
        }

        $user->notifications()->create([
            'id' => (string) Str::uuid(),
            'type' => $type,
            'data' => [
                'type' => $type,
                'text' => $text,
                'payload' => $payload,
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
}
