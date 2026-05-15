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
        Schema::table('tour_requests', function (Blueprint $table) {
            $table->timestamp('selected_at')->nullable()->after('selected_guide_id');
            $table->boolean('is_active')->default(true)->after('status');
            $table->timestamp('closed_at')->nullable()->after('is_active');
            $table->index(['status', 'is_active', 'selected_guide_id'], 'tour_requests_feed_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tour_requests', function (Blueprint $table) {
            $table->dropIndex('tour_requests_feed_index');
            $table->dropColumn(['selected_at', 'is_active', 'closed_at']);
        });
    }
};
