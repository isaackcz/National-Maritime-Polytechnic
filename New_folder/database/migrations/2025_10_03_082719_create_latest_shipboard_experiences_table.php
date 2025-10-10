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
        Schema::create('latest_shipboard_experiences', function (Blueprint $table) {
            $table->id();
            $table->string('ship_status')->nullable();
            $table->string('ship_license')->nullable();
            $table->string('ship_rank')->nullable();
            $table->string('ship_date_of_disembarkment')->nullable();
            $table->string('ship_principal')->nullable();
            $table->string('ship_manning')->nullable();
            $table->string('ship_landline')->nullable();
            $table->string('ship_number')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('latest_shipboard_experiences');
    }
};
