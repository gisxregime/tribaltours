<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederMessagingTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_creates_baseline_guide_tourist_message_data(): void
    {
        $this->seed(DatabaseSeeder::class);

        $guide = User::query()->where('email', 'guide@tribaltours.test')->first();
        $tourist = User::query()->where('email', 'tourist@tribaltours.test')->first();

        $this->assertNotNull($guide);
        $this->assertNotNull($tourist);

        $conversation = Conversation::query()
            ->where('guide_id', $guide->id)
            ->where('tourist_id', $tourist->id)
            ->first();

        $this->assertNotNull($conversation);
        $this->assertNotNull($conversation->last_message_at);

        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'sender_id' => $tourist->id,
            'body' => 'Hello guide, can you share a plan?',
        ]);
    }

    public function test_database_seeder_is_idempotent_for_baseline_messaging_data(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->seed(DatabaseSeeder::class);

        $guide = User::query()->where('email', 'guide@tribaltours.test')->first();
        $tourist = User::query()->where('email', 'tourist@tribaltours.test')->first();

        $this->assertNotNull($guide);
        $this->assertNotNull($tourist);

        $conversationCount = Conversation::query()
            ->where('guide_id', $guide->id)
            ->where('tourist_id', $tourist->id)
            ->count();

        $this->assertSame(1, $conversationCount);

        $conversation = Conversation::query()
            ->where('guide_id', $guide->id)
            ->where('tourist_id', $tourist->id)
            ->firstOrFail();

        $starterMessageCount = Message::query()
            ->where('conversation_id', $conversation->id)
            ->where('sender_id', $tourist->id)
            ->where('body', 'Hello guide, can you share a plan?')
            ->count();

        $this->assertSame(1, $starterMessageCount);
    }
}
