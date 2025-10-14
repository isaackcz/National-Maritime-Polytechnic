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
        Schema::create('general_information', function (Blueprint $table) {
            $table->id();
            $table->enum('gen_info_status', ['NEW', 'RETURNEE']);
            $table->string('gen_info_trainee_id');
            $table->string('gen_info_srn');
            $table->enum('gen_info_gender', ['MALE', 'FEMALE']);
            $table->string('gen_info_citizenship');
            $table->enum('gen_info_civil_status', ['SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED', 'SEPARATED']);
            $table->string('gen_info_house_no');
            $table->string('gen_info_region');
            $table->string('gen_info_province');
            $table->string('gen_info_municipality');
            $table->string('gen_info_barangay');
            $table->string('gen_info_birthplace_region');
            $table->string('gen_info_birthplace_province');
            $table->string('gen_info_birthplace_municipality');
            $table->string('gen_info_birthplace_barangay');
            $table->string('gen_info_postal');
            $table->string('gen_info_number_one');
            $table->string('gen_info_number_two');
            $table->string('gen_info_landline')->nullable();
            $table->string('gen_info_email');
            $table->string('gen_info_facebook');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('general_information');
    }
};
