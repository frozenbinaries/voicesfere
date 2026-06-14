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
        Schema::create('ballots', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('election_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('display_order')->nullable();
            $table->integer('max_selections')->default(1);
            $table->integer('min_selections')->default(1);
            $table->boolean('is_active')->default(true);
            $table->boolean('randomize_options')->default(false);
            $table->enum('type', ['single_choice','multiple_choice', 'ranked_choice', 'rating', 'text'])->default('single_choice');
            $table->timestamps();

            $table->foreign('election_id')->references('id')->on('elections')->onDelete('cascade');
            $table->unique(['election_id', 'title']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ballots');
    }
};
