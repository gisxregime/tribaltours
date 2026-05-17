<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
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
            if (!Schema::hasColumn('bookings', 'tour_start_date')) {
                $table->dateTime('tour_start_date')->nullable()->after('booked_for_time');
            }
            if (!Schema::hasColumn('bookings', 'confirmed_booking_date')) {
                $table->dateTime('confirmed_booking_date')->nullable()->after('tour_start_date');
            }
            if (!Schema::hasColumn('bookings', 'payment_received_at')) {
                $table->dateTime('payment_received_at')->nullable()->after('payment_reference');
            }
            if (!Schema::hasColumn('bookings', 'booking_status')) {
                $table->enum('booking_status', ['payment_pending', 'date_pending', 'date_confirmed', 'completed'])
                    ->default('payment_pending')
                    ->after('payment_status');
            }
        });

        DB::table('bookings')
            ->orderBy('id')
            ->chunk(500, function ($rows): void {
                foreach ($rows as $row) {
                    $bookedDate = $row->booked_for_date ? Carbon::parse((string) $row->booked_for_date) : null;
                    $bookedTime = trim((string) ($row->booked_for_time ?? ''));

                    $tourStartDate = null;
                    if ($bookedDate) {
                        $tourStartDate = $bookedDate->copy()->startOfDay();
                        if ($bookedTime !== '') {
                            try {
                                $time = Carbon::parse($bookedTime);
                                $tourStartDate->setTime((int) $time->format('H'), (int) $time->format('i'), (int) $time->format('s'));
                            } catch (\Throwable $_error) {
                                $tourStartDate->endOfDay();
                            }
                        }
                    }

                    $paidAt = $row->payment_received_at ?? $row->paid_at ?? null;
                    $isPaid = strtolower((string) ($row->payment_status ?? '')) === 'paid';
                    $isCompleted = strtolower((string) ($row->status ?? '')) === 'completed';
                    $hasConfirmedDate = $tourStartDate !== null;

                    $bookingStatus = 'payment_pending';
                    if ($isPaid && !$hasConfirmedDate) {
                        $bookingStatus = 'date_pending';
                    }
                    if ($isPaid && $hasConfirmedDate) {
                        $bookingStatus = 'date_confirmed';
                    }
                    if ($isCompleted) {
                        $bookingStatus = 'completed';
                    }

                    DB::table('bookings')
                        ->where('id', $row->id)
                        ->update([
                            'tour_start_date' => $row->tour_start_date ?? ($tourStartDate ? $tourStartDate->toDateTimeString() : null),
                            'confirmed_booking_date' => $row->confirmed_booking_date ?? ($tourStartDate ? $tourStartDate->toDateTimeString() : null),
                            'payment_received_at' => $paidAt,
                            'booking_status' => $bookingStatus,
                        ]);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (Schema::hasColumn('bookings', 'booking_status')) {
                $table->dropColumn('booking_status');
            }
            if (Schema::hasColumn('bookings', 'payment_received_at')) {
                $table->dropColumn('payment_received_at');
            }
            if (Schema::hasColumn('bookings', 'confirmed_booking_date')) {
                $table->dropColumn('confirmed_booking_date');
            }
            if (Schema::hasColumn('bookings', 'tour_start_date')) {
                $table->dropColumn('tour_start_date');
            }
        });
    }
};
