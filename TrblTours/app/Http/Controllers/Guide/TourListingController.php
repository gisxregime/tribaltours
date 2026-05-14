<?php

namespace App\Http\Controllers\Guide;

use App\Events\TourListingUpdated;
use App\Http\Controllers\Controller;
use App\Models\TourListing;
use App\Models\User;
use App\Support\DomainNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\View\View;

class TourListingController extends Controller
{
    public function index(Request $request): View|JsonResponse
    {
        $query = TourListing::query()
            ->where('guide_id', $request->user()->id)
            ->latest();

        if ($request->expectsJson() || $request->wantsJson()) {
            $listings = $query->limit(120)->get()->map(function (TourListing $tourListing) {
                return $this->presentListing($tourListing->loadMissing('guide'));
            })->values();

            return response()->json([
                'ok' => true,
                'listings' => $listings,
            ]);
        }

        $listings = $query->paginate(12);

        return view('legacy.pages.tours', ['listings' => $listings]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): View
    {
        return view('legacy.pages.tours');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $input = $this->validateListingPayload($request, false);

        $tourListing = TourListing::create(array_merge(
            $this->mapListingPayload($input, null),
            [
                'guide_id' => $request->user()->id,
                'slug' => Str::slug($input['title']) . '-' . Str::lower(Str::random(6)),
            ]
        ));

        if ($tourListing->status === 'published' && $tourListing->is_active) {
            $tourists = User::query()->where('role', 'tourist')->limit(200)->get();
            DomainNotification::notifyUsers(
                $tourists,
                'tour-listing.created',
                'New tour available: ' . trim((string) $tourListing->title) . '.',
                [
                    'tourId' => (string) $tourListing->id,
                ]
            );
        }

        event(new TourListingUpdated($tourListing->fresh(['guide']), 'created'));

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'ok' => true,
                'listing' => $this->presentListing($tourListing->fresh(['guide'])),
            ], 201);
        }

        return back()->with('status', 'Tour listing created.');
    }

    /**
     * Display the specified resource.
     */
    public function show(TourListing $tourListing): View
    {
        abort_unless($tourListing->guide_id === Auth::id(), 403);

        return view('legacy.pages.tours', ['tourListing' => $tourListing]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(TourListing $tourListing): View
    {
        abort_unless($tourListing->guide_id === Auth::id(), 403);

        return view('legacy.pages.tours', ['tourListing' => $tourListing]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TourListing $tourListing): RedirectResponse|JsonResponse
    {
        abort_unless($tourListing->guide_id === Auth::id(), 403);

        $input = $this->validateListingPayload($request, true);
        $payload = $this->mapListingPayload($input, $tourListing);

        if ($tourListing->title !== $input['title']) {
            $payload['slug'] = Str::slug($input['title']) . '-' . Str::lower(Str::random(6));
        }

        $tourListing->update($payload);

        if ($tourListing->status === 'published' && $tourListing->is_active) {
            $tourists = User::query()->where('role', 'tourist')->limit(200)->get();
            DomainNotification::notifyUsers(
                $tourists,
                'tour-listing.updated',
                'Tour updated: ' . trim((string) $tourListing->title) . '.',
                [
                    'tourId' => (string) $tourListing->id,
                ]
            );
        }

        event(new TourListingUpdated($tourListing->fresh(['guide']), 'updated'));

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'ok' => true,
                'listing' => $this->presentListing($tourListing->fresh(['guide'])),
            ]);
        }

        return back()->with('status', 'Tour listing updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, TourListing $tourListing): RedirectResponse|JsonResponse
    {
        abort_unless($tourListing->guide_id === Auth::id(), 403);

        if ($tourListing->status === 'published' && $tourListing->is_active) {
            $tourists = User::query()->where('role', 'tourist')->limit(200)->get();
            DomainNotification::notifyUsers(
                $tourists,
                'tour-listing.deleted',
                'Tour is no longer available: ' . trim((string) $tourListing->title) . '.',
                [
                    'tourId' => (string) $tourListing->id,
                ]
            );
        }

        event(new TourListingUpdated($tourListing->fresh(['guide']), 'deleted'));
        $tourListing->delete();

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json(['ok' => true]);
        }

        return back()->with('status', 'Tour listing archived.');
    }

    private function validateListingPayload(Request $request, bool $updating): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'short_description' => [$updating ? 'nullable' : 'required', 'string'],
            'description' => ['nullable', 'string'],
            'category' => ['nullable', 'string', 'max:120'],
            'province' => ['nullable', 'string', 'max:120'],
            'city' => ['nullable', 'string', 'max:120'],
            'meeting_area' => ['nullable', 'string', 'max:160'],
            'meetingArea' => ['nullable', 'string', 'max:160'],
            'meeting_point' => ['nullable', 'string', 'max:200'],
            'meetingPoint' => ['nullable', 'string', 'max:200'],
            'duration_label' => ['nullable', 'string', 'max:120'],
            'duration' => ['nullable', 'string', 'max:120'],
            'min_guests' => ['nullable', 'integer', 'min:1', 'max:200'],
            'minGuests' => ['nullable', 'integer', 'min:1', 'max:200'],
            'max_guests' => ['nullable', 'integer', 'min:1', 'max:200'],
            'maxGuests' => ['nullable', 'integer', 'min:1', 'max:200'],
            'price' => ['required', 'numeric', 'min:1'],
            'price_type' => ['nullable', 'string', 'max:40'],
            'priceType' => ['nullable', 'string', 'max:40'],
            'reservation_type' => ['nullable', 'string', 'max:40'],
            'reservationType' => ['nullable', 'string', 'max:40'],
            'free_cancellation' => ['nullable', 'boolean'],
            'freeCancellation' => ['nullable', 'boolean'],
            'reserve_now_pay_later' => ['nullable', 'boolean'],
            'reserveNowPayLater' => ['nullable', 'boolean'],
            'languages' => ['nullable', 'string', 'max:255'],
            'includes' => ['nullable'],
            'excludes' => ['nullable', 'string'],
            'requirements' => ['nullable', 'string'],
            'safety_info' => ['nullable', 'string'],
            'safetyInfo' => ['nullable', 'string'],
            'difficulty' => ['nullable', 'string', 'max:120'],
            'tags' => ['nullable'],
            'weather_suitability' => ['nullable', 'string', 'max:120'],
            'weatherSuitability' => ['nullable', 'string', 'max:120'],
            'best_season' => ['nullable', 'string', 'max:120'],
            'bestSeason' => ['nullable', 'string', 'max:120'],
            'child_friendly' => ['nullable', 'boolean'],
            'childFriendly' => ['nullable', 'boolean'],
            'pet_friendly' => ['nullable', 'boolean'],
            'petFriendly' => ['nullable', 'boolean'],
            'rating_avg' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'reviews_count' => ['nullable', 'integer', 'min:0'],
            'reviews' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', 'string', 'max:40'],
            'cover_image_path' => ['nullable', 'string', 'max:2048'],
            'coverImage' => ['nullable', 'string', 'max:2048'],
            'gallery_paths' => ['nullable'],
            'gallery' => ['nullable'],
            'is_active' => ['nullable', 'boolean'],
        ]);
    }

    private function mapListingPayload(array $input, ?TourListing $tourListing): array
    {
        $description = trim((string) ($input['short_description'] ?? $input['description'] ?? ''));
        if ($description === '') {
            $description = (string) ($tourListing?->short_description ?: 'Custom guided experience.');
        }

        $priceTypeRaw = Str::of((string) ($input['price_type'] ?? $input['priceType'] ?? ($tourListing?->price_type ?: 'per_person')))->lower()->replace(' ', '_')->value();
        $priceType = $priceTypeRaw === 'per_group' ? 'per_group' : 'per_person';

        $reservationRaw = Str::of((string) ($input['reservation_type'] ?? $input['reservationType'] ?? ($tourListing?->reservation_type ?: 'instant')))->lower()->value();
        $reservationType = Str::contains($reservationRaw, 'manual') ? 'manual' : 'instant';

        $statusRaw = Str::of((string) ($input['status'] ?? ($tourListing?->status ?: 'draft')))->lower()->value();
        $status = in_array($statusRaw, ['published', 'paused'], true) ? $statusRaw : 'draft';

        $minGuests = max(1, (int) ($input['min_guests'] ?? $input['minGuests'] ?? ($tourListing?->min_guests ?? 1)));
        $maxGuests = max($minGuests, (int) ($input['max_guests'] ?? $input['maxGuests'] ?? ($tourListing?->max_guests ?? 10)));

        $galleryInput = $input['gallery_paths'] ?? $input['gallery'] ?? ($tourListing?->gallery_paths ?: []);
        $gallery = [];
        if (is_array($galleryInput)) {
            $gallery = array_values(array_filter(array_map(function ($value) {
                return trim((string) $value);
            }, $galleryInput)));
        } elseif (is_string($galleryInput) && trim($galleryInput) !== '') {
            $gallery = array_values(array_filter(array_map(function ($value) {
                return trim((string) $value);
            }, explode(',', $galleryInput))));
        }

        $tagsInput = $input['tags'] ?? ($tourListing?->tags ?: []);
        $tags = [];
        if (is_array($tagsInput)) {
            $tags = array_values(array_filter(array_map(function ($value) {
                return trim((string) $value);
            }, $tagsInput)));
        } elseif (is_string($tagsInput)) {
            $tags = array_values(array_filter(array_map(function ($value) {
                return trim((string) $value);
            }, preg_split('/,|\n/', $tagsInput) ?: [])));
        }

        $includesInput = $input['includes'] ?? ($tourListing?->includes ?: []);
        $includes = [];
        if (is_array($includesInput)) {
            $includes = array_values(array_filter(array_map(function ($value) {
                return trim((string) $value);
            }, $includesInput)));
        } elseif (is_string($includesInput)) {
            $includes = array_values(array_filter(array_map(function ($value) {
                return trim((string) $value);
            }, preg_split('/,|\n/', $includesInput) ?: [])));
        }

        $coverImage = (string) ($input['cover_image_path'] ?? $input['coverImage'] ?? ($gallery[0] ?? ($tourListing?->cover_image_path ?: 'images/pangasinan.jpg')));

        return [
            'title' => (string) $input['title'],
            'short_description' => $description,
            'category' => $input['category'] ?? $tourListing?->category,
            'province' => $input['province'] ?? $tourListing?->province,
            'city' => $input['city'] ?? $tourListing?->city,
            'meeting_area' => $input['meeting_area'] ?? $input['meetingArea'] ?? $tourListing?->meeting_area,
            'meeting_point' => $input['meeting_point'] ?? $input['meetingPoint'] ?? $tourListing?->meeting_point,
            'duration_label' => $input['duration_label'] ?? $input['duration'] ?? $tourListing?->duration_label,
            'min_guests' => $minGuests,
            'max_guests' => $maxGuests,
            'price' => (float) $input['price'],
            'price_type' => $priceType,
            'reservation_type' => $reservationType,
            'free_cancellation' => (bool) ($input['free_cancellation'] ?? $input['freeCancellation'] ?? ($tourListing?->free_cancellation ?? true)),
            'reserve_now_pay_later' => (bool) ($input['reserve_now_pay_later'] ?? $input['reserveNowPayLater'] ?? ($tourListing?->reserve_now_pay_later ?? true)),
            'languages' => $input['languages'] ?? $tourListing?->languages,
            'includes' => $includes,
            'excludes' => $input['excludes'] ?? $tourListing?->excludes,
            'requirements' => $input['requirements'] ?? $tourListing?->requirements,
            'safety_info' => $input['safety_info'] ?? $input['safetyInfo'] ?? $tourListing?->safety_info,
            'difficulty' => $input['difficulty'] ?? $tourListing?->difficulty,
            'tags' => $tags,
            'weather_suitability' => $input['weather_suitability'] ?? $input['weatherSuitability'] ?? $tourListing?->weather_suitability,
            'best_season' => $input['best_season'] ?? $input['bestSeason'] ?? $tourListing?->best_season,
            'child_friendly' => (bool) ($input['child_friendly'] ?? $input['childFriendly'] ?? ($tourListing?->child_friendly ?? false)),
            'pet_friendly' => (bool) ($input['pet_friendly'] ?? $input['petFriendly'] ?? ($tourListing?->pet_friendly ?? false)),
            'rating_avg' => (float) ($input['rating_avg'] ?? $input['rating'] ?? ($tourListing?->rating_avg ?? 0)),
            'reviews_count' => (int) ($input['reviews_count'] ?? $input['reviews'] ?? ($tourListing?->reviews_count ?? 0)),
            'status' => $status,
            'cover_image_path' => $coverImage,
            'gallery_paths' => $gallery,
            'is_active' => (bool) ($input['is_active'] ?? ($status !== 'paused')),
            'published_at' => $status === 'published'
                ? ($tourListing?->published_at ?? now())
                : ($status === 'draft' ? null : $tourListing?->published_at),
        ];
    }

    private function presentListing(TourListing $tourListing): array
    {
        $guide = $tourListing->guide;
        $locationBits = array_filter([
            $tourListing->city,
            $tourListing->province,
        ]);

        return [
            'id' => (string) $tourListing->id,
            'title' => (string) $tourListing->title,
            'description' => (string) $tourListing->short_description,
            'location' => $locationBits ? implode(', ', $locationBits) : 'Philippines',
            'category' => (string) ($tourListing->category ?: 'Tour'),
            'duration' => (string) ($tourListing->duration_label ?: 'Flexible'),
            'minGuests' => (int) ($tourListing->min_guests ?? 1),
            'maxGuests' => (int) ($tourListing->max_guests ?? 10),
            'price' => (float) ($tourListing->price ?? 0),
            'priceType' => $tourListing->price_type === 'per_group' ? 'Per group' : 'Per person',
            'reservationType' => $tourListing->reservation_type === 'manual' ? 'Manual approval' : 'Instant booking',
            'freeCancellation' => (bool) $tourListing->free_cancellation,
            'reserveNowPayLater' => (bool) $tourListing->reserve_now_pay_later,
            'languages' => (string) ($tourListing->languages ?: 'English, Filipino'),
            'includes' => is_array($tourListing->includes) ? $tourListing->includes : [],
            'excludes' => (string) ($tourListing->excludes ?: ''),
            'requirements' => (string) ($tourListing->requirements ?: ''),
            'safetyInfo' => (string) ($tourListing->safety_info ?: ''),
            'difficulty' => (string) ($tourListing->difficulty ?: 'Moderate'),
            'tags' => is_array($tourListing->tags) ? $tourListing->tags : [],
            'weatherSuitability' => (string) ($tourListing->weather_suitability ?: ''),
            'bestSeason' => (string) ($tourListing->best_season ?: ''),
            'childFriendly' => (bool) $tourListing->child_friendly,
            'petFriendly' => (bool) $tourListing->pet_friendly,
            'rating' => (float) ($tourListing->rating_avg ?? 0),
            'reviews' => (int) ($tourListing->reviews_count ?? 0),
            'status' => (string) ($tourListing->status ?: 'draft'),
            'image' => (string) ($tourListing->cover_image_path ?: 'images/pangasinan.jpg'),
            'coverImage' => (string) ($tourListing->cover_image_path ?: 'images/pangasinan.jpg'),
            'gallery' => is_array($tourListing->gallery_paths) ? $tourListing->gallery_paths : [],
            'provider' => trim((string) ($guide->name ?? 'Guide')),
            'guide' => trim((string) ($guide->name ?? 'Guide')),
            'guideAvatar' => (string) (($guide && $guide->avatar_path) ? $guide->avatar_path : 'images/manila.jpg'),
            'updatedAt' => optional($tourListing->updated_at)->toISOString(),
        ];
    }
}
