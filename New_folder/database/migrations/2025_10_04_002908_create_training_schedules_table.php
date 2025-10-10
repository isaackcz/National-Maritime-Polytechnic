<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Training;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('training_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Training::class)->onDelete('cascade');
            $table->dateTime('training_schedule_from');
            $table->dateTime('training_schedule_to');
            $table->integer('training_schedule_slot')->default(0);
            $table->string('training_venue');
            $table->string('training_room');
            $table->enum('training_schedule_preference', ['ONSITE', 'ASYNCHRONOUS']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_schedules');
    }
};
