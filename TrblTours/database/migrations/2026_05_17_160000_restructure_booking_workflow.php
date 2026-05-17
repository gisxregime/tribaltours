<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Add conversation_id link if not exists
            if (!Schema::hasColumn('bookings', 'conversation_id')) {
                $table->foreignId('conversation_id')->nullable()->constrained('conversations')->nullOnDelete();
            }

            // Ensure tour_date and tour_time exist for the new workflow
            if (!Schema::hasColumn('bookings', 'tour_date')) {
                $table->date('tour_date')->nullable()->after('booked_for_date');
            }
            if (!Schema::hasColumn('bookings', 'tour_time')) {
                $table->string('tour_time')->nullable()->after('tour_date');
            }

            // Ensure we have the proper state tracking fields
            if (!Schema::hasColumn('bookings', 'schedule_confirmed_at')) {
                $table->timestamp('schedule_confirmed_at')->nullable();
            }

            // Drop old booking_status if it exists and recreate the proper way
            if (Schema::hasColumn('bookings', 'booking_status')) {
                // The column exists, we'll use it as the primary state field
            } else {
                $table->enum('booking_status', ['pending', 'accepted', 'schedule_confirmed', 'waiting_payment', 'paid', 'completed', 'declined', 'cancelled'])
                    ->default('pending')
                    ->after('status');
            }

            // Update payment_status enum if needed
            // Note: This might fail on some DB versions, so we use raw SQL as fallback
        });

        // Migrate existing data to new workflow
        DB::table('bookings')
            ->orderBy('id')
            ->chunk(500, function ($rows): void {
                foreach ($rows as $booking) {
                    $status = strtolower((string) $booking->status);
                    $paymentStatus = strtolower((string) ($booking->payment_status ?? 'unpaid'));

                    // Determine new booking_status
                    $newBookingStatus = $this->mapToNewStatus($status, $paymentStatus);

                    DB::table('bookings')
                        ->where('id', $booking->id)
                        ->update([
                            'booking_status' => $newBookingStatus,
                            'tour_date' => $booking->tour_date ?? ($booking->booked_for_date ?? null),
                            'tour_time' => $booking->tour_time ?? ($booking->booked_for_time ?? null),
                        ]);
                }
            });
    }

    private function mapToNewStatus(string $status, string $paymentStatus): string
    {
        if ($status === 'declined') {
            return 'declined';
        }
        if ($status === 'cancelled') {
            return 'cancelled';
        }
        if ($status === 'completed') {
            return 'completed';
        }
        if ($status === 'accepted') {
            return $paymentStatus === 'paid' ? 'paid' : 'schedule_confirmed';
        }
        if ($status === 'confirmed') {
            return $paymentStatus === 'paid' ? 'paid' : 'waiting_payment';
        }
        return 'pending';
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (Schema::hasColumn('bookings', 'conversation_id')) {
                $table->dropForeignKeyIfExists(['conversation_id']);
                $table->dropColumn('conversation_id');
            }
            if (Schema::hasColumn('bookings', 'tour_date')) {
                $table->dropColumn('tour_date');
            }
            if (Schema::hasColumn('bookings', 'tour_time')) {
                $table->dropColumn('tour_time');
            }
            if (Schema::hasColumn('bookings', 'schedule_confirmed_at')) {
                $table->dropColumn('schedule_confirmed_at');
            }
        });
    }
};
