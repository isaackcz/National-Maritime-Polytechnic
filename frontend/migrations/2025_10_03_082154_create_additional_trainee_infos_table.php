<?php

use Illuminate\Database\Migrations\Migration;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\{
    User,
    ContactPerson,
    EducationalAttainment,
    GeneralInformation,
    LatestShipboardExperience,
    TraineeRegistrationFile
};

return new class extends Migration
{
    /**
     * Run the migrations.S
     */
    public function up(): void
    {
        Schema::create('additional_trainee_infos', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class)->onDelete('cascade');
            $table->foreignIdFor(ContactPerson::class)->onDelete('cascade');
            $table->foreignIdFor(EducationalAttainment::class)->onDelete('cascade');
            $table->foreignIdFor(GeneralInformation::class)->onDelete('cascade');
            $table->foreignIdFor(LatestShipboardExperience::class)->onDelete('cascade');
            $table->foreignIdFor(TraineeRegistrationFile::class)->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('additional_trainee_infos');
    }
};
