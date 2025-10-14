<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\EnrolledCourse;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('enrollment_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(EnrolledCourse::class)->ondelete('cascade');
            $table->string('invoice_course');
            $table->decimal('invoice_amount', 10, 2)->default(0.00);
            $table->enum('invoice_status', ['PENDING', 'PAID', 'CANCELLED'])->default('PENDING');
            $table->string('invoice_reference')->unique();
            $table->dateTime('invoice_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollment_invoices');
    }
};
