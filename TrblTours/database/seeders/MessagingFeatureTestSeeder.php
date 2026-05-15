<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Conversation;
use App\Models\GuideProfile;
use App\Models\Message;
use App\Models\TourListing;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class MessagingFeatureTestSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $guide = User::query()->updateOrCreate(
            ['email' => 'qa-guide@tribaltours.test'],
            [
                'name' => 'QA Guide',
                'password' => Hash::make('password'),
                'role' => 'guide',
                'guide_verification_status' => 'approved',
                'guide_verified_at' => now(),
                'email_verified_at' => now(),
                'is_profile_completed' => true,
                'avatar_path' => 'images/avatars/qa_guide.png',
                'bio' => 'QA guide profile used for messaging and avatar validation.',
                'location' => 'Davao City',
            ]
        );

        $tourist = User::query()->updateOrCreate(
            ['email' => 'qa-tourist@tribaltours.test'],
            [
                'name' => 'QA Tourist',
                'password' => Hash::make('password'),
                'role' => 'tourist',
                'email_verified_at' => now(),
                'is_profile_completed' => true,
                'avatar_path' => 'images/avatars/qa_tourist.png',
                'bio' => 'Primary QA tourist for duplicate-thread checks.',
                'location' => 'Cebu City',
            ]
        );

        $secondaryTourist = User::query()->updateOrCreate(
            ['email' => 'qa-tourist-2@tribaltours.test'],
            [
                'name' => 'QA Tourist Two',
                'password' => Hash::make('password'),
                'role' => 'tourist',
                'email_verified_at' => now(),
                'is_profile_completed' => true,
                'avatar_path' => 'images/avatars/qa_tourist_two.png',
                'bio' => 'Secondary QA tourist for list sorting checks.',
                'location' => 'Manila',
            ]
        );

        GuideProfile::query()->updateOrCreate(
            ['user_id' => $guide->id],
            [
                'guide_certificate_number' => 'QA-GUIDE-2026',
                'years_of_experience' => 5,
                'languages_spoken' => 'English, Filipino',
                'areas_of_expertise' => 'Island hopping, private transfers, cultural tours',
                'tour_categories' => ['Nature', 'Culture', 'Adventure'],
            ]
        );

        $listing = TourListing::query()->updateOrCreate(
            ['slug' => 'qa-message-flow-tour'],
            [
                'guide_id' => $guide->id,
                'title' => 'QA Messaging Flow Tour',
                'short_description' => 'Listing seeded for messaging/avatar QA validation.',
                'category' => 'Island Hopping',
                'province' => 'Davao del Sur',
                'city' => 'Davao City',
                'meeting_area' => 'Magsaysay Wharf',
                'meeting_point' => 'Main gate pickup point',
                'duration_label' => '1 day',
                'min_guests' => 1,
                'max_guests' => 8,
                'price' => 2500,
                'price_type' => 'per_person',
                'reservation_type' => 'instant',
                'free_cancellation' => true,
                'reserve_now_pay_later' => true,
                'languages' => 'English, Filipino',
                'includes' => ['Boat transfer', 'Lunch'],
                'difficulty' => 'Moderate',
                'rating_avg' => 4.8,
                'reviews_count' => 17,
                'status' => 'published',
                'cover_image_path' => 'images/pangasinan.jpg',
                'gallery_paths' => ['images/pangasinan.jpg', 'images/manila.jpg'],
                'is_active' => true,
                'published_at' => now(),
            ]
        );

        Booking::query()->updateOrCreate(
            ['booking_reference' => 'TRBL-QA-0001'],
            [
                'tourist_id' => $tourist->id,
                'guide_id' => $guide->id,
                'tour_listing_id' => $listing->id,
                'booked_for_date' => now()->addDays(5)->toDateString(),
                'booked_for_time' => '08:00 AM',
                'guest_count' => 2,
                'price_snapshot' => 2500,
                'total_amount' => 5000,
                'payment_status' => 'paid',
                'status' => 'accepted',
                'reservation_type' => 'instant',
                'approved_at' => now()->subDay(),
            ]
        );

        $this->seedDuplicatePairThread($tourist, $guide);
        $this->seedSinglePairThread($secondaryTourist, $guide);
    }

    private function seedDuplicatePairThread(User $tourist, User $guide): void
    {
        $this->resetPairConversations($tourist, $guide);

        $olderConversation = Conversation::query()->create([
            'tourist_id' => $tourist->id,
            'guide_id' => $guide->id,
            'last_message_at' => Carbon::now()->subMinutes(75),
        ]);

        $newerConversation = Conversation::query()->create([
            'tourist_id' => $tourist->id,
            'guide_id' => $guide->id,
            'last_message_at' => Carbon::now()->subMinutes(5),
        ]);

        Message::query()->create([
            'conversation_id' => $olderConversation->id,
            'sender_id' => $tourist->id,
            'body' => 'Hello guide, can we move our meetup 30 minutes earlier?',
            'is_read' => false,
            'created_at' => Carbon::now()->subMinutes(80),
            'updated_at' => Carbon::now()->subMinutes(80),
        ]);

        Message::query()->create([
            'conversation_id' => $olderConversation->id,
            'sender_id' => $guide->id,
            'body' => 'Yes, 7:30 AM works for me.',
            'is_read' => true,
            'created_at' => Carbon::now()->subMinutes(72),
            'updated_at' => Carbon::now()->subMinutes(72),
            'read_at' => Carbon::now()->subMinutes(71),
        ]);

        Message::query()->create([
            'conversation_id' => $newerConversation->id,
            'sender_id' => $tourist->id,
            'body' => 'Great, also sharing updated guest list now.',
            'is_read' => false,
            'created_at' => Carbon::now()->subMinutes(6),
            'updated_at' => Carbon::now()->subMinutes(6),
        ]);

        $olderConversation->update(['last_message_at' => Carbon::now()->subMinutes(72)]);
        $newerConversation->update(['last_message_at' => Carbon::now()->subMinutes(6)]);
    }

    private function seedSinglePairThread(User $tourist, User $guide): void
    {
        $this->resetPairConversations($tourist, $guide);

        $conversation = Conversation::query()->create([
            'tourist_id' => $tourist->id,
            'guide_id' => $guide->id,
            'last_message_at' => Carbon::now()->subMinutes(25),
        ]);

        Message::query()->create([
            'conversation_id' => $conversation->id,
            'sender_id' => $tourist->id,
            'body' => 'Hi! Confirming if this slot is still available.',
            'is_read' => true,
            'created_at' => Carbon::now()->subMinutes(30),
            'updated_at' => Carbon::now()->subMinutes(30),
            'read_at' => Carbon::now()->subMinutes(28),
        ]);

        Message::query()->create([
            'conversation_id' => $conversation->id,
            'sender_id' => $guide->id,
            'body' => 'Yes, still available. I have reserved this slot for you.',
            'is_read' => true,
            'created_at' => Carbon::now()->subMinutes(25),
            'updated_at' => Carbon::now()->subMinutes(25),
            'read_at' => Carbon::now()->subMinutes(24),
        ]);

        $conversation->update(['last_message_at' => Carbon::now()->subMinutes(25)]);
    }

    private function resetPairConversations(User $tourist, User $guide): void
    {
        $conversationIds = Conversation::query()
            ->where('tourist_id', $tourist->id)
            ->where('guide_id', $guide->id)
            ->pluck('id');

        if ($conversationIds->isNotEmpty()) {
            Message::query()->whereIn('conversation_id', $conversationIds->all())->delete();
            Conversation::query()->whereIn('id', $conversationIds->all())->delete();
        }
    }
}
