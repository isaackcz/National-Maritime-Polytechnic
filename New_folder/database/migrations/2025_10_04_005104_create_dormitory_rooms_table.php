<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\User;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dormitory_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class)->ondelete('cascade');
            $table->string('room_name');
            $table->string('room_description');
            $table->decimal('room_cost', 10, 2)->default(0.00);
            $table->integer('room_slot');
            $table->enum('room_status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dormitory_rooms');
    }
};
