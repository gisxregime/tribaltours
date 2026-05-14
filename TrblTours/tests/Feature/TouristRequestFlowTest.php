<?php

namespace Tests\Feature;

use App\Models\TourRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TouristRequestFlowTest extends TestCase
{
    use RefreshDatabase;

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
}
