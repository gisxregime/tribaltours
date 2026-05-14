<?php

namespace App\Http\Controllers\Guide;

use App\Events\TourRequestUpdated;
use App\Http\Controllers\Controller;
use App\Models\TourRequest;
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
            ->whereIn('status', ['open', 'negotiating', 'closed'])
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
        $payload = $request->validate([
            'text' => ['required', 'string', 'max:2000'],
            'offer_amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $metadata = is_array($tourRequest->metadata) ? $tourRequest->metadata : [];
        $comments = is_array($metadata['comments'] ?? null) ? $metadata['comments'] : [];

        $comments[] = [
            'id' => (string) Str::uuid(),
            'guideId' => (string) $request->user()->id,
            'guideName' => trim((string) $request->user()->name),
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

        $comments = array_values(array_filter(array_map(function ($entry) {
            if (!is_array($entry)) {
                return null;
            }

            $text = trim((string) ($entry['text'] ?? ''));
            if ($text === '') {
                return null;
            }

            return [
                'id' => (string) ($entry['id'] ?? Str::uuid()),
                'guideId' => isset($entry['guideId']) ? (string) $entry['guideId'] : null,
                'guideName' => trim((string) ($entry['guideName'] ?? 'Guide')),
                'text' => $text,
                'offerAmount' => isset($entry['offerAmount']) ? (float) $entry['offerAmount'] : null,
                'createdAt' => (string) ($entry['createdAt'] ?? now()->toISOString()),
            ];
        }, is_array($metadata['comments'] ?? null) ? $metadata['comments'] : [])));

        return [
            'id' => (string) $tourRequest->id,
            'touristName' => trim((string) ($tourist->name ?? 'Tourist')),
            'touristAvatar' => 'images/manila.jpg',
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
            'comments' => $comments,
            'createdAt' => optional($tourRequest->created_at)->toISOString(),
            'updatedAt' => optional($tourRequest->updated_at)->toISOString(),
        ];
    }
}
