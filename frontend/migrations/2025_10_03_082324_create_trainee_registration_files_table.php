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
        Schema::create('trainee_registration_files', function (Blueprint $table) {
            $table->id();
            $table->longText('file_e_signature');
            $table->longText('file_id_picture');
            $table->longText('file_srn_number');
            $table->longText('file_last_embarkment')->nullable();
            $table->longText('file_marina_license')->nullable();
            $table->longText('file_sea_service');
            $table->timestamps();
        });
    } 

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trainee_registration_files');
    }
};
