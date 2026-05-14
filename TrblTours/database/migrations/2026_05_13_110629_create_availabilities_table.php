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
        Schema::create('availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guide_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('tour_listing_id')->nullable()->constrained('tour_listings')->nullOnDelete();
            $table->date('date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->unsignedSmallInteger('capacity')->default(1);
            $table->enum('status', ['available', 'unavailable', 'booked'])->default('available');
            $table->string('notes')->nullable();
            $table->timestamps();

            $table->index(['guide_id', 'date', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('availabilities');
    }
};
