<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('bookings')
            ->whereNull('booked_for_date')
            ->whereNotNull('created_at')
            ->orderBy('id')
            ->chunk(500, function ($rows): void {
                foreach ($rows as $row) {
                    $createdAt = $row->created_at;
                    if (!$createdAt) {
                        continue;
                    }

                    $dateValue = Carbon::parse((string) $createdAt)->toDateString();
                    DB::table('bookings')
                        ->where('id', $row->id)
                        ->whereNull('booked_for_date')
                        ->update([
                            'booked_for_date' => $dateValue,
                        ]);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Intentionally left empty to avoid overwriting potentially valid data.
    }
};
