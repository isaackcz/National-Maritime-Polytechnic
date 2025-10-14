<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Carbon\Carbon;

class UserAccountsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Trainee User
        $trainee_user = new User;
        $trainee_user->fname = "Maria";
        $trainee_user->mname = "Santos";
        $trainee_user->lname = "Garcia";
        $trainee_user->suffix = "";
        $trainee_user->email = "maria.garcia@trainee.com";
        $trainee_user->email_verified_at = Carbon::now();
        $trainee_user->birthdate = Carbon::parse('1995-03-15');
        $trainee_user->role = "TRAINEE";
        $trainee_user->password = bcrypt("trainee123");
        $trainee_user->profile_picture = "default-avatar.png";
        $trainee_user->save();

        // Create Dormitory Admin User
        $dormitory_admin = new User;
        $dormitory_admin->fname = "Juan";
        $dormitory_admin->mname = "Miguel";
        $dormitory_admin->lname = "Rodriguez";
        $dormitory_admin->suffix = "Jr.";
        $dormitory_admin->email = "juan.rodriguez@admin.com";
        $dormitory_admin->email_verified_at = Carbon::now();
        $dormitory_admin->birthdate = Carbon::parse('1988-07-22');
        $dormitory_admin->role = "ADMIN-DORMITORY";
        $dormitory_admin->password = bcrypt("admin123");
        $dormitory_admin->profile_picture = "default-avatar.png";
        $dormitory_admin->save();

        $this->command->info('Trainee and Dormitory Admin users created successfully!');
        $this->command->info('Trainee Email: maria.garcia@trainee.com | Password: trainee123');
        $this->command->info('Dormitory Admin Email: juan.rodriguez@admin.com | Password: admin123');
    }
}
