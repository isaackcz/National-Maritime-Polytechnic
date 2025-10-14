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
        Schema::create('course_modules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('acronym');
            $table->integer('no_of_days');
            $table->integer('hours');
            $table->integer('fee');
            $table->longText('venue');
            $table->string('section');
            $table->integer('slots');
            $table->longText('certificate_series');
            $table->longText('compendium');
            $table->longText('assessment_fee');
            $table->enum('status', ['ACTIVE', 'INACTIVE']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_modules');
    }
};
