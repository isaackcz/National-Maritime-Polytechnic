<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\{DormitoryRoom, User};

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dormitory_tenants', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(DormitoryRoom::class)->ondelete('cascade');
            $table->foreignIdFor(User::class)->ondelete('cascade');
            $table->date('tenant_from_date')->nullable();
            $table->date('tenant_to_date')->nullable();
            $table->enum('tenant_status', ['PENDING', 'TERMINATED', 'APPROVED', 'CANCELLED', 'EXTENDING'])->default('PENDING');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dormitory_tenants');
    }
};
