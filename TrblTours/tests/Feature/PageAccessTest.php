<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PageAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_sign_in_for_tourist_pages(): void
    {
        $response = $this->get('/explore');

        $response->assertRedirect('/sign-in');
    }

    public function test_guest_is_redirected_to_sign_in_for_guide_pages(): void
    {
        $response = $this->get('/guide/dashboard');

        $response->assertRedirect('/sign-in');
    }

    public function test_tourist_can_access_tourist_pages(): void
    {
        $tourist = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($tourist)->get('/explore');

        $response->assertOk();
    }

    public function test_guide_cannot_access_tourist_pages(): void
    {
        $guide = User::factory()->create([
            'role' => 'guide',
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($guide)->get('/explore');

        $response->assertForbidden();
    }

    public function test_guide_can_access_guide_pages(): void
    {
        $guide = User::factory()->create([
            'role' => 'guide',
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($guide)->get('/guide/dashboard');

        $response->assertOk();
    }

    public function test_tourist_cannot_access_guide_pages(): void
    {
        $tourist = User::factory()->create([
            'role' => 'tourist',
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($tourist)->get('/guide/dashboard');

        $response->assertForbidden();
    }
}
