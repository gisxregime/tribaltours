<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\TourRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TouristRequestFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_tourist_can_select_only_one_guide_after_offers(): void
    {
        $tourist = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
        ]);

        $firstGuide = User::factory()->create([
            'role' => 'guide',
            'email_verified_at' => now(),
        ]);

        $secondGuide = User::factory()->create([
            'role' => 'guide',
            'email_verified_at' => now(),
        ]);

        $createResponse = $this->actingAs($tourist)
            ->postJson('/tourist/requests', [
                'title' => 'Davao city and river day tour',
                'description' => 'Need a guide for a full-day city and nature itinerary.',
                'location' => 'Davao City',
                'region' => 'Davao Region',
                'duration' => '1',
                'adults' => 2,
                'children' => 0,
                'budget' => 6000,
                'interests' => ['Nature', 'Culture'],
            ]);

        $requestId = (string) $createResponse->json('request.id');

        $this->actingAs($firstGuide)
            ->postJson('/guide/request-feed/' . $requestId . '/comment', [
                'text' => 'I can guide this route with private transport.',
                'offer_amount' => 5500,
            ])
            ->assertOk();

        $this->actingAs($secondGuide)
            ->postJson('/guide/request-feed/' . $requestId . '/comment', [
                'text' => 'Available as well with local food stops.',
                'offer_amount' => 5000,
            ])
            ->assertOk();

        $this->actingAs($tourist)
            ->postJson('/tourist/requests/' . $requestId . '/select-guide', [
                'guide_id' => $firstGuide->id,
                'offer_amount' => 5500,
            ])
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('request.selectedGuideId', (string) $firstGuide->id)
            ->assertJsonPath('conversationId', function ($value) {
                return is_string($value) && $value !== '';
            });

        $this->actingAs($tourist)
            ->postJson('/tourist/requests/' . $requestId . '/select-guide', [
                'guide_id' => $secondGuide->id,
                'offer_amount' => 5000,
            ])
            ->assertStatus(422)
            ->assertJsonPath('ok', false);

        $tourRequest = TourRequest::query()->findOrFail($requestId);
        $this->assertSame((int) $firstGuide->id, (int) $tourRequest->selected_guide_id);
        $this->assertTrue(
            Conversation::query()
                ->where('tour_request_id', $tourRequest->id)
                ->where('tourist_id', $tourist->id)
                ->where('guide_id', $firstGuide->id)
                ->exists()
        );
    }

    public function test_negotiation_comments_are_locked_after_guide_selection(): void
    {
        $tourist = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
        ]);

        $selectedGuide = User::factory()->create([
            'role' => 'guide',
            'email_verified_at' => now(),
        ]);

        $otherGuide = User::factory()->create([
            'role' => 'guide',
            'email_verified_at' => now(),
        ]);

        $createResponse = $this->actingAs($tourist)
            ->postJson('/tourist/requests', [
                'title' => 'Samal island weekend plan',
                'description' => 'Looking for snorkeling and beach stops.',
                'location' => 'Samal Island',
                'region' => 'Davao Region',
                'duration' => '2',
                'adults' => 2,
                'children' => 0,
                'budget' => 7000,
                'interests' => ['Nature', 'Relaxation'],
            ]);

        $requestId = (string) $createResponse->json('request.id');

        $this->actingAs($selectedGuide)
            ->postJson('/guide/request-feed/' . $requestId . '/comment', [
                'text' => 'I can provide a speedboat + island hops.',
                'offer_amount' => 6800,
            ])
            ->assertOk();

        $this->actingAs($tourist)
            ->postJson('/tourist/requests/' . $requestId . '/select-guide', [
                'guide_id' => $selectedGuide->id,
                'offer_amount' => 6800,
            ])
            ->assertOk();

        $this->actingAs($tourist)
            ->postJson('/tourist/requests/' . $requestId . '/comment', [
                'text' => 'Can we move pickup to 7:00 AM?',
            ])
            ->assertStatus(422)
            ->assertJsonPath('ok', false);

        $this->actingAs($selectedGuide)
            ->postJson('/guide/request-feed/' . $requestId . '/comment', [
                'text' => 'Adding another public update after selection.',
                'offer_amount' => 6900,
            ])
            ->assertStatus(422)
            ->assertJsonPath('ok', false);

        $this->actingAs($otherGuide)
            ->postJson('/guide/request-feed/' . $requestId . '/comment', [
                'text' => 'I am still available if needed.',
                'offer_amount' => 6500,
            ])
            ->assertStatus(403)
            ->assertJsonPath('ok', false);
    }

    public function test_tourist_comment_uses_tourist_avatar_in_my_posts_negotiation_feed(): void
    {
        $tourist = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
            'name' => 'Tourist With Avatar',
            'avatar_path' => 'images/avatars/tourist_ava.png',
        ]);

        $this->actingAs($tourist)
            ->postJson('/tourist/requests', [
                'title' => 'Bukidnon family weekend',
                'description' => 'Looking for a relaxed plan.',
                'location' => 'Malaybalay City',
                'region' => 'Northern Mindanao',
                'duration' => '2',
                'adults' => 2,
                'children' => 1,
                'budget' => 5500,
                'interests' => ['Nature'],
            ])
            ->assertCreated();

        $tourRequest = TourRequest::query()->where('tourist_id', $tourist->id)->latest('id')->firstOrFail();

        $this->actingAs($tourist)
            ->postJson('/tourist/requests/' . $tourRequest->id . '/comment', [
                'text' => 'Can we include a farm stop?',
            ])
            ->assertOk();

        $mineResponse = $this->actingAs($tourist)
            ->getJson('/tourist/requests/mine')
            ->assertOk()
            ->assertJsonPath('ok', true);

        $request = collect($mineResponse->json('requests'))->first(function ($item) use ($tourRequest) {
            return (string) ($item['id'] ?? '') === (string) $tourRequest->id;
        });

        $this->assertNotNull($request);
        $this->assertNotEmpty($request['comments'] ?? []);
        $this->assertSame('Tourist With Avatar', $request['comments'][0]['guideName'] ?? null);
        $this->assertSame('/images/avatars/tourist_ava.png', $request['comments'][0]['guideAvatar'] ?? null);
    }

    public function test_tourist_can_create_detailed_request_and_notify_guides_on_request_comment(): void
    {
        $tourist = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
        ]);

        $guide = User::factory()->create([
            'role' => 'guide',
            'email_verified_at' => now(),
        ]);

        $createResponse = $this->actingAs($tourist)
            ->postJson('/tourist/requests', [
                'title' => 'Tagum river and farm itinerary',
                'description' => 'Need a kid-friendly schedule, 7:30 AM pickup, lunch stop, and light walking.',
                'location' => 'Tagum City, Davao del Norte',
                'region' => 'Davao Region',
                'duration' => '3',
                'adults' => 2,
                'children' => 1,
                'budget' => 5200,
                'interests' => ['Nature', 'Food'],
            ]);

        $createResponse
            ->assertCreated()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('request.description', 'Need a kid-friendly schedule, 7:30 AM pickup, lunch stop, and light walking.');

        $requestId = (string) $createResponse->json('request.id');
        $tourRequest = TourRequest::query()->findOrFail($requestId);

        $this->actingAs($tourist)
            ->postJson('/tourist/requests/' . $tourRequest->id . '/comment', [
                'text' => 'Tourist is requesting an available guide for this trip.',
            ])
            ->assertOk()
            ->assertJsonPath('ok', true);

        $guide->refresh();
        $this->assertTrue(
            $guide->notifications()->where('type', 'tour-request.updated')->exists(),
            'Expected the guide to receive a tour-request.updated notification.'
        );
    }

    public function test_completed_requests_are_hidden_from_guide_request_feed(): void
    {
        $tourist = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
        ]);

        $guide = User::factory()->create([
            'role' => 'guide',
            'email_verified_at' => now(),
        ]);

        $openCreateResponse = $this->actingAs($tourist)
            ->postJson('/tourist/requests', [
                'title' => 'Open Request',
                'description' => 'Still open for guide comments',
                'location' => 'Davao City',
                'region' => 'Davao Region',
                'duration' => '1',
                'adults' => 2,
                'children' => 0,
                'budget' => 3000,
                'interests' => ['Nature'],
            ])
            ->assertCreated();

        $completedCreateResponse = $this->actingAs($tourist)
            ->postJson('/tourist/requests', [
                'title' => 'Completed Request',
                'description' => 'This should not appear in guide feed once completed',
                'location' => 'Tagum City',
                'region' => 'Davao Region',
                'duration' => '2',
                'adults' => 2,
                'children' => 0,
                'budget' => 4500,
                'interests' => ['Culture'],
            ])
            ->assertCreated();

        $openRequestId = (string) $openCreateResponse->json('request.id');
        $completedRequestId = (string) $completedCreateResponse->json('request.id');

        $this->actingAs($tourist)
            ->patchJson('/tourist/requests/' . $completedRequestId, [
                'status' => 'completed',
            ])
            ->assertOk()
            ->assertJsonPath('ok', true);

        $feedResponse = $this->actingAs($guide)
            ->getJson('/guide/request-feed')
            ->assertOk()
            ->assertJsonPath('ok', true);

        $requests = collect($feedResponse->json('requests'));
        $this->assertTrue($requests->contains(function ($item) use ($openRequestId) {
            return (string) ($item['id'] ?? '') === $openRequestId;
        }));
        $this->assertFalse($requests->contains(function ($item) use ($completedRequestId) {
            return (string) ($item['id'] ?? '') === $completedRequestId;
        }));
        $this->assertTrue($requests->every(function ($item) {
            return in_array((string) ($item['status'] ?? ''), ['open', 'negotiating'], true);
        }));
    }

    public function test_tourist_can_unselect_guide_and_reopen_negotiation(): void
    {
        $tourist = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
        ]);

        $selectedGuide = User::factory()->create([
            'role' => 'guide',
            'email_verified_at' => now(),
        ]);

        $otherGuide = User::factory()->create([
            'role' => 'guide',
            'email_verified_at' => now(),
        ]);

        $createResponse = $this->actingAs($tourist)
            ->postJson('/tourist/requests', [
                'title' => 'Beach and city mix',
                'description' => 'Need a flexible guide option.',
                'location' => 'Davao City',
                'region' => 'Davao Region',
                'duration' => '2',
                'adults' => 2,
                'children' => 0,
                'budget' => 5000,
                'interests' => ['Nature'],
            ])
            ->assertCreated();

        $requestId = (string) $createResponse->json('request.id');

        $this->actingAs($selectedGuide)
            ->postJson('/guide/request-feed/' . $requestId . '/comment', [
                'text' => 'I can guide this trip.',
                'offer_amount' => 4800,
            ])
            ->assertOk();

        $this->actingAs($otherGuide)
            ->postJson('/guide/request-feed/' . $requestId . '/comment', [
                'text' => 'I can also assist with a custom route.',
                'offer_amount' => 4700,
            ])
            ->assertOk();

        $this->actingAs($tourist)
            ->postJson('/tourist/requests/' . $requestId . '/select-guide', [
                'guide_id' => $selectedGuide->id,
                'offer_amount' => 4800,
            ])
            ->assertOk();

        $unselectResponse = $this->actingAs($tourist)
            ->postJson('/tourist/requests/' . $requestId . '/unselect-guide')
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('request.selectedGuideId', null)
            ->assertJsonPath('request.status', 'negotiating');

        $tourRequest = TourRequest::query()->findOrFail($requestId);
        $this->assertNull($tourRequest->selected_guide_id);
        $this->assertSame('negotiating', (string) $tourRequest->status);

        $this->actingAs($otherGuide)
            ->postJson('/guide/request-feed/' . $requestId . '/comment', [
                'text' => 'Negotiation reopened and I can still offer.',
                'offer_amount' => 4650,
            ])
            ->assertOk();

        $this->assertNotNull($unselectResponse->json('request'));
    }

    public function test_tourist_can_mark_request_as_cancelled_without_deleting_it(): void
    {
        $tourist = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
        ]);

        $createResponse = $this->actingAs($tourist)
            ->postJson('/tourist/requests', [
                'title' => 'Cancel status request',
                'description' => 'Should stay in history as cancelled.',
                'location' => 'Tagum City',
                'region' => 'Davao Region',
                'duration' => '1',
                'adults' => 1,
                'children' => 0,
                'budget' => 2500,
                'interests' => ['Culture'],
            ])
            ->assertCreated();

        $requestId = (string) $createResponse->json('request.id');

        $this->actingAs($tourist)
            ->patchJson('/tourist/requests/' . $requestId, [
                'status' => 'closed',
            ])
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('request.status', 'closed')
            ->assertJsonPath('request.negotiationStatus', 'cancelled');

        $this->assertDatabaseHas('tour_requests', [
            'id' => $requestId,
            'status' => 'closed',
        ]);
    }
}
