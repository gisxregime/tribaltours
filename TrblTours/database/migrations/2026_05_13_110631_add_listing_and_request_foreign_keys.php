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
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreign('tour_listing_id')->references('id')->on('tour_listings')->nullOnDelete();
            $table->foreign('tour_request_id')->references('id')->on('tour_requests')->nullOnDelete();
        });

        Schema::table('conversations', function (Blueprint $table) {
            $table->foreign('tour_listing_id')->references('id')->on('tour_listings')->nullOnDelete();
            $table->foreign('tour_request_id')->references('id')->on('tour_requests')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropForeign(['tour_listing_id']);
            $table->dropForeign(['tour_request_id']);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['tour_listing_id']);
            $table->dropForeign(['tour_request_id']);
        });
    }
};
