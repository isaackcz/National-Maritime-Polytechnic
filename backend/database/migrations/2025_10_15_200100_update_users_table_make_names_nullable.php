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
        Schema::table('users', function (Blueprint $table) {
            $table->string('fname')->nullable()->change();
            $table->string('lname')->nullable()->change();
            $table->string('mname')->nullable()->change();
            $table->string('suffix')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('fname')->nullable(false)->change();
            $table->string('lname')->nullable(false)->change();
            $table->string('mname')->nullable(false)->change();
            $table->string('suffix')->nullable(false)->change();
        });
    }
};
