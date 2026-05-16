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
            $table->string('traveler_full_name', 150)->nullable()->after('notes');
            $table->string('traveler_email', 190)->nullable()->after('traveler_full_name');
            $table->string('traveler_phone', 60)->nullable()->after('traveler_email');
            $table->string('traveler_emergency_contact', 150)->nullable()->after('traveler_phone');
        });

        DB::table('bookings')
            ->select(['id', 'tourist_id', 'traveler_full_name', 'traveler_email', 'traveler_phone'])
            ->orderBy('id')
            ->chunkById(200, function ($rows): void {
                $touristIds = collect($rows)
                    ->pluck('tourist_id')
                    ->filter()
                    ->unique()
                    ->values();

                if ($touristIds->isEmpty()) {
                    return;
                }

                $tourists = DB::table('users')
                    ->whereIn('id', $touristIds)
                    ->select(['id', 'name', 'email', 'phone'])
                    ->get()
                    ->keyBy('id');

                foreach ($rows as $row) {
                    $tourist = $tourists->get($row->tourist_id);
                    if (!$tourist) {
                        continue;
                    }

                    $updates = [];
                    if (trim((string) $row->traveler_full_name) === '') {
                        $updates['traveler_full_name'] = trim((string) ($tourist->name ?? ''));
                    }
                    if (trim((string) $row->traveler_email) === '') {
                        $updates['traveler_email'] = trim((string) ($tourist->email ?? ''));
                    }
                    if (trim((string) $row->traveler_phone) === '') {
                        $updates['traveler_phone'] = trim((string) ($tourist->phone ?? ''));
                    }

                    if (!empty($updates)) {
                        DB::table('bookings')
                            ->where('id', $row->id)
                            ->update($updates);
                    }
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'traveler_full_name',
                'traveler_email',
                'traveler_phone',
                'traveler_emergency_contact',
            ]);
        });
    }
};
