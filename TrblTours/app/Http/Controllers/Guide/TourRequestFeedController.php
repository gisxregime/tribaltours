<?php

namespace App\Http\Controllers\Guide;

use App\Events\TourRequestUpdated;
use App\Http\Controllers\Controller;
use App\Models\TourRequest;
use App\Models\User;
use App\Support\DomainNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TourRequestFeedController extends Controller
{
    public function index(): JsonResponse
    {
        $requests = TourRequest::query()
            ->with(['tourist', 'selectedGuide'])
            ->whereIn('status', ['open', 'negotiating'])
            ->latest()
            ->limit(100)
            ->get()
            ->map(function (TourRequest $tourRequest) {
                return $this->presentRequest($tourRequest);
            })
            ->values();

        return response()->json([
            'ok' => true,
            'requests' => $requests,
            'pusher' => [
                'key' => env('PUSHER_APP_KEY'),
                'cluster' => env('PUSHER_APP_CLUSTER', 'ap1'),
            ],
        ]);
    }

    public function comment(Request $request, TourRequest $tourRequest): JsonResponse
    {
        $guideId = (int) $request->user()->id;
        if ($tourRequest->selected_guide_id) {
            if ((int) $tourRequest->selected_guide_id !== $guideId) {
                return response()->json([
                    'ok' => false,
                    'message' => 'This negotiation is private to the selected guide and tourist.',
                ], 403);
            }

            return response()->json([
                'ok' => false,
                'message' => 'Negotiation is locked after guide selection. Continue in private chat.',
            ], 422);
        }

        if (!in_array((string) $tourRequest->status, ['open', 'negotiating'], true)) {
            return response()->json([
                'ok' => false,
                'message' => 'This request is no longer open for negotiation.',
            ], 422);
        }

        $payload = $request->validate([
            'text' => ['required', 'string', 'max:2000'],
            'offer_amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $metadata = is_array($tourRequest->metadata) ? $tourRequest->metadata : [];
        $comments = is_array($metadata['comments'] ?? null) ? $metadata['comments'] : [];

        $comments[] = [
            'id' => (string) Str::uuid(),
            'guideId' => (string) $request->user()->id,
            'authorId' => (string) $request->user()->id,
            'authorRole' => 'guide',
            'guideName' => trim((string) $request->user()->name),
            'guideAvatar' => $this->resolveAvatarPath($request->user()->avatar_path),
            'text' => trim((string) $payload['text']),
            'offerAmount' => isset($payload['offer_amount']) ? (float) $payload['offer_amount'] : null,
            'createdAt' => now()->toISOString(),
        ];

        $metadata['comments'] = $comments;
        $nextStatus = $tourRequest->status;
        if ($nextStatus === 'open') {
            $nextStatus = 'negotiating';
        }

        $tourRequest->update([
            'status' => $nextStatus,
            'metadata' => $metadata,
        ]);

        $tourRequest->loadMissing('tourist');
        DomainNotification::notifyUser(
            $tourRequest->tourist,
            'tour-request.updated',
            trim((string) $request->user()->name) . ' commented on your request "' . trim((string) $tourRequest->title) . '".',
            [
                'requestId' => (string) $tourRequest->id,
            ]
        );

        event(new TourRequestUpdated($tourRequest->fresh(['tourist', 'selectedGuide'])));

        return response()->json([
            'ok' => true,
            'request' => $this->presentRequest($tourRequest->fresh(['tourist', 'selectedGuide'])),
        ]);
    }

    private function presentRequest(TourRequest $tourRequest): array
    {
        $tourist = $tourRequest->tourist;
        $selectedGuide = $tourRequest->selectedGuide;
        $metadata = is_array($tourRequest->metadata) ? $tourRequest->metadata : [];
        $locationBits = array_filter([
            $tourRequest->city,
            $tourRequest->province,
        ]);

        $rawComments = is_array($metadata['comments'] ?? null) ? $metadata['comments'] : [];
        $guideIds = collect($rawComments)->map(function ($entry) {
            if (!is_array($entry) || !isset($entry['guideId'])) {
                return null;
            }

            $value = (int) $entry['guideId'];
            return $value > 0 ? $value : null;
        })->filter()->unique()->values();

        $guideLookup = User::query()
            ->whereIn('id', $guideIds)
            ->get()
            ->keyBy('id');

        $comments = array_values(array_filter(array_map(function ($entry) use ($guideLookup, $tourist) {
            if (!is_array($entry)) {
                return null;
            }

            $text = trim((string) ($entry['text'] ?? ''));
            if ($text === '') {
                return null;
            }

            $guideIdValue = isset($entry['guideId']) ? (int) $entry['guideId'] : 0;
            $guideId = $guideIdValue > 0 ? (string) $guideIdValue : null;
            $guideModel = $guideId !== null ? $guideLookup->get($guideIdValue) : null;

            return [
                'id' => (string) ($entry['id'] ?? Str::uuid()),
                'guideId' => $guideId,
                'guideName' => trim((string) ($guideModel?->name ?? ($tourist?->name ?? ($entry['guideName'] ?? 'Guide')))),
                'guideAvatar' => $this->resolveAvatarPath(
                    $guideModel?->avatar_path
                        ?? ($guideId === null ? $tourist?->avatar_path : null)
                        ?? ($entry['guideAvatar'] ?? null)
                ),
                'text' => $text,
                'offerAmount' => isset($entry['offerAmount']) ? (float) $entry['offerAmount'] : null,
                'createdAt' => (string) ($entry['createdAt'] ?? now()->toISOString()),
            ];
        }, $rawComments)));

        return [
            'id' => (string) $tourRequest->id,
            'touristName' => trim((string) ($tourist->name ?? 'Tourist')),
            'touristAvatar' => $this->resolveAvatarPath($tourist?->avatar_path),
            'title' => (string) $tourRequest->title,
            'description' => (string) ($tourRequest->description ?? ''),
            'location' => $locationBits ? implode(', ', $locationBits) : 'Philippines',
            'budgetMin' => (float) ($tourRequest->budget_min ?? 0),
            'budgetMax' => (float) ($tourRequest->budget_max ?? ($tourRequest->budget_min ?? 0)),
            'duration' => (string) ($tourRequest->duration_label ?: 'Flexible'),
            'travelers' => (string) ($tourRequest->travelers_label ?: '1 traveler'),
            'interests' => array_values(array_filter(array_map(function ($value) {
                return trim((string) $value);
            }, is_array($tourRequest->interests) ? $tourRequest->interests : []))),
            'status' => (string) $tourRequest->status,
            'selectedGuideId' => $tourRequest->selected_guide_id ? (string) $tourRequest->selected_guide_id : null,
            'selectedGuideName' => $selectedGuide ? trim((string) $selectedGuide->name) : null,
            'selectedGuideAvatar' => $this->resolveAvatarPath($selectedGuide?->avatar_path),
            'comments' => $comments,
            'createdAt' => optional($tourRequest->created_at)->toISOString(),
            'updatedAt' => optional($tourRequest->updated_at)->toISOString(),
        ];
    }

    private function resolveAvatarPath(?string $path): string
    {
        $raw = trim((string) ($path ?? ''));
        if ($raw === '') {
            return '/images/manila.jpg';
        }

        if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://') || str_starts_with($raw, 'data:')) {
            return $raw;
        }

        return '/' . ltrim($raw, '/');
    }
}
