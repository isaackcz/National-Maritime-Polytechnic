<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\MainCourse;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('course_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(MainCourse::class)->onDelete('cascade');
            $table->dateTime('course_schedule_from');
            $table->dateTime('course_schedule_to');
            $table->integer('course_batch');
            $table->integer('course_schedule_slot')->default(0);
            $table->string('course_venue');
            $table->string('course_room');
            $table->decimal('course_fee', 10, 2);
            $table->enum('course_schedule_preference', ['FACE-TO-FACE', 'ONLINE']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_schedules');
    }
};
