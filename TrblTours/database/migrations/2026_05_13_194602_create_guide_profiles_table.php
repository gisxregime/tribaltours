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
        Schema::create('guide_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->date('nbi_expiration_date')->nullable();
            $table->date('barangay_issued_date')->nullable();
            $table->string('guide_certificate_number')->nullable();
            $table->unsignedSmallInteger('years_of_experience')->nullable();
            $table->string('languages_spoken')->nullable();
            $table->text('areas_of_expertise')->nullable();
            $table->json('tour_categories')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guide_profiles');
    }
};
