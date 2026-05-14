<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Review;
use App\Models\TourListing;
use App\Models\TourRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TouristWorkspacePersistenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_tourist_account_profile_preferences_settings_and_password_are_persisted(): void
    {
        $tourist = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
        ]);
        $tourist->markEmailAsVerified();

        $this->actingAs($tourist)
            ->patchJson('/tourist/account/profile', [
                'name' => 'Tourist Updated',
                'email' => 'tourist.updated@example.test',
                'phone' => '+639123456789',
                'bio' => 'Updated bio text.',
            ])
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('account.name', 'Tourist Updated')
            ->assertJsonPath('account.email', 'tourist.updated@example.test');

        $this->actingAs($tourist)
            ->patchJson('/tourist/account/preferences', [
                'interests' => ['Nature', 'Food Tours'],
                'notify_booking_updates' => true,
                'notify_messages' => false,
                'notify_weekly_suggestions' => true,
            ])
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('preferences.notify_messages', false)
            ->assertJsonPath('preferences.notify_weekly_suggestions', true);

        $this->actingAs($tourist)
            ->patchJson('/tourist/account/settings', [
                'email_notifications' => false,
                'private_profile' => true,
            ])
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('settings.email_notifications', false)
            ->assertJsonPath('settings.private_profile', true);

        $this->actingAs($tourist)
            ->patchJson('/tourist/account/password', [
                'current_password' => 'password',
                'password' => 'StrongPass123',
                'password_confirmation' => 'StrongPass123',
            ])
            ->assertOk()
            ->assertJsonPath('ok', true);

        $tourist->refresh();

        $this->assertSame('Tourist Updated', $tourist->name);
        $this->assertSame('tourist.updated@example.test', $tourist->email);
        $this->assertSame('+639123456789', $tourist->phone);
        $this->assertSame('Updated bio text.', $tourist->bio);
        $this->assertTrue(Hash::check('StrongPass123', $tourist->password));

        $this->assertSame(['Nature', 'Food Tours'], $tourist->account_preferences['interests']);
        $this->assertFalse((bool) $tourist->account_preferences['notify_messages']);
        $this->assertTrue((bool) $tourist->account_preferences['notify_weekly_suggestions']);

        $this->assertFalse((bool) $tourist->account_settings['email_notifications']);
        $this->assertTrue((bool) $tourist->account_settings['private_profile']);
    }

    public function test_tourist_request_status_update_and_delete_are_persistent_via_json_routes(): void
    {
        $tourist = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
        ]);
        $tourist->markEmailAsVerified();

        $tourRequest = TourRequest::query()->create([
            'tourist_id' => $tourist->id,
            'title' => 'Need a local guide',
            'description' => 'Family trip request.',
            'status' => 'open',
        ]);

        $this->actingAs($tourist)
            ->patchJson('/tourist/requests/' . $tourRequest->id, [
                'status' => 'completed',
            ])
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('request.status', 'completed');

        $this->assertDatabaseHas('tour_requests', [
            'id' => $tourRequest->id,
            'status' => 'completed',
        ]);

        $this->actingAs($tourist)
            ->deleteJson('/tourist/requests/' . $tourRequest->id)
            ->assertOk()
            ->assertJsonPath('ok', true);

        $this->assertSoftDeleted('tour_requests', [
            'id' => $tourRequest->id,
        ]);
    }

    public function test_cancelled_booking_state_is_returned_as_cancelled_for_tourist_bookings_feed(): void
    {
        $tourist = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
        ]);
        $tourist->markEmailAsVerified();

        $guide = User::factory()->create([
            'role' => 'guide',
            'email_verified_at' => now(),
        ]);
        $guide->markEmailAsVerified();

        $booking = Booking::query()->create([
            'booking_reference' => 'TRBL-CANCELLED-1',
            'tourist_id' => $tourist->id,
            'guide_id' => $guide->id,
            'tour_listing_id' => null,
            'guest_count' => 2,
            'price_snapshot' => 1200,
            'total_amount' => 2400,
            'payment_status' => 'unpaid',
            'status' => 'cancelled',
            'reservation_type' => 'manual',
        ]);

        $this->actingAs($tourist)
            ->getJson('/tourist/bookings/mine')
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonFragment([
                'id' => (string) $booking->id,
                'state' => 'cancelled',
            ]);
    }

    public function test_tourist_requests_mine_returns_live_stats_from_database(): void
    {
        $tourist = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
        ]);
        $tourist->markEmailAsVerified();

        $guide = User::factory()->create([
            'role' => 'guide',
            'email_verified_at' => now(),
        ]);
        $guide->markEmailAsVerified();

        TourRequest::query()->create([
            'tourist_id' => $tourist->id,
            'selected_guide_id' => null,
            'title' => 'Open Request',
            'description' => 'Open request description.',
            'status' => 'open',
        ]);

        TourRequest::query()->create([
            'tourist_id' => $tourist->id,
            'selected_guide_id' => $guide->id,
            'title' => 'Closed Request',
            'description' => 'Guide selected.',
            'status' => 'closed',
        ]);

        Booking::query()->create([
            'booking_reference' => 'TRBL-COMPLETE-1',
            'tourist_id' => $tourist->id,
            'guide_id' => $guide->id,
            'tour_listing_id' => null,
            'guest_count' => 2,
            'price_snapshot' => 1000,
            'total_amount' => 2000,
            'payment_status' => 'paid',
            'status' => 'completed',
            'reservation_type' => 'manual',
            'completed_at' => now(),
        ]);

        $this->actingAs($tourist)
            ->getJson('/tourist/requests/mine')
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('stats.total_requests', 2)
            ->assertJsonPath('stats.open_requests', 1)
            ->assertJsonPath('stats.selected_guides', 1)
            ->assertJsonPath('stats.completed', 1);
    }

    public function test_tourist_booking_store_is_persistent_and_deduplicated_by_client_token(): void
    {
        $tourist = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
        ]);
        $tourist->markEmailAsVerified();

        $guide = User::factory()->create([
            'role' => 'guide',
            'email_verified_at' => now(),
        ]);
        $guide->markEmailAsVerified();

        $listing = TourListing::query()->create([
            'guide_id' => $guide->id,
            'slug' => 'tourist-dedup-listing',
            'title' => 'Dedup Listing',
            'short_description' => 'Dedup listing description.',
            'price' => 2200,
            'status' => 'published',
            'is_active' => true,
        ]);

        $payload = [
            'tour_listing_id' => $listing->id,
            'booked_for_date' => now()->addDays(3)->toDateString(),
            'booked_for_time' => '09:00 AM',
            'guest_count' => 2,
            'client_token' => 'token-dedup-1',
            'payment_method' => 'GCash',
            'payment_status' => 'paid',
        ];

        $first = $this->actingAs($tourist)
            ->postJson('/tourist/bookings', $payload)
            ->assertCreated()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('booking.state', 'pending')
            ->assertJsonPath('booking.paymentStatus', 'paid');

        $bookingId = (string) $first->json('booking.id');

        $this->actingAs($tourist)
            ->postJson('/tourist/bookings', $payload)
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('deduplicated', true)
            ->assertJsonPath('booking.id', $bookingId);

        $this->assertSame(1, Booking::query()->where('tourist_id', $tourist->id)->count());
        $this->assertDatabaseHas('bookings', [
            'id' => $bookingId,
            'status' => 'pending',
            'payment_status' => 'paid',
            'client_token' => 'token-dedup-1',
        ]);
    }

    public function test_tourist_booking_cancel_is_blocked_after_24_hours(): void
    {
        $tourist = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
        ]);
        $tourist->markEmailAsVerified();

        $guide = User::factory()->create([
            'role' => 'guide',
            'email_verified_at' => now(),
        ]);
        $guide->markEmailAsVerified();

        $booking = Booking::query()->create([
            'booking_reference' => 'TRBL-CANCEL-WINDOW',
            'tourist_id' => $tourist->id,
            'guide_id' => $guide->id,
            'tour_listing_id' => null,
            'guest_count' => 2,
            'price_snapshot' => 1400,
            'total_amount' => 2800,
            'payment_status' => 'paid',
            'status' => 'pending',
            'reservation_type' => 'manual',
        ]);

        $booking->forceFill([
            'created_at' => Carbon::now()->subHours(25),
            'updated_at' => Carbon::now()->subHours(25),
        ])->saveQuietly();

        $this->actingAs($tourist)
            ->patchJson('/tourist/bookings/' . $booking->id . '/transition', [
                'action' => 'cancel',
            ])
            ->assertStatus(422)
            ->assertJsonPath('ok', false);

        $booking->refresh();
        $this->assertSame('pending', $booking->status);
        $this->assertNull($booking->cancelled_at);
    }

    public function test_completed_booking_review_is_persisted_and_booking_feed_exposes_review(): void
    {
        $tourist = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
        ]);
        $tourist->markEmailAsVerified();

        $guide = User::factory()->create([
            'role' => 'guide',
            'email_verified_at' => now(),
        ]);
        $guide->markEmailAsVerified();

        $listing = TourListing::query()->create([
            'guide_id' => $guide->id,
            'slug' => 'review-ready-listing',
            'title' => 'Review Ready Listing',
            'short_description' => 'Listing for review flow assertions.',
            'price' => 3200,
            'status' => 'published',
            'is_active' => true,
        ]);

        $booking = Booking::query()->create([
            'booking_reference' => 'TRBL-REVIEW-0001',
            'tourist_id' => $tourist->id,
            'guide_id' => $guide->id,
            'tour_listing_id' => $listing->id,
            'status' => 'completed',
            'payment_status' => 'paid',
            'guest_count' => 2,
            'price_snapshot' => 3200,
            'total_amount' => 6400,
            'reservation_type' => 'instant',
            'completed_at' => now(),
        ]);

        $this->actingAs($tourist)
            ->postJson('/tourist/bookings/' . $booking->id . '/review', [
                'rating' => 5,
                'comment' => 'Excellent pace and clear instructions throughout the trip.',
            ])
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('review.rating', 5)
            ->assertJsonPath('booking.id', (string) $booking->id)
            ->assertJsonPath('booking.hasReview', true);

        $this->assertDatabaseHas('reviews', [
            'booking_id' => $booking->id,
            'tour_listing_id' => $listing->id,
            'tourist_id' => $tourist->id,
            'guide_id' => $guide->id,
            'rating' => 5,
            'is_public' => true,
        ]);

        $listing->refresh();
        $this->assertSame(1, (int) $listing->reviews_count);
        $this->assertEquals(5.0, (float) $listing->rating_avg);

        $this->actingAs($tourist)
            ->getJson('/tourist/bookings/mine')
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('bookings.0.id', (string) $booking->id)
            ->assertJsonPath('bookings.0.hasReview', true)
            ->assertJsonPath('bookings.0.review.rating', 5);
    }

    public function test_tour_feed_show_returns_public_recent_reviews(): void
    {
        $tourist = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
        ]);
        $tourist->markEmailAsVerified();

        $guide = User::factory()->create([
            'role' => 'guide',
            'email_verified_at' => now(),
        ]);
        $guide->markEmailAsVerified();

        $listing = TourListing::query()->create([
            'guide_id' => $guide->id,
            'slug' => 'preview-review-listing',
            'title' => 'Preview Review Listing',
            'short_description' => 'Listing used for tour preview review payload assertions.',
            'price' => 2800,
            'status' => 'published',
            'is_active' => true,
        ]);

        $booking = Booking::query()->create([
            'booking_reference' => 'TRBL-REVIEW-0002',
            'tourist_id' => $tourist->id,
            'guide_id' => $guide->id,
            'tour_listing_id' => $listing->id,
            'status' => 'completed',
            'payment_status' => 'paid',
            'guest_count' => 1,
            'price_snapshot' => 2800,
            'total_amount' => 2800,
            'reservation_type' => 'instant',
            'completed_at' => now(),
        ]);

        Review::query()->create([
            'booking_id' => $booking->id,
            'tour_listing_id' => $listing->id,
            'tourist_id' => $tourist->id,
            'guide_id' => $guide->id,
            'rating' => 4,
            'title' => 'Great Experience',
            'comment' => 'Loved the stopovers and route pacing.',
            'is_public' => true,
        ]);

        Review::query()->create([
            'booking_id' => null,
            'tour_listing_id' => $listing->id,
            'tourist_id' => $tourist->id,
            'guide_id' => $guide->id,
            'rating' => 3,
            'title' => 'Private Note',
            'comment' => 'Should not be exposed publicly.',
            'is_public' => false,
        ]);

        $this->actingAs($tourist)
            ->getJson('/tourist/tours/feed/' . $listing->id)
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('tour.id', (string) $listing->id)
            ->assertJsonPath('tour.recentReviews.0.rating', 4)
            ->assertJsonPath('tour.recentReviews.0.title', 'Great Experience');
    }
}
