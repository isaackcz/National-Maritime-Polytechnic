<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\{
    User,
    EducationalAttainment,
    GeneralInformation,
    LatestSBExp,
    TrainingRegFile,
    Contact
};

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('additional_trainee_information', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->id();
            $table->foreignIdFor(User::class)->constrained()->onDelete('cascade');
            $table->foreignIdFor(EducationalAttainment::class)->constrained()->onDelete('cascade');
            $table->foreignIdFor(GeneralInformation::class)->constrained()->onDelete('cascade');
            $table->foreignIdFor(LatestSBExp::class)->constrained()->onDelete('cascade');
            $table->foreignIdFor(TrainingRegFile::class)->constrained()->onDelete('cascade');
            $table->foreignIdFor(Contact::class)->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('additional_trainee_information');
    }
};
