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
            $table->string('client_token', 120)->nullable()->after('booking_reference');
            $table->string('payment_method', 120)->nullable()->after('payment_status');
            $table->string('payment_reference', 120)->nullable()->after('payment_method');
            $table->timestamp('paid_at')->nullable()->after('payment_reference');
            $table->timestamp('cancelled_at')->nullable()->after('declined_at');

            $table->unique(['tourist_id', 'client_token'], 'bookings_tourist_client_token_unique');
            $table->index(['status', 'created_at'], 'bookings_status_created_at_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropUnique('bookings_tourist_client_token_unique');
            $table->dropIndex('bookings_status_created_at_index');

            $table->dropColumn([
                'client_token',
                'payment_method',
                'payment_reference',
                'paid_at',
                'cancelled_at',
            ]);
        });
    }
};
