<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuideProfileSyncTest extends TestCase
{
    use RefreshDatabase;

    public function test_guide_can_update_profile_via_api_and_persist_guide_profile_fields(): void
    {
        $guide = User::factory()->create([
            'role' => 'guide',
            'email_verified_at' => now(),
            'avatar_path' => 'images/manila.jpg',
        ]);

        $response = $this->actingAs($guide)->patch('/guide/account/profile', [
            'name' => 'Guide Updated Name',
            'email' => 'guide-updated@example.com',
            'phone' => '+63 999 111 2222',
            'location' => 'Davao City',
            'bio' => 'Updated guide bio for sync test.',
            'specialties' => 'Island Hopping, Cultural Tours',
            'languages' => 'English, Filipino, Cebuano',
            'certifications' => 'DOT Accredited Guide',
            'social' => 'facebook.com/guide-updated',
            'years_of_experience' => 6,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('profile.name', 'Guide Updated Name')
            ->assertJsonPath('profile.location', 'Davao City')
            ->assertJsonPath('profile.languages', 'English, Filipino, Cebuano')
            ->assertJsonPath('profile.specialties', 'Island Hopping, Cultural Tours')
            ->assertJsonPath('profile.certifications', 'DOT Accredited Guide');

        $guide->refresh();

        $this->assertSame('Guide Updated Name', $guide->name);
        $this->assertSame('guide-updated@example.com', $guide->email);
        $this->assertSame('+63 999 111 2222', $guide->phone);
        $this->assertSame('Davao City', $guide->location);
        $this->assertSame('Updated guide bio for sync test.', $guide->bio);

        $this->assertDatabaseHas('guide_profiles', [
            'user_id' => $guide->id,
            'languages_spoken' => 'English, Filipino, Cebuano',
            'areas_of_expertise' => 'Island Hopping, Cultural Tours',
            'guide_certificate_number' => 'DOT Accredited Guide',
            'years_of_experience' => 6,
        ]);
    }

    public function test_tourist_request_payload_uses_live_guide_profile_after_guide_edit(): void
    {
        $tourist = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
        ]);

        $guide = User::factory()->create([
            'role' => 'guide',
            'email_verified_at' => now(),
            'name' => 'Old Guide Name',
            'avatar_path' => 'images/old-guide.jpg',
        ]);

        $createResponse = $this->actingAs($tourist)
            ->postJson('/tourist/requests', [
                'title' => 'Samal daytrip',
                'description' => 'Need snorkeling and beach stops',
                'location' => 'Samal Island',
                'region' => 'Davao Region',
                'duration' => '1',
                'adults' => 2,
                'children' => 0,
                'budget' => 4000,
                'interests' => ['Nature'],
            ]);

        $requestId = (string) $createResponse->json('request.id');

        $this->actingAs($guide)
            ->postJson('/guide/request-feed/' . $requestId . '/comment', [
                'text' => 'Old profile offer message',
                'offer_amount' => 3900,
            ])
            ->assertOk();

        $this->actingAs($guide)
            ->patchJson('/guide/account/profile', [
                'name' => 'New Guide Name',
                'email' => $guide->email,
                'phone' => '+63 900 123 1234',
                'location' => 'Tagum City',
                'bio' => 'Updated bio for tourists.',
                'specialties' => 'Beach Planning',
                'languages' => 'English, Filipino',
                'certifications' => 'Licensed City Guide',
                'social' => 'instagram.com/new-guide',
                'years_of_experience' => 4,
            ])
            ->assertOk();

        $mineResponse = $this->actingAs($tourist)
            ->getJson('/tourist/requests/mine')
            ->assertOk()
            ->assertJsonPath('ok', true);

        $request = collect($mineResponse->json('requests'))->first(function ($item) use ($requestId) {
            return (string) ($item['id'] ?? '') === $requestId;
        });

        $this->assertNotNull($request);
        $this->assertIsArray($request['comments'] ?? null);
        $this->assertNotEmpty($request['comments']);
        $this->assertSame('New Guide Name', $request['comments'][0]['guideName'] ?? null);
        $this->assertSame('Updated bio for tourists.', $request['comments'][0]['guideBio'] ?? null);
        $this->assertSame('English, Filipino', $request['comments'][0]['guideLanguages'] ?? null);
        $this->assertSame('Beach Planning', $request['comments'][0]['guideSpecialties'] ?? null);
    }

    public function test_tourist_message_threads_show_latest_guide_name_after_profile_update(): void
    {
        $tourist = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
        ]);

        $guide = User::factory()->create([
            'role' => 'guide',
            'email_verified_at' => now(),
            'name' => 'Guide Before Rename',
            'avatar_path' => 'images/old-avatar.jpg',
        ]);

        $conversation = Conversation::query()->create([
            'tourist_id' => $tourist->id,
            'guide_id' => $guide->id,
            'last_message_at' => now(),
        ]);

        Message::query()->create([
            'conversation_id' => $conversation->id,
            'sender_id' => $guide->id,
            'body' => 'Initial message from guide',
            'is_read' => false,
        ]);

        $this->actingAs($guide)
            ->patchJson('/guide/account/profile', [
                'name' => 'Guide After Rename',
                'email' => $guide->email,
                'phone' => '+63 998 222 3333',
                'location' => 'Davao del Sur',
                'bio' => 'Profile updated before tourist thread fetch.',
                'specialties' => 'Nature Trips',
                'languages' => 'English, Filipino',
                'certifications' => 'DOT Accredited',
                'social' => 'facebook.com/after-rename',
                'years_of_experience' => 3,
            ])
            ->assertOk();

        $threadsResponse = $this->actingAs($tourist)
            ->getJson('/tourist/messages/threads')
            ->assertOk()
            ->assertJsonPath('ok', true);

        $thread = collect($threadsResponse->json('conversations'))->first(function ($item) use ($conversation) {
            return (string) ($item['id'] ?? '') === (string) $conversation->id;
        });

        $this->assertNotNull($thread);
        $this->assertSame('Guide After Rename', $thread['name'] ?? null);
    }

    public function test_tourist_message_threads_are_unique_per_guide_and_use_guide_avatar(): void
    {
        $tourist = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
        ]);

        $guide = User::factory()->create([
            'role' => 'guide',
            'email_verified_at' => now(),
            'name' => 'Unique Guide',
            'avatar_path' => 'images/avatars/guide_unique.png',
        ]);

        $olderConversation = Conversation::query()->create([
            'tourist_id' => $tourist->id,
            'guide_id' => $guide->id,
            'last_message_at' => now()->subHour(),
        ]);

        $newerConversation = Conversation::query()->create([
            'tourist_id' => $tourist->id,
            'guide_id' => $guide->id,
            'last_message_at' => now(),
        ]);

        Message::query()->create([
            'conversation_id' => $olderConversation->id,
            'sender_id' => $guide->id,
            'body' => 'Older conversation message',
            'is_read' => false,
            'created_at' => now()->subHour(),
            'updated_at' => now()->subHour(),
        ]);

        Message::query()->create([
            'conversation_id' => $newerConversation->id,
            'sender_id' => $guide->id,
            'body' => 'Newest guide message',
            'is_read' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $threadsResponse = $this->actingAs($tourist)
            ->getJson('/tourist/messages/threads')
            ->assertOk()
            ->assertJsonPath('ok', true);

        $conversations = collect($threadsResponse->json('conversations'));
        $guideThreads = $conversations->filter(function ($item) use ($guide) {
            return (string) ($item['guideId'] ?? '') === (string) $guide->id;
        })->values();

        $this->assertCount(1, $guideThreads);
        $this->assertSame('/images/avatars/guide_unique.png', $guideThreads[0]['avatar'] ?? null);
        $this->assertSame('Newest guide message', $guideThreads[0]['last'] ?? null);
        $this->assertNotEmpty($guideThreads[0]['time'] ?? null);
    }

    public function test_tourist_opening_thread_merges_duplicate_conversations_and_marks_incoming_as_read(): void
    {
        $tourist = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
            'avatar_path' => 'images/avatars/tourist_thread.png',
        ]);

        $guide = User::factory()->create([
            'role' => 'guide',
            'email_verified_at' => now(),
            'avatar_path' => 'images/avatars/guide_thread.png',
        ]);

        $firstConversation = Conversation::query()->create([
            'tourist_id' => $tourist->id,
            'guide_id' => $guide->id,
            'last_message_at' => now()->subMinutes(50),
        ]);

        $secondConversation = Conversation::query()->create([
            'tourist_id' => $tourist->id,
            'guide_id' => $guide->id,
            'last_message_at' => now(),
        ]);

        $guideIncomingOne = Message::query()->create([
            'conversation_id' => $firstConversation->id,
            'sender_id' => $guide->id,
            'body' => 'Guide first message',
            'is_read' => false,
            'created_at' => now()->subMinutes(45),
            'updated_at' => now()->subMinutes(45),
        ]);

        $touristReply = Message::query()->create([
            'conversation_id' => $firstConversation->id,
            'sender_id' => $tourist->id,
            'body' => 'Tourist reply',
            'is_read' => true,
            'created_at' => now()->subMinutes(30),
            'updated_at' => now()->subMinutes(30),
        ]);

        $guideIncomingTwo = Message::query()->create([
            'conversation_id' => $secondConversation->id,
            'sender_id' => $guide->id,
            'body' => 'Guide newest message',
            'is_read' => false,
            'created_at' => now()->subMinutes(5),
            'updated_at' => now()->subMinutes(5),
        ]);

        $response = $this->actingAs($tourist)
            ->getJson('/tourist/messages/threads/' . $firstConversation->id)
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('conversation.guideId', (string) $guide->id)
            ->assertJsonPath('conversation.touristId', (string) $tourist->id);

        $messages = collect($response->json('messages'));
        $this->assertCount(3, $messages);
        $this->assertSame(
            ['Guide first message', 'Tourist reply', 'Guide newest message'],
            $messages->pluck('text')->all()
        );
        $this->assertSame('/images/avatars/guide_thread.png', $messages[0]['senderAvatar'] ?? null);
        $this->assertSame('/images/avatars/tourist_thread.png', $messages[1]['senderAvatar'] ?? null);

        $guideIncomingOne->refresh();
        $guideIncomingTwo->refresh();
        $touristReply->refresh();

        $this->assertTrue((bool) $guideIncomingOne->is_read);
        $this->assertNotNull($guideIncomingOne->read_at);
        $this->assertTrue((bool) $guideIncomingTwo->is_read);
        $this->assertNotNull($guideIncomingTwo->read_at);
        $this->assertTrue((bool) $touristReply->is_read);
    }
}
