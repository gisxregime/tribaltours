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
        Schema::table('tour_listings', function (Blueprint $table) {
            // Add time_slots_json column if it doesn't exist
            if (!Schema::hasColumn('tour_listings', 'time_slots_json')) {
                $table->json('time_slots_json')->nullable()->after('duration_label');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tour_listings', function (Blueprint $table) {
            if (Schema::hasColumn('tour_listings', 'time_slots_json')) {
                $table->dropColumn('time_slots_json');
            }
        });
    }
};
