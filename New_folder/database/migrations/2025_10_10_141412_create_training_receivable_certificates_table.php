<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\{
    Training,
    MainCertificate
};

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('training_receivable_certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Training::class)->onDelete('CASCADE');
            $table->foreignIdFor(MainCertificate::class)->onDelete('CASCADE');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_receivable_certificates');
    }
};
