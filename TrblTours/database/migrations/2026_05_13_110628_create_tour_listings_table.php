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
        Schema::create('tour_listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guide_id')->constrained('users')->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->string('title');
            $table->text('short_description');
            $table->string('category')->nullable();
            $table->string('province')->nullable();
            $table->string('city')->nullable();
            $table->string('meeting_area')->nullable();
            $table->string('meeting_point')->nullable();
            $table->string('duration_label')->nullable();
            $table->unsignedSmallInteger('min_guests')->default(1);
            $table->unsignedSmallInteger('max_guests')->default(10);
            $table->decimal('price', 10, 2);
            $table->enum('price_type', ['per_person', 'per_group'])->default('per_person');
            $table->enum('reservation_type', ['instant', 'manual'])->default('instant');
            $table->boolean('free_cancellation')->default(true);
            $table->boolean('reserve_now_pay_later')->default(true);
            $table->string('languages')->nullable();
            $table->json('includes')->nullable();
            $table->text('excludes')->nullable();
            $table->text('requirements')->nullable();
            $table->text('safety_info')->nullable();
            $table->string('difficulty')->nullable();
            $table->json('tags')->nullable();
            $table->string('weather_suitability')->nullable();
            $table->string('best_season')->nullable();
            $table->boolean('child_friendly')->default(false);
            $table->boolean('pet_friendly')->default(false);
            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->unsignedInteger('reviews_count')->default(0);
            $table->enum('status', ['draft', 'published', 'paused'])->default('draft');
            $table->string('cover_image_path')->nullable();
            $table->json('gallery_paths')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['guide_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tour_listings');
    }
};
