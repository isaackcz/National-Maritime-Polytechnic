<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\{
    MainCourse,
    CourseModule,
    TrainingFee
};

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('trainings', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(MainCourse::class)->onDelete('CASCADE');
            $table->foreignIdFor(CourseModule::class)->onDelete('CASCADE');
            $table->foreignIdFor(TrainingFee::class)->onDelete('CASCADE');
            $table->foreignIdFor(TrainingFee::class, 'training_assessment_fee_id')->onDelete('CASCADE');
            $table->integer('batch_number');
            $table->integer('daily_hours');
            $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trainings');
    }
};
