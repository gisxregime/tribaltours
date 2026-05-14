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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 40)->nullable()->after('email');
            $table->enum('role', ['tourist', 'guide', 'admin'])->default('tourist')->after('phone');
            $table->string('location')->nullable()->after('role');
            $table->string('avatar_path')->nullable()->after('location');
            $table->text('bio')->nullable()->after('avatar_path');
            $table->unsignedTinyInteger('onboarding_step')->default(1)->after('bio');
            $table->boolean('is_profile_completed')->default(false)->after('onboarding_step');
            $table->enum('guide_verification_status', ['pending', 'approved', 'rejected'])->nullable()->after('is_profile_completed');
            $table->timestamp('guide_verified_at')->nullable()->after('guide_verification_status');
            $table->timestamp('last_seen_at')->nullable()->after('guide_verified_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'role',
                'location',
                'avatar_path',
                'bio',
                'onboarding_step',
                'is_profile_completed',
                'guide_verification_status',
                'guide_verified_at',
                'last_seen_at',
            ]);
        });
    }
};
