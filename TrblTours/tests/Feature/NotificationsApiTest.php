<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class NotificationsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_fetch_notifications(): void
    {
        $user = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
        ]);

        $notification = $user->notifications()->create([
            'id' => (string) Str::uuid(),
            'type' => 'message.received',
            'data' => [
                'type' => 'message.received',
                'text' => 'Guide sent you a new message.',
                'payload' => [
                    'conversationId' => '12',
                ],
            ],
        ]);

        $response = $this->actingAs($user)->getJson('/notifications');

        $response
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('items.0.id', (string) $notification->id)
            ->assertJsonPath('items.0.type', 'message.received')
            ->assertJsonPath('items.0.read', false)
            ->assertJsonStructure([
                'ok',
                'items' => [
                    ['id', 'type', 'text', 'payload', 'read', 'createdAt', 'time'],
                ],
                'pusher' => ['key', 'cluster'],
            ]);
    }

    public function test_user_can_mark_notification_as_read(): void
    {
        $user = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
        ]);

        $notification = $user->notifications()->create([
            'id' => (string) Str::uuid(),
            'type' => 'booking.updated',
            'data' => [
                'type' => 'booking.updated',
                'text' => 'Booking updated.',
                'payload' => [
                    'bookingId' => '44',
                ],
            ],
        ]);

        $this->actingAs($user)
            ->patchJson('/notifications/' . $notification->id . '/read')
            ->assertOk()
            ->assertJsonPath('ok', true);

        $notification->refresh();

        $this->assertNotNull($notification->read_at);
    }

    public function test_user_can_mark_all_notifications_as_read(): void
    {
        $user = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
        ]);
        $otherUser = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
        ]);

        $user->notifications()->create([
            'id' => (string) Str::uuid(),
            'type' => 'tour-request.updated',
            'data' => [
                'type' => 'tour-request.updated',
                'text' => 'Request updated.',
                'payload' => ['requestId' => '100'],
            ],
        ]);
        $user->notifications()->create([
            'id' => (string) Str::uuid(),
            'type' => 'message.received',
            'data' => [
                'type' => 'message.received',
                'text' => 'Message received.',
                'payload' => ['conversationId' => '12'],
            ],
        ]);
        $otherUser->notifications()->create([
            'id' => (string) Str::uuid(),
            'type' => 'message.received',
            'data' => [
                'type' => 'message.received',
                'text' => 'Other user unread.',
                'payload' => ['conversationId' => '99'],
            ],
        ]);

        $this->actingAs($user)
            ->postJson('/notifications/read-all')
            ->assertOk()
            ->assertJsonPath('ok', true);

        $this->assertSame(0, $user->notifications()->whereNull('read_at')->count());
        $this->assertSame(1, $otherUser->notifications()->whereNull('read_at')->count());
    }
}
