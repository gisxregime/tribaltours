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
        Schema::create('tour_request_comments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('tour_request_id')->constrained('tour_requests')->cascadeOnDelete();
            $table->uuid('parent_comment_id')->nullable();
            $table->foreign('parent_comment_id')
                ->references('id')
                ->on('tour_request_comments')
                ->cascadeOnDelete();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('author_role', 20);
            $table->string('author_name', 120);
            $table->string('author_avatar_url')->nullable();
            $table->text('text');
            $table->decimal('offer_amount', 12, 2)->nullable();
            $table->timestamps();

            $table->index(['tour_request_id', 'created_at']);
            $table->index(['tour_request_id', 'parent_comment_id']);
            $table->index(['author_id', 'author_role']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tour_request_comments');
    }
};
