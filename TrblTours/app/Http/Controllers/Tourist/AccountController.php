<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'ok' => true,
            'account' => [
                'id' => (string) $user->id,
                'name' => (string) $user->name,
                'email' => (string) $user->email,
                'role' => (string) ($user->role ?: 'tourist'),
                'joinedDate' => optional($user->created_at)->format('F d, Y'),
                'status' => $user->email_verified_at ? 'Active' : 'Pending Verification',
            ],
            'pusher' => [
                'key' => (string) env('PUSHER_APP_KEY'),
                'cluster' => (string) env('PUSHER_APP_CLUSTER', 'ap1'),
            ],
        ]);
    }
}
