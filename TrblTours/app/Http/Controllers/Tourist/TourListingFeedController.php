<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\TourListing;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class TourListingFeedController extends Controller
{
    public function index(): JsonResponse
    {
        $this->ensureLegacyCatalogListings();

        $tours = TourListing::query()
            ->with(['guide.guideProfile'])
            ->withCount([
                'reviews as reviews_live_count' => function ($query) {
                    $query->where('is_public', true);
                },
            ])
            ->withAvg([
                'reviews as reviews_live_avg' => function ($query) {
                    $query->where('is_public', true);
                },
            ], 'rating')
            ->where('status', 'published')
            ->where('is_active', true)
            ->latest('updated_at')
            ->limit(120)
            ->get()
            ->map(fn (TourListing $tourListing) => $this->presentTour($tourListing))
            ->values();

        return response()->json([
            'ok' => true,
            'tours' => $tours,
        ]);
    }

    public function show(TourListing $tourListing): JsonResponse
    {
        abort_unless($tourListing->status === 'published' && $tourListing->is_active, 404);

        $tourListing->loadMissing(['guide.guideProfile'])
            ->loadCount([
                'reviews as reviews_live_count' => function ($query) {
                    $query->where('is_public', true);
                },
            ])
            ->loadAvg([
                'reviews as reviews_live_avg' => function ($query) {
                    $query->where('is_public', true);
                },
            ], 'rating');

        return response()->json([
            'ok' => true,
            'tour' => $this->presentTour($tourListing, true),
        ]);
    }

    private function presentTour(TourListing $tourListing, bool $withRecentReviews = false): array
    {
        $guide = $tourListing->guide;
        $guideProfile = $guide?->guideProfile;
        $liveRating = $tourListing->getAttribute('reviews_live_avg');
        $liveReviews = $tourListing->getAttribute('reviews_live_count');
        $reviews = $liveReviews !== null
            ? (int) $liveReviews
            : (int) ($tourListing->reviews_count ?? 0);
        $rating = $reviews > 0
            ? round((float) ($liveRating ?? $tourListing->rating_avg ?? 0), 2)
            : 0.0;
        $locationBits = array_filter([
            $tourListing->city,
            $tourListing->province,
        ]);

        $coverImage = (string) ($tourListing->cover_image_path ?: 'images/pangasinan.jpg');
        $gallery = array_values(array_filter(array_map(function ($path) {
            return trim((string) $path);
        }, is_array($tourListing->gallery_paths) ? $tourListing->gallery_paths : [])));

        if (!$gallery) {
            $gallery = [$coverImage];
        }

        $tags = array_values(array_filter(array_map(function ($tag) {
            return trim((string) $tag);
        }, is_array($tourListing->tags) ? $tourListing->tags : [])));

        $payload = [
            'id' => (string) $tourListing->id,
            'slug' => (string) $tourListing->slug,
            'legacyKey' => (string) $tourListing->slug,
            'guideId' => $guide ? (string) $guide->id : '',
            'location' => $locationBits ? implode(', ', $locationBits) : 'Philippines',
            'title' => (string) $tourListing->title,
            'guide' => trim((string) ($guide->name ?? 'Guide')),
            'rating' => $rating,
            'reviews' => $reviews,
            'duration' => (string) ($tourListing->duration_label ?: 'Flexible'),
            'pax' => (int) ($tourListing->min_guests ?? 1) . '-' . (int) ($tourListing->max_guests ?? 10) . ' pax',
            'difficulty' => (string) ($tourListing->difficulty ?: 'Moderate'),
            'price' => (float) ($tourListing->price ?? 0),
            'badge' => (string) ($tourListing->category ?: 'Featured'),
            'image' => $coverImage,
            'coverImage' => $coverImage,
            'guideAvatar' => $this->resolveAvatarPath($guide?->avatar_path),
            'guidePhoto' => $this->resolveAvatarPath($guide?->avatar_path),
            'tags' => $tags,
            'latest' => optional($tourListing->updated_at)->getTimestamp() ?: time(),
            'provider' => trim((string) ($guide->name ?? 'Guide')),
            'durationHours' => (string) ($tourListing->duration_label ?: 'Flexible'),
            'languages' => (string) ($guideProfile?->languages_spoken ?: $tourListing->languages ?: 'English, Filipino'),
            'meetingPoint' => (string) ($tourListing->meeting_point ?: 'Main tourist pickup point'),
            'description' => (string) ($tourListing->short_description ?: 'Custom guided experience.'),
            'gallery' => $gallery,
            'priceType' => $tourListing->price_type === 'per_group' ? 'Per group' : 'Per person',
            'minGuests' => (int) ($tourListing->min_guests ?? 1),
            'maxGuests' => (int) ($tourListing->max_guests ?? 10),
            'reservationType' => $tourListing->reservation_type === 'manual' ? 'Manual approval' : 'Instant booking',
            'freeCancellation' => (bool) $tourListing->free_cancellation,
            'reserveNowPayLater' => (bool) $tourListing->reserve_now_pay_later,
            'includes' => array_values(array_filter(array_map(function ($value) {
                return trim((string) $value);
            }, is_array($tourListing->includes) ? $tourListing->includes : []))),
            'excludes' => (string) ($tourListing->excludes ?: ''),
            'requirements' => (string) ($tourListing->requirements ?: ''),
            'safetyInfo' => (string) ($tourListing->safety_info ?: ''),
            'guideVerified' => (string) ($guide?->guide_verification_status ?? '') === 'approved',
            'guideExperienceYears' => (int) ($guideProfile?->years_of_experience ?? 1),
            'guideContact' => (string) ($guide?->phone ?? ''),
            'guideSocial' => (string) (is_array($guide?->account_settings) ? ($guide->account_settings['social_links'] ?? '') : ''),
            'guideBio' => (string) ($guide?->bio ?? ''),
            'guideLocation' => (string) ($guide?->location ?? ''),
            'guideSpecialties' => (string) ($guideProfile?->areas_of_expertise ?? ''),
            'guideCertifications' => (string) ($guideProfile?->guide_certificate_number ?? ''),
            'weatherSuitability' => (string) ($tourListing->weather_suitability ?: ''),
            'bestSeason' => (string) ($tourListing->best_season ?: ''),
            'childFriendly' => (bool) $tourListing->child_friendly,
            'petFriendly' => (bool) $tourListing->pet_friendly,
            'status' => (string) $tourListing->status,
            'isActive' => (bool) $tourListing->is_active,
        ];

        if ($withRecentReviews) {
            $payload['recentReviews'] = $tourListing->reviews()
                ->where('is_public', true)
                ->with(['tourist:id,name'])
                ->latest('created_at')
                ->limit(12)
                ->get()
                ->map(function ($review) {
                    return [
                        'id' => (string) $review->id,
                        'touristName' => trim((string) ($review->tourist?->name ?? 'Tourist')) ?: 'Tourist',
                        'rating' => (int) ($review->rating ?? 0),
                        'title' => (string) ($review->title ?? ''),
                        'comment' => (string) ($review->comment ?? ''),
                        'createdAt' => optional($review->created_at)->toISOString(),
                    ];
                })
                ->values()
                ->all();
        }

        return $payload;
    }

    private function ensureLegacyCatalogListings(): void
    {
        $guide = User::query()
            ->where('role', 'guide')
            ->orderByDesc('guide_verified_at')
            ->orderBy('id')
            ->first();

        if (!$guide) {
            $guide = User::query()->orderBy('id')->first();
        }

        if (!$guide) {
            return;
        }

        foreach ($this->legacyCatalogSeed() as $item) {
            TourListing::query()->firstOrCreate(
                ['slug' => $item['slug']],
                [
                    'guide_id' => $guide->id,
                    'title' => $item['title'],
                    'short_description' => $item['description'],
                    'category' => $item['category'],
                    'province' => $item['province'],
                    'city' => $item['city'],
                    'meeting_point' => $item['meeting_point'],
                    'duration_label' => $item['duration_label'],
                    'min_guests' => $item['min_guests'],
                    'max_guests' => $item['max_guests'],
                    'price' => $item['price'],
                    'price_type' => 'per_person',
                    'reservation_type' => 'instant',
                    'free_cancellation' => true,
                    'reserve_now_pay_later' => true,
                    'languages' => 'English, Filipino',
                    'includes' => ['Guide service', 'Core activity'],
                    'excludes' => 'Personal expenses',
                    'requirements' => 'Follow guide reminders for a safe experience.',
                    'safety_info' => 'Safety briefing is provided before the activity starts.',
                    'difficulty' => $item['difficulty'],
                    'tags' => $item['tags'],
                    'rating_avg' => $item['rating_avg'],
                    'reviews_count' => $item['reviews_count'],
                    'status' => 'published',
                    'cover_image_path' => $item['image'],
                    'gallery_paths' => [$item['image']],
                    'is_active' => true,
                    'published_at' => now(),
                ]
            );
        }
    }

    private function legacyCatalogSeed(): array
    {
        return [
            [
                'slug' => 'bohol',
                'title' => 'Chocolate Hills & Tarsier Sanctuary',
                'description' => 'Walk through scenic forest paths and discover the iconic Chocolate Hills with a local guide.',
                'category' => 'Featured',
                'province' => 'Bohol',
                'city' => 'Bohol',
                'meeting_point' => 'Bohol Tourism Board pickup station',
                'duration_label' => '2 days',
                'min_guests' => 2,
                'max_guests' => 8,
                'price' => 2500,
                'difficulty' => 'Easy',
                'tags' => ['Nature', 'Wildlife', 'Scenic'],
                'rating_avg' => 4.97,
                'reviews_count' => 142,
                'image' => 'images/pangasinan.jpg',
            ],
            [
                'slug' => 'elnido',
                'title' => 'Island Hopping & Hidden Lagoons',
                'description' => 'Cruise through crystal waters, hidden lagoons, and island beaches in El Nido.',
                'category' => 'Featured',
                'province' => 'Palawan',
                'city' => 'El Nido',
                'meeting_point' => 'El Nido Port passenger terminal',
                'duration_label' => '2 days',
                'min_guests' => 2,
                'max_guests' => 12,
                'price' => 3800,
                'difficulty' => 'Moderate',
                'tags' => ['Island Hopping', 'Snorkeling', 'Beach'],
                'rating_avg' => 4.93,
                'reviews_count' => 89,
                'image' => 'images/puertoprincessa.jpg',
            ],
            [
                'slug' => 'coron',
                'title' => 'Shipwreck Diving & Kayangan Lake',
                'description' => 'Dive legendary wreck sites and unwind at Kayangan Lake with guided routes.',
                'category' => 'Featured',
                'province' => 'Palawan',
                'city' => 'Coron',
                'meeting_point' => 'Coron town pier check-in area',
                'duration_label' => '2 days',
                'min_guests' => 2,
                'max_guests' => 10,
                'price' => 4500,
                'difficulty' => 'Moderate',
                'tags' => ['Diving', 'Snorkeling', 'Shipwreck'],
                'rating_avg' => 4.88,
                'reviews_count' => 176,
                'image' => 'images/manila.png',
            ],
            [
                'slug' => 'mtapo',
                'title' => 'Mount Apo Summit Trek',
                'description' => 'Take on the highest peak in the Philippines with expert pacing and camp coordination.',
                'category' => 'Trekking',
                'province' => 'Davao del Sur',
                'city' => 'Davao',
                'meeting_point' => 'Davao jump-off registration point',
                'duration_label' => '3 days',
                'min_guests' => 4,
                'max_guests' => 10,
                'price' => 8500,
                'difficulty' => 'Challenging',
                'tags' => ['Summit', 'Trekking', 'Camping'],
                'rating_avg' => 4.95,
                'reviews_count' => 63,
                'image' => 'images/davao.jpg',
            ],
            [
                'slug' => 'batanes',
                'title' => 'Windmill Trail & Ivatan Culture',
                'description' => 'Discover the scenic windmill coast and authentic Ivatan culture in Batanes.',
                'category' => 'Featured',
                'province' => 'Batanes',
                'city' => 'Basco',
                'meeting_point' => 'Basco airport arrival area',
                'duration_label' => '4 days',
                'min_guests' => 4,
                'max_guests' => 12,
                'price' => 6500,
                'difficulty' => 'Easy',
                'tags' => ['Scenic', 'Culture', 'Photography'],
                'rating_avg' => 4.96,
                'reviews_count' => 201,
                'image' => 'images/carousel2.jpg',
            ],
            [
                'slug' => 'siargao',
                'title' => 'Surf Lessons & Cloud 9 Waves',
                'description' => 'Learn to surf with local pros and catch the best of Cloud 9 in Siargao.',
                'category' => 'Water Sports',
                'province' => 'Surigao del Norte',
                'city' => 'Siargao',
                'meeting_point' => 'General Luna tourism office',
                'duration_label' => '3 days',
                'min_guests' => 2,
                'max_guests' => 8,
                'price' => 2200,
                'difficulty' => 'Moderate',
                'tags' => ['Surfing', 'Beach', 'Lessons'],
                'rating_avg' => 4.91,
                'reviews_count' => 104,
                'image' => 'images/carousel3.jpg',
            ],
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
