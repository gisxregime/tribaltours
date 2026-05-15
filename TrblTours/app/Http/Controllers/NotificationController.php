<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = $request->user()?->notifications()->latest()->limit(80)->get()->map(function ($notification) {
            $data = is_array($notification->data) ? $notification->data : [];
            $type = (string) ($data['type'] ?? $notification->type);
            $payload = is_array($data['payload'] ?? null) ? $data['payload'] : [];
            $fullText = (string) ($data['text'] ?? Str::headline(str_replace(['.', '_'], ' ', $type)));
            $targetTitle = $this->firstNonEmptyString([
                $data['target_title'] ?? null,
                $payload['targetTitle'] ?? null,
                $payload['tourTitle'] ?? null,
                $payload['requestTitle'] ?? null,
                $payload['title'] ?? null,
            ]);
            $actorName = $this->firstNonEmptyString([
                $data['actor_name'] ?? null,
                $payload['actorName'] ?? null,
                $payload['senderName'] ?? null,
                $payload['touristName'] ?? null,
                $payload['guideName'] ?? null,
            ]);
            if ($actorName === '') {
                $actorName = $this->guessActorName($fullText);
            }
            if ($actorName === '') {
                $actorName = 'System';
            }

            $actionText = $this->firstNonEmptyString([
                $data['action_text'] ?? null,
                $payload['actionText'] ?? null,
            ]);
            if ($actionText === '') {
                $actionText = $this->guessActionText($fullText, $actorName, $targetTitle !== '' ? $targetTitle : null);
            }
            if ($actionText === '') {
                $actionText = $fullText;
            }

            $actorAvatar = $this->firstNonEmptyString([
                $data['actor_avatar'] ?? null,
                $payload['actorAvatar'] ?? null,
                $payload['senderAvatar'] ?? null,
                $payload['avatar'] ?? null,
            ]);

            return [
                'id' => (string) $notification->id,
                'type' => $type,
                'text' => $fullText,
                'fullText' => $fullText,
                'actorName' => $actorName,
                'actorAvatar' => $actorAvatar,
                'actionText' => $actionText,
                'targetTitle' => $targetTitle,
                'payload' => $payload,
                'read' => !is_null($notification->read_at),
                'createdAt' => optional($notification->created_at)->toISOString(),
                'time' => optional($notification->created_at)->diffForHumans(),
            ];
        })->values() ?? [];

        return response()->json([
            'ok' => true,
            'items' => $items,
            'pusher' => [
                'key' => env('PUSHER_APP_KEY'),
                'cluster' => env('PUSHER_APP_CLUSTER', 'ap1'),
            ],
        ]);
    }

    public function markRead(Request $request, string $notificationId): JsonResponse
    {
        $notification = $request->user()
            ?->notifications()
            ->where('id', $notificationId)
            ->firstOrFail();

        if (is_null($notification->read_at)) {
            $notification->forceFill(['read_at' => now()])->save();
        }

        return response()->json([
            'ok' => true,
        ]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()
            ?->notifications()
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'ok' => true,
        ]);
    }

    public function destroy(Request $request, string $notificationId): JsonResponse
    {
        $request->user()
            ?->notifications()
            ->where('id', $notificationId)
            ->delete();

        return response()->json([
            'ok' => true,
        ]);
    }

    public function clearAll(Request $request): JsonResponse
    {
        $request->user()
            ?->notifications()
            ->delete();

        return response()->json([
            'ok' => true,
        ]);
    }

    /**
     * @param array<int, mixed> $values
     */
    private function firstNonEmptyString(array $values): string
    {
        foreach ($values as $value) {
            if (!is_string($value)) {
                continue;
            }

            $trimmed = trim($value);
            if ($trimmed !== '') {
                return $trimmed;
            }
        }

        return '';
    }

    private function guessActorName(string $fullText): string
    {
        $message = trim($fullText);
        if ($message === '') {
            return '';
        }

        if (!preg_match('/^([A-Z][a-zA-Z0-9\-]+(?:\s+[A-Z][a-zA-Z0-9\-]+){0,2})\b/', $message, $matches)) {
            return '';
        }

        $candidate = trim((string) ($matches[1] ?? ''));
        if ($candidate === '') {
            return '';
        }

        $reserved = ['your', 'new', 'booking', 'tour', 'request', 'payment', 'profile', 'system'];
        if (in_array(Str::lower($candidate), $reserved, true)) {
            return '';
        }

        return $candidate;
    }

    private function guessActionText(string $fullText, string $actorName, ?string $targetTitle): string
    {
        $message = trim($fullText);
        if ($message === '') {
            return '';
        }

        if ($actorName !== '' && Str::startsWith($message, $actorName . ' ')) {
            $message = trim(substr($message, strlen($actorName)));
        }

        $target = trim((string) $targetTitle);
        if ($target !== '' && Str::endsWith($message, $target)) {
            $message = trim(substr($message, 0, -strlen($target)));
        }

        return trim($message, " -:\t\n\r\0\x0B");
    }
}
