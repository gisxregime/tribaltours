<?php

namespace App\Http\Controllers\Tourist;

use App\Events\BookingStatusUpdated;
use App\Events\TourRequestUpdated;
use App\Events\TouristMessageSent;
use App\Events\TourRequestCreated;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\TourRequest;
use App\Models\User;
use App\Support\DomainNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\View\View;

class TourRequestController extends Controller
{
    public function index(Request $request): View
    {
        $requests = $request->user()->tourRequests()->latest()->paginate(12);

        return view('legacy.root.my-posts', [
            'requests' => $requests,
            'stats' => $this->buildRequestStats($request->user()),
        ]);
    }

    public function create(): View
    {
        $user = request()->user();

        return view('legacy.root.my-posts', [
            'stats' => $user ? $this->buildRequestStats($user) : [
                'total_requests' => 0,
                'open_requests' => 0,
                'selected_guides' => 0,
                'completed' => 0,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $payload = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'province' => ['nullable', 'string', 'max:120'],
            'city' => ['nullable', 'string', 'max:120'],
            'budget_min' => ['nullable', 'numeric', 'min:0'],
            'budget_max' => ['nullable', 'numeric', 'min:0'],
            'budget' => ['nullable', 'numeric', 'min:0'],
            'duration_label' => ['nullable', 'string', 'max:120'],
            'travelers_label' => ['nullable', 'string', 'max:120'],
            'interests' => ['nullable', 'array'],
            'interests.*' => ['string', 'max:80'],
            'location' => ['nullable', 'string', 'max:120'],
            'region' => ['nullable', 'string', 'max:120'],
            'duration' => ['nullable', 'string', 'max:120'],
            'adults' => ['nullable', 'integer', 'min:1'],
            'children' => ['nullable', 'integer', 'min:0'],
            'budgetMin' => ['nullable', 'numeric', 'min:0'],
            'budgetMax' => ['nullable', 'numeric', 'min:0'],
        ]);

        $budgetMin = $payload['budget_min'] ?? $payload['budgetMin'] ?? $payload['budget'] ?? null;
        $budgetMax = $payload['budget_max'] ?? $payload['budgetMax'] ?? $payload['budget'] ?? $budgetMin;
        $durationLabel = $payload['duration_label'] ?? null;
        if (!$durationLabel && !empty($payload['duration'])) {
            $durationRaw = trim((string) $payload['duration']);
            $durationLabel = preg_match('/day/i', $durationRaw) ? $durationRaw : $durationRaw . ' days';
        }

        $travelersLabel = $payload['travelers_label'] ?? null;
        if (!$travelersLabel) {
            $adults = max(1, (int) ($payload['adults'] ?? 1));
            $children = max(0, (int) ($payload['children'] ?? 0));
            $travelersLabel = $adults . ' adults' . ($children > 0 ? ' / ' . $children . ' children' : '');
        }

        $description = trim((string) ($payload['description'] ?? ''));
        if ($description === '') {
            $description = 'Tour request for ' . trim((string) $payload['title']) . '.';
        }

        $interests = array_values(array_unique(array_filter(array_map(function ($value) {
            return trim((string) $value);
        }, $payload['interests'] ?? []))));

        $tourRequest = TourRequest::create([
            'tourist_id' => $request->user()->id,
            'title' => $payload['title'],
            'description' => $description,
            'province' => $payload['province'] ?? $payload['region'] ?? null,
            'city' => $payload['city'] ?? $payload['location'] ?? null,
            'budget_min' => $budgetMin,
            'budget_max' => $budgetMax,
            'duration_label' => $durationLabel,
            'travelers_label' => $travelersLabel,
            'interests' => $interests,
            'status' => 'open',
            'metadata' => [
                'source' => 'explore-modal',
            ],
        ]);

        $guides = User::query()
            ->where('role', 'guide')
            ->where('id', '!=', $request->user()->id)
            ->limit(100)
            ->get();
        DomainNotification::notifyUsers(
            $guides,
            'tour-request.created',
            trim((string) $request->user()->name) . ' posted a new request: ' . trim((string) $tourRequest->title) . '.',
            [
                'requestId' => (string) $tourRequest->id,
            ]
        );

        event(new TourRequestCreated($tourRequest));

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'ok' => true,
                'request' => $this->presentRequest($tourRequest->fresh(['tourist'])),
            ], 201);
        }

        return redirect()->route('my-posts')->with('status', 'Tour request created.');
    }

    public function mine(Request $request): JsonResponse
    {
        $requests = $request->user()->tourRequests()
            ->with(['tourist', 'selectedGuide'])
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
            'stats' => $this->buildRequestStats($request->user()),
        ]);
    }

    public function addComment(Request $request, TourRequest $tourRequest): JsonResponse
    {
        abort_unless((int) $tourRequest->tourist_id === (int) Auth::id(), 403);

        $payload = $request->validate([
            'text' => ['required', 'string', 'max:2000'],
        ]);

        $metadata = is_array($tourRequest->metadata) ? $tourRequest->metadata : [];
        $comments = is_array($metadata['comments'] ?? null) ? $metadata['comments'] : [];
        $comments[] = [
            'id' => (string) Str::uuid(),
            'guideId' => null,
            'guideName' => trim((string) $request->user()->name),
            'text' => trim((string) $payload['text']),
            'offerAmount' => null,
            'createdAt' => now()->toISOString(),
        ];

        $metadata['comments'] = $comments;
        $tourRequest->update(['metadata' => $metadata]);

        $tourRequest->loadMissing('selectedGuide');
        if ($tourRequest->selectedGuide) {
            DomainNotification::notifyUser(
                $tourRequest->selectedGuide,
                'tour-request.updated',
                trim((string) $request->user()->name) . ' replied to request "' . trim((string) $tourRequest->title) . '".',
                [
                    'requestId' => (string) $tourRequest->id,
                ]
            );
        } else {
            $guides = User::query()
                ->where('role', 'guide')
                ->where('id', '!=', $request->user()->id)
                ->limit(100)
                ->get();
            DomainNotification::notifyUsers(
                $guides,
                'tour-request.updated',
                trim((string) $request->user()->name) . ' updated request "' . trim((string) $tourRequest->title) . '".',
                [
                    'requestId' => (string) $tourRequest->id,
                ]
            );
        }

        event(new TourRequestUpdated($tourRequest->fresh(['tourist', 'selectedGuide'])));

        return response()->json([
            'ok' => true,
            'request' => $this->presentRequest($tourRequest->fresh(['tourist', 'selectedGuide'])),
        ]);
    }

    public function selectGuide(Request $request, TourRequest $tourRequest): JsonResponse
    {
        abort_unless((int) $tourRequest->tourist_id === (int) Auth::id(), 403);

        $payload = $request->validate([
            'guide_id' => ['required', 'exists:users,id'],
            'offer_amount' => ['nullable', 'numeric', 'min:0'],
            'intro_message' => ['nullable', 'string', 'max:2000'],
        ]);

        $guide = User::query()->findOrFail($payload['guide_id']);
        $metadata = is_array($tourRequest->metadata) ? $tourRequest->metadata : [];
        $metadata['selected_guide_name'] = trim((string) $guide->name);
        $metadata['selected_at'] = now()->toISOString();

        $tourRequest->update([
            'selected_guide_id' => $guide->id,
            'status' => 'closed',
            'metadata' => $metadata,
        ]);

        $conversation = Conversation::query()->firstOrCreate(
            [
                'tourist_id' => $request->user()->id,
                'guide_id' => $guide->id,
                'tour_request_id' => $tourRequest->id,
            ],
            [
                'last_message_at' => now(),
            ]
        );

        $guestCount = 1;
        if ($tourRequest->travelers_label) {
            if (preg_match('/(\d+)/', (string) $tourRequest->travelers_label, $matches) === 1) {
                $guestCount = max(1, (int) $matches[1]);
            }
        }

        $amount = (float) ($payload['offer_amount'] ?? $tourRequest->budget_max ?? $tourRequest->budget_min ?? 0);
        $booking = Booking::query()->firstOrCreate(
            [
                'tour_request_id' => $tourRequest->id,
                'tourist_id' => $request->user()->id,
            ],
            [
                'booking_reference' => 'TRBL-' . strtoupper(Str::random(10)),
                'guide_id' => $guide->id,
                'tour_listing_id' => null,
                'guest_count' => $guestCount,
                'price_snapshot' => $amount,
                'total_amount' => $amount,
                'payment_status' => 'unpaid',
                'status' => 'confirmed',
                'reservation_type' => 'manual',
                'notes' => 'Created from guide selection in tourist request workflow.',
                'approved_at' => now(),
            ]
        );

        if ($booking->guide_id !== $guide->id || $booking->status !== 'confirmed') {
            $booking->update([
                'guide_id' => $guide->id,
                'status' => 'confirmed',
                'approved_at' => $booking->approved_at ?: now(),
                'price_snapshot' => $amount,
                'total_amount' => $amount,
            ]);
        }

        $intro = trim((string) ($payload['intro_message'] ?? 'Guide selected. You can now finalize the itinerary and schedule.'));
        $message = Message::query()->create([
            'conversation_id' => $conversation->id,
            'sender_id' => $request->user()->id,
            'body' => $intro,
            'is_read' => false,
        ]);

        $conversation->update(['last_message_at' => now()]);

        DomainNotification::notifyUser(
            $guide,
            'guide.selected',
            trim((string) $request->user()->name) . ' selected you for "' . trim((string) $tourRequest->title) . '".',
            [
                'requestId' => (string) $tourRequest->id,
                'conversationId' => (string) $conversation->id,
                'bookingId' => (string) $booking->id,
            ]
        );
        DomainNotification::notifyUser(
            $request->user(),
            'booking.created',
            'Booking created successfully for "' . trim((string) $tourRequest->title) . '".',
            [
                'bookingId' => (string) $booking->id,
            ]
        );

        event(new TourRequestUpdated($tourRequest->fresh(['tourist', 'selectedGuide'])));
        event(new BookingStatusUpdated($booking->fresh(['guide', 'tourListing'])));
        event(new TouristMessageSent($message->fresh(['conversation', 'sender'])));

        return response()->json([
            'ok' => true,
            'request' => $this->presentRequest($tourRequest->fresh(['tourist', 'selectedGuide'])),
            'bookingId' => (string) $booking->id,
            'conversationId' => (string) $conversation->id,
            'redirect' => '/messages?conversation=' . urlencode((string) $conversation->id),
        ]);
    }

    public function show(TourRequest $tourRequest): View
    {
        abort_unless((int) $tourRequest->tourist_id === (int) Auth::id(), 403);

        return view('legacy.root.my-posts', [
            'tourRequest' => $tourRequest,
        ]);
    }

    public function edit(TourRequest $tourRequest): View
    {
        abort_unless((int) $tourRequest->tourist_id === (int) Auth::id(), 403);

        return view('legacy.root.my-posts', [
            'tourRequest' => $tourRequest,
        ]);
    }

    public function update(Request $request, TourRequest $tourRequest): JsonResponse|RedirectResponse
    {
        abort_unless((int) $tourRequest->tourist_id === (int) Auth::id(), 403);

        $isJson = $request->expectsJson() || $request->wantsJson();

        $rules = [
            'title' => [$isJson ? 'sometimes' : 'required', 'string', 'max:255'],
            'description' => [$isJson ? 'sometimes' : 'required', 'string'],
            'province' => ['sometimes', 'nullable', 'string', 'max:120'],
            'city' => ['sometimes', 'nullable', 'string', 'max:120'],
            'budget_min' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'budget_max' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'duration_label' => ['sometimes', 'nullable', 'string', 'max:120'],
            'travelers_label' => ['sometimes', 'nullable', 'string', 'max:120'],
            'interests' => ['sometimes', 'nullable', 'array'],
            'interests.*' => ['string', 'max:80'],
            'status' => ['sometimes', 'nullable', 'in:open,negotiating,closed,completed'],
        ];

        $payload = $request->validate($rules);

        if (array_key_exists('interests', $payload)) {
            $payload['interests'] = array_values(array_unique(array_filter(array_map(function ($value) {
                return trim((string) $value);
            }, $payload['interests'] ?? []))));
        }

        $tourRequest->update($payload);

        $updatedRequest = $tourRequest->fresh(['tourist', 'selectedGuide']);
        event(new TourRequestUpdated($updatedRequest));

        if ($isJson) {
            return response()->json([
                'ok' => true,
                'request' => $this->presentRequest($updatedRequest),
            ]);
        }

        return back()->with('status', 'Tour request updated.');
    }

    public function destroy(Request $request, TourRequest $tourRequest): JsonResponse|RedirectResponse
    {
        abort_unless((int) $tourRequest->tourist_id === (int) Auth::id(), 403);
        $tourRequest->delete();

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'ok' => true,
            ]);
        }

        return back()->with('status', 'Tour request removed.');
    }

    private function presentRequest(TourRequest $tourRequest): array
    {
        $tourist = $tourRequest->tourist;
        $selectedGuide = $tourRequest->selectedGuide;
        $metadata = is_array($tourRequest->metadata) ? $tourRequest->metadata : [];

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

        $locationBits = array_filter([
            $tourRequest->city,
            $tourRequest->province,
        ]);

        return [
            'id' => (string) $tourRequest->id,
            'touristName' => trim((string) ($tourist->name ?? 'Tourist')),
            'touristAvatar' => $this->resolveAvatarPath($tourist?->avatar_path, '/images/manila.jpg'),
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

    private function buildRequestStats(User $tourist): array
    {
        $openStatuses = ['open', 'negotiating'];

        $totalRequests = TourRequest::query()
            ->where('tourist_id', $tourist->id)
            ->count();

        $openRequests = TourRequest::query()
            ->where('tourist_id', $tourist->id)
            ->whereIn('status', $openStatuses)
            ->count();

        $selectedGuides = TourRequest::query()
            ->where('tourist_id', $tourist->id)
            ->whereNotNull('selected_guide_id')
            ->count();

        $completedBookings = Booking::query()
            ->where('tourist_id', $tourist->id)
            ->where('status', 'completed')
            ->count();

        return [
            'total_requests' => $totalRequests,
            'open_requests' => $openRequests,
            'selected_guides' => $selectedGuides,
            'completed' => $completedBookings,
        ];
    }

    private function resolveAvatarPath(?string $path, string $fallback = '/images/manila.jpg'): string
    {
        $raw = trim((string) ($path ?? ''));
        if ($raw === '') {
            return $fallback;
        }

        if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://') || str_starts_with($raw, 'data:')) {
            return $raw;
        }

        return '/' . ltrim($raw, '/');
    }
}
