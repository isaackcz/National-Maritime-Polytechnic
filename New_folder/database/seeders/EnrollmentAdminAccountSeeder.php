<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Carbon\Carbon;

class EnrollmentAdminAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $enrollment_admin_account = new User;
        $enrollment_admin_account->fname = "John Bryan";
        $enrollment_admin_account->mname = "Argota";
        $enrollment_admin_account->lname = "Javellana";
        $enrollment_admin_account->email = "johnbryanjavellana@gmail.com";
        $enrollment_admin_account->email_verified_at = Carbon::now();
        $enrollment_admin_account->birthdate = Carbon::parse('07-11-2002');
        $enrollment_admin_account->role = "ADMIN-ENROLLMENT";
        $enrollment_admin_account->password = bcrypt("123456");
        $enrollment_admin_account->save();
    }
}
