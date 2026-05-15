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
        Schema::create('tour_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tourist_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('selected_guide_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->text('description');
            $table->string('province')->nullable();
            $table->string('city')->nullable();
            $table->decimal('budget_min', 10, 2)->nullable();
            $table->decimal('budget_max', 10, 2)->nullable();
            $table->string('duration_label')->nullable();
            $table->string('travelers_label')->nullable();
            $table->json('interests')->nullable();
            $table->enum('status', ['open', 'negotiating', 'closed', 'completed', 'cancelled'])->default('open');
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tourist_id', 'status']);
            $table->index(['selected_guide_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tour_requests');
    }
};
