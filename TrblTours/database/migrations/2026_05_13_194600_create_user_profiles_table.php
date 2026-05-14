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
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('first_name')->nullable();
            $table->string('middle_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('suffix', 20)->nullable();
            $table->string('gender', 40)->nullable();
            $table->date('birth_date')->nullable();
            $table->unsignedTinyInteger('age')->nullable();
            $table->string('nationality', 120)->nullable();
            $table->string('mobile_country_code', 10)->nullable();
            $table->string('mobile_number_local', 40)->nullable();
            $table->string('mobile_number_e164', 40)->nullable();
            $table->string('email_address')->nullable();
            $table->text('current_address')->nullable();
            $table->string('city', 120)->nullable();
            $table->string('province_state', 120)->nullable();
            $table->string('country', 120)->nullable();
            $table->timestamps();

            $table->index(['country', 'city']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
