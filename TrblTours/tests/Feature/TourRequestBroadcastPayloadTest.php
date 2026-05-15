<?php

namespace Tests\Feature;

use App\Events\TourRequestCreated;
use App\Events\TourRequestUpdated;
use App\Models\TourRequest;
use App\Models\TourRequestComment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TourRequestBroadcastPayloadTest extends TestCase
{
    use RefreshDatabase;

    public function test_tour_request_created_event_payload_matches_feed_shape(): void
    {
        $tourist = User::factory()->create([
            'role' => 'tourist',
            'name' => 'Tourist One',
            'email_verified_at' => now(),
        ]);

        $tourRequest = TourRequest::query()->create([
            'tourist_id' => $tourist->id,
            'title' => 'Tagum day trip',
            'description' => 'Need an easy one-day itinerary.',
            'province' => 'Davao del Norte',
            'city' => 'Tagum City',
            'budget_min' => 2500,
            'budget_max' => 4000,
            'duration_label' => '1 day',
            'travelers_label' => '2 adults',
            'interests' => ['Nature', 'Food'],
            'status' => 'open',
        ]);

        $event = new TourRequestCreated($tourRequest->fresh(['tourist', 'selectedGuide', 'comments.author']));
        $payload = $event->broadcastWith()['request'] ?? [];

        $this->assertSame((string) $tourRequest->id, (string) ($payload['id'] ?? ''));
        $this->assertSame((string) $tourist->id, (string) ($payload['touristId'] ?? ''));
        $this->assertSame('open', (string) ($payload['status'] ?? ''));
        $this->assertSame('open', (string) ($payload['statusBucket'] ?? ''));
        $this->assertIsArray($payload['comments'] ?? null);
        $this->assertCount(0, $payload['comments'] ?? []);
    }

    public function test_tour_request_updated_event_payload_uses_threaded_comment_records(): void
    {
        $tourist = User::factory()->create([
            'role' => 'tourist',
            'name' => 'Tourist Two',
            'email_verified_at' => now(),
        ]);

        $guide = User::factory()->create([
            'role' => 'guide',
            'name' => 'Guide One',
            'email_verified_at' => now(),
        ]);

        $tourRequest = TourRequest::query()->create([
            'tourist_id' => $tourist->id,
            'selected_guide_id' => $guide->id,
            'title' => 'Farm and city loop',
            'description' => 'Looking for a selected guide follow-up.',
            'province' => 'Davao Region',
            'city' => 'Davao City',
            'budget_min' => 3500,
            'budget_max' => 5500,
            'duration_label' => '2 days',
            'travelers_label' => '2 adults / 1 children',
            'interests' => ['Culture'],
            'status' => 'closed',
        ]);

        $parent = TourRequestComment::query()->create([
            'tour_request_id' => $tourRequest->id,
            'author_id' => $tourist->id,
            'author_role' => 'tourist',
            'author_name' => $tourist->name,
            'author_avatar_url' => null,
            'text' => 'Can we include a farm stop?',
        ]);

        $reply = TourRequestComment::query()->create([
            'tour_request_id' => $tourRequest->id,
            'parent_comment_id' => $parent->id,
            'author_id' => $guide->id,
            'author_role' => 'guide',
            'author_name' => $guide->name,
            'author_avatar_url' => null,
            'text' => 'Yes, I can arrange that with transport.',
            'offer_amount' => 5200,
        ]);

        $event = new TourRequestUpdated($tourRequest->fresh(['tourist', 'selectedGuide', 'comments.author']));
        $payload = $event->broadcastWith()['request'] ?? [];
        $comments = $payload['comments'] ?? [];

        $this->assertSame((string) $tourist->id, (string) ($payload['touristId'] ?? ''));
        $this->assertSame('selected', (string) ($payload['statusBucket'] ?? ''));
        $this->assertCount(1, $comments);
        $this->assertSame((string) $parent->id, (string) ($comments[0]['id'] ?? ''));
        $this->assertSame('tourist', (string) ($comments[0]['authorRole'] ?? ''));
        $this->assertCount(1, $comments[0]['replies'] ?? []);
        $this->assertSame((string) $reply->id, (string) ($comments[0]['replies'][0]['id'] ?? ''));
        $this->assertSame('guide', (string) ($comments[0]['replies'][0]['authorRole'] ?? ''));
    }
}
