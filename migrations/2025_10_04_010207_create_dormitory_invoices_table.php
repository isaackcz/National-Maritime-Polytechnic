<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\{DormitoryTenant, DormitoryRoom};
 
return new class extends Migration
{
    /**
     * Run the migrations.
     */ 
    public function up(): void
    {
        Schema::create('dormitory_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(DormitoryTenant::class)->ondelete('cascade');
            $table->foreignIdFor(DormitoryRoom::class)->ondelete('cascade');
            $table->enum('invoice_status', ['PENDING', 'PAID', 'CANCELLED', 'TERMINATED'])->default('PENDING');
            $table->longText('invoice_receipt');
            $table->dateTime('invoice_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dormitory_invoices');
    }
};
