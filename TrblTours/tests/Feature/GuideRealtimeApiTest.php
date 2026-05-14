<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\TourListing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuideRealtimeApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guide_can_list_and_open_message_threads(): void
    {
        [$guide, $tourist] = $this->createGuideAndTourist();

        $conversation = Conversation::query()->create([
            'tourist_id' => $tourist->id,
            'guide_id' => $guide->id,
            'last_message_at' => now(),
        ]);

        $message = Message::query()->create([
            'conversation_id' => $conversation->id,
            'sender_id' => $tourist->id,
            'body' => 'Hello guide',
            'is_read' => false,
        ]);

        $this->actingAs($guide)
            ->getJson('/guide/messages/threads')
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonFragment(['id' => (string) $conversation->id]);

        $this->actingAs($guide)
            ->getJson('/guide/messages/threads/' . $conversation->id)
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('conversation.id', (string) $conversation->id);

        $message->refresh();
        $this->assertTrue((bool) $message->is_read);
        $this->assertNotNull($message->read_at);
    }

    public function test_guide_can_send_message_and_tourist_gets_notified(): void
    {
        [$guide, $tourist] = $this->createGuideAndTourist();

        $conversation = Conversation::query()->create([
            'tourist_id' => $tourist->id,
            'guide_id' => $guide->id,
            'last_message_at' => now(),
        ]);

        $this->actingAs($guide)
            ->postJson('/guide/messages/threads/' . $conversation->id, [
                'body' => 'I can guide you tomorrow.',
            ])
            ->assertCreated()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('message.text', 'I can guide you tomorrow.');

        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'sender_id' => $guide->id,
            'body' => 'I can guide you tomorrow.',
        ]);

        $notification = $tourist->notifications()->latest()->first();
        $this->assertNotNull($notification);
        $this->assertSame('message.received', $notification->type);
        $this->assertSame((string) $conversation->id, (string) ($notification->data['payload']['conversationId'] ?? ''));
    }

    public function test_guide_can_fetch_and_update_booking_requests(): void
    {
        [$guide, $tourist] = $this->createGuideAndTourist();

        $listing = TourListing::query()->create([
            'guide_id' => $guide->id,
            'slug' => 'cebu-day-tour',
            'title' => 'Cebu Day Tour',
            'short_description' => 'Island and city highlights.',
            'price' => 1500,
            'status' => 'published',
            'is_active' => true,
        ]);

        $booking = Booking::query()->create([
            'booking_reference' => 'TRBL-TEST-0001',
            'tourist_id' => $tourist->id,
            'guide_id' => $guide->id,
            'tour_listing_id' => $listing->id,
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'guest_count' => 2,
            'price_snapshot' => 1500,
            'total_amount' => 3000,
            'reservation_type' => 'instant',
        ]);

        $this->actingAs($guide)
            ->getJson('/guide/booking-requests')
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonFragment(['id' => (string) $booking->id]);

        $this->actingAs($guide)
            ->putJson('/guide/booking-requests/' . $booking->id, [
                'status' => 'accepted',
            ])
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('booking.statusRaw', 'accepted');

        $booking->refresh();
        $this->assertSame('accepted', $booking->status);
        $this->assertNotNull($booking->approved_at);

        $touristNotification = $tourist->notifications()->latest()->first();
        $this->assertNotNull($touristNotification);
        $this->assertSame('booking.updated', $touristNotification->type);
    }

    private function createGuideAndTourist(): array
    {
        $guide = User::factory()->create([
            'role' => 'guide',
            'email_verified_at' => now(),
        ]);

        $tourist = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
        ]);

        return [$guide, $tourist];
    }
}
