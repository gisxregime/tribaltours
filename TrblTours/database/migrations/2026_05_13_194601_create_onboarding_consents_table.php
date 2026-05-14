<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('onboarding_consents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->boolean('terms_accepted')->default(false);
            $table->boolean('privacy_accepted')->default(false);
            $table->boolean('info_accuracy_confirmed')->default(false);
            $table->boolean('verification_consent')->default(false);
            $table->boolean('commission_policy_accepted')->default(false);
            $table->boolean('safety_guidelines_accepted')->default(false);
            $table->timestamp('consented_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('onboarding_consents');
    }
};
