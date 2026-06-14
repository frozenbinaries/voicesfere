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
        Schema::create('options', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ballot_id');
            $table->string('title');
            $table->boolean('should_display_a_photo')->default(true);
            $table->string('photo_url')->nullable();
            $table->text('description')->nullable();
            $table->integer('display_order')->nullable();
            $table->timestamps();

            $table->foreign('ballot_id')->references('id')->on('ballots')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('options');
    }
};
