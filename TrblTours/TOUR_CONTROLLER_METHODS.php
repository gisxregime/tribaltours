// CONTROLLER MAPPING - TourListingController Updates

// File: app/Http/Controllers/Guide/TourListingController.php

// Method: mapListingPayload() - Update to handle new fields
private function mapListingPayload(array $input, ?TourListing $existing = null): array
{
    return [
        'title' => $input['title'] ?? ($existing?->title ?? ''),
        'short_description' => $input['short_description'] ?? ($existing?->short_description ?? ''),
        'category' => $input['category'] ?? ($existing?->category ?? null),
        'province' => $input['province'] ?? $input['region'] ?? ($existing?->province ?? null),  // Store as province in DB
        'city' => $input['city'] ?? ($existing?->city ?? null),
        'meeting_area' => $input['meeting_area'] ?? ($existing?->meeting_area ?? null),
        'meeting_point' => $input['meeting_point'] ?? ($existing?->meeting_point ?? null),
        'duration_label' => $input['duration_label'] ?? ($existing?->duration_label ?? null),
        'min_guests' => (int) ($input['min_guests'] ?? $existing?->min_guests ?? 1),
        'max_guests' => (int) ($input['max_guests'] ?? $existing?->max_guests ?? 10),
        'price' => (float) ($input['price'] ?? $existing?->price ?? 0),
        'price_type' => $input['price_type'] ?? 'per_person',
        'reservation_type' => $input['reservation_type'] ?? 'instant',  // NEW FIELD
        'languages' => $input['languages'] ?? ($existing?->languages ?? null),
        'includes' => is_array($input['includes'] ?? null) ? $input['includes'] : ($existing?->includes ?? null),
        'excludes' => $input['excludes'] ?? ($existing?->excludes ?? null),
        'requirements' => $input['requirements'] ?? ($existing?->requirements ?? null),
        'safety_info' => $input['safety_info'] ?? ($existing?->safety_info ?? null),
        'status' => $input['status'] ?? 'published',
        'is_active' => (bool) ($input['is_active'] ?? true),
        'published_at' => now(),
        // REMOVED: difficulty, tags, weather_suitability, best_season, child_friendly, pet_friendly, etc.
    ];
}

// Method: validateListingPayload() - Update validation rules
private function validateListingPayload(Request $request, bool $isUpdate = false): array
{
    return $request->validate([
        'title' => ['required', 'string', 'min:5', 'max:255'],
        'short_description' => ['required', 'string', 'min:20', 'max:1000'],
        'category' => ['required', 'string', 'max:100'],
        'region' => ['required', 'string', 'max:100'],
        'province' => ['required', 'string', 'max:100'],  // For backward compat
        'city' => ['required', 'string', 'max:100'],
        'meeting_area' => ['required', 'string', 'max:255'],
        'meeting_point' => ['required', 'string', 'max:255'],
        'duration_label' => ['required', 'string', 'max:100'],
        'price' => ['required', 'numeric', 'min:1'],
        'price_type' => ['required', 'in:per_person,per_group'],
        'min_guests' => ['required', 'integer', 'min:1', 'max:500'],
        'max_guests' => ['required', 'integer', 'min:1', 'max:500'],
        'time_slots' => ['required', 'string'],  // Comma-separated times
        'reservation_type' => ['required', 'in:instant,manual'],  // NEW
        'languages' => ['required', 'string', 'max:255'],
        'includes' => ['nullable', 'string'],
        'excludes' => ['nullable', 'string'],
        'requirements' => ['nullable', 'string'],
        'safety_info' => ['nullable', 'string'],
        'gallery_paths' => ['nullable', 'array', 'min:3', 'max:5'],  // NEW: for API
        'status' => ['nullable', 'in:draft,published,paused'],
        // REMOVED: difficulty, tags, weather_suitability, best_season, child_friendly, pet_friendly, etc.
    ]);
}

// Method: presentListing() - Update response format
private function presentListing(TourListing $listing): array
{
    return [
        'id' => (string) $listing->id,
        'guide_id' => (string) $listing->guide_id,
        'title' => $listing->title,
        'short_description' => $listing->short_description,
        'category' => $listing->category,
        'region' => $listing->province,  // NEW: Return as region
        'city' => $listing->city,
        'meeting_area' => $listing->meeting_area,
        'meeting_point' => $listing->meeting_point,
        'duration_label' => $listing->duration_label,
        'min_guests' => (int) $listing->min_guests,
        'max_guests' => (int) $listing->max_guests,
        'price' => (float) $listing->price,
        'price_type' => $listing->price_type,
        'reservation_type' => $listing->reservation_type,  // NEW
        'languages' => $listing->languages,
        'includes' => $listing->includes ?? [],
        'excludes' => $listing->excludes,
        'requirements' => $listing->requirements,
        'safety_info' => $listing->safety_info,
        'time_slots' => array_filter(array_map('trim', explode(',', $listing->time_slots_json ?? ''))),
        'cover_image_path' => $listing->cover_image_path,
        'gallery_paths' => $listing->gallery_paths ?? [],
        'status' => $listing->status,
        'is_active' => (bool) $listing->is_active,
        'rating_avg' => (float) $listing->rating_avg,
        'reviews_count' => (int) $listing->reviews_count,
        'published_at' => optional($listing->published_at)->toISOString(),
        'created_at' => optional($listing->created_at)->toISOString(),
    ];
}

// NOTE: Store time_slots as JSON in database or serialize as comma-separated in text field
// Add migration or update existing: ALTER TABLE tour_listings ADD time_slots_json JSON AFTER duration_label;
