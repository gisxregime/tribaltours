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

            return [
                'id' => (string) $notification->id,
                'type' => $type,
                'text' => (string) ($data['text'] ?? Str::headline(str_replace(['.', '_'], ' ', $type))),
                'payload' => is_array($data['payload'] ?? null) ? $data['payload'] : [],
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
}
