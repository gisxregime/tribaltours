<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@trbltours.test'],
            [
                'name' => 'TrblTours Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
                'is_profile_completed' => true,
            ]
        );

        $sampleGuide = User::query()->updateOrCreate(
            ['email' => 'guide@trbltours.test'],
            [
                'name' => 'Sample Guide',
                'password' => Hash::make('password'),
                'role' => 'guide',
                'guide_verification_status' => 'approved',
                'guide_verified_at' => now(),
                'email_verified_at' => now(),
                'is_profile_completed' => true,
            ]
        );

        $sampleTourist = User::query()->updateOrCreate(
            ['email' => 'tourist@trbltours.test'],
            [
                'name' => 'Sample Tourist',
                'password' => Hash::make('password'),
                'role' => 'tourist',
                'email_verified_at' => now(),
                'is_profile_completed' => true,
            ]
        );

        User::factory(6)->create();

        $conversation = Conversation::query()->firstOrCreate(
            [
                'tourist_id' => $sampleTourist->id,
                'guide_id' => $sampleGuide->id,
            ],
            [
                'last_message_at' => now(),
            ]
        );

        if (! Message::query()->where('conversation_id', $conversation->id)->exists()) {
            Message::query()->create([
                'conversation_id' => $conversation->id,
                'sender_id' => $sampleTourist->id,
                'body' => 'Hello guide, can you share a plan?',
                'is_read' => false,
            ]);
        }

        $conversation->update([
            'last_message_at' => now(),
        ]);

        $this->call([
            MessagingFeatureTestSeeder::class,
        ]);
    }
}
