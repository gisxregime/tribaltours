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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_reference')->unique();
            $table->foreignId('tourist_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('guide_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('tour_listing_id')->nullable();
            $table->foreignId('tour_request_id')->nullable();
            $table->date('booked_for_date')->nullable();
            $table->string('booked_for_time')->nullable();
            $table->unsignedSmallInteger('guest_count')->default(1);
            $table->decimal('price_snapshot', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->enum('payment_status', ['unpaid', 'partial', 'paid', 'refunded'])->default('unpaid');
            $table->enum('status', ['pending', 'accepted', 'declined', 'confirmed', 'completed', 'cancelled'])->default('pending');
            $table->enum('reservation_type', ['instant', 'manual'])->default('instant');
            $table->text('notes')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('declined_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['guide_id', 'status']);
            $table->index(['tourist_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
