<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Review;
use App\Models\TourListing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuideRealtimeApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guide_message_threads_are_unique_per_tourist_and_use_latest_preview(): void
    {
        [$guide, $tourist] = $this->createGuideAndTourist();
        $tourist->update(['avatar_path' => 'images/avatars/tourist_unique.png']);

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
            'sender_id' => $tourist->id,
            'body' => 'Oldest tourist message',
            'is_read' => false,
            'created_at' => now()->subHour(),
            'updated_at' => now()->subHour(),
        ]);

        Message::query()->create([
            'conversation_id' => $newerConversation->id,
            'sender_id' => $tourist->id,
            'body' => 'Newest tourist message',
            'is_read' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $threadsResponse = $this->actingAs($guide)
            ->getJson('/guide/messages/threads')
            ->assertOk()
            ->assertJsonPath('ok', true);

        $conversations = collect($threadsResponse->json('conversations'));
        $touristThreads = $conversations->filter(function ($item) use ($tourist) {
            return (string) ($item['touristId'] ?? '') === (string) $tourist->id;
        })->values();

        $this->assertCount(1, $touristThreads);
        $this->assertSame('/images/avatars/tourist_unique.png', $touristThreads[0]['avatar'] ?? null);
        $this->assertSame('Newest tourist message', $touristThreads[0]['last'] ?? null);
        $this->assertNotEmpty($touristThreads[0]['time'] ?? null);
    }

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

    public function test_guide_opening_thread_merges_duplicate_conversation_rows_and_marks_all_incoming_read(): void
    {
        [$guide, $tourist] = $this->createGuideAndTourist();

        $firstConversation = Conversation::query()->create([
            'tourist_id' => $tourist->id,
            'guide_id' => $guide->id,
            'last_message_at' => now()->subMinutes(40),
        ]);

        $secondConversation = Conversation::query()->create([
            'tourist_id' => $tourist->id,
            'guide_id' => $guide->id,
            'last_message_at' => now(),
        ]);

        $incomingOne = Message::query()->create([
            'conversation_id' => $firstConversation->id,
            'sender_id' => $tourist->id,
            'body' => 'First thread message',
            'is_read' => false,
            'created_at' => now()->subMinutes(35),
            'updated_at' => now()->subMinutes(35),
        ]);

        $outgoing = Message::query()->create([
            'conversation_id' => $firstConversation->id,
            'sender_id' => $guide->id,
            'body' => 'Guide response',
            'is_read' => true,
            'created_at' => now()->subMinutes(20),
            'updated_at' => now()->subMinutes(20),
        ]);

        $incomingTwo = Message::query()->create([
            'conversation_id' => $secondConversation->id,
            'sender_id' => $tourist->id,
            'body' => 'Second thread message',
            'is_read' => false,
            'created_at' => now()->subMinutes(5),
            'updated_at' => now()->subMinutes(5),
        ]);

        $response = $this->actingAs($guide)
            ->getJson('/guide/messages/threads/' . $firstConversation->id)
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('conversation.touristId', (string) $tourist->id)
            ->assertJsonPath('conversation.guideId', (string) $guide->id);

        $messages = collect($response->json('messages'));
        $this->assertCount(3, $messages);
        $this->assertSame(
            ['First thread message', 'Guide response', 'Second thread message'],
            $messages->pluck('text')->all()
        );

        $incomingOne->refresh();
        $incomingTwo->refresh();
        $outgoing->refresh();

        $this->assertTrue((bool) $incomingOne->is_read);
        $this->assertNotNull($incomingOne->read_at);
        $this->assertTrue((bool) $incomingTwo->is_read);
        $this->assertNotNull($incomingTwo->read_at);
        $this->assertTrue((bool) $outgoing->is_read);
    }

    public function test_guide_can_send_message_and_tourist_gets_notified(): void
    {
        [$guide, $tourist] = $this->createGuideAndTourist();
        $guide->update(['avatar_path' => 'images/avatars/guide_sender.png']);

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
            ->assertJsonPath('message.text', 'I can guide you tomorrow.')
            ->assertJsonPath('message.senderAvatar', '/images/avatars/guide_sender.png');

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
            ->assertJsonFragment(['id' => (string) $booking->id])
            ->assertJsonPath('bookings.0.touristAvatar', '/images/manila.jpg');

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
        $this->assertSame('booking.accepted', $touristNotification->type);
    }

    public function test_guide_dashboard_json_includes_reviews_with_listing_context(): void
    {
        [$guide, $tourist] = $this->createGuideAndTourist();

        $listing = TourListing::query()->create([
            'guide_id' => $guide->id,
            'slug' => 'guide-review-dashboard-listing',
            'title' => 'Guide Dashboard Listing',
            'short_description' => 'Listing used for dashboard review assertions.',
            'price' => 1800,
            'status' => 'published',
            'is_active' => true,
        ]);

        $booking = Booking::query()->create([
            'booking_reference' => 'TRBL-GUIDE-REVIEW-01',
            'tourist_id' => $tourist->id,
            'guide_id' => $guide->id,
            'tour_listing_id' => $listing->id,
            'status' => 'completed',
            'payment_status' => 'paid',
            'guest_count' => 2,
            'price_snapshot' => 1800,
            'total_amount' => 3600,
            'reservation_type' => 'instant',
            'booked_for_date' => now()->toDateString(),
        ]);

        Review::query()->create([
            'booking_id' => $booking->id,
            'tour_listing_id' => $listing->id,
            'tourist_id' => $tourist->id,
            'guide_id' => $guide->id,
            'rating' => 5,
            'title' => 'Amazing Tour',
            'comment' => 'Tour was organized and enjoyable.',
            'is_public' => true,
        ]);

        $this->actingAs($guide)
            ->getJson('/guide/dashboard')
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('reviews.0.tourId', (string) $listing->id)
            ->assertJsonPath('reviews.0.listingTitle', 'Guide Dashboard Listing')
            ->assertJsonPath('reviews.0.rating', 5);
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
