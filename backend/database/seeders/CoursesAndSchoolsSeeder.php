<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MainCourse;
use App\Models\MainSchool;

class CoursesAndSchoolsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample courses data
        $courses = [
            ['course_name' => 'Bachelor of Science in Marine Engineering', 'course_status' => 'ACTIVE'],
            ['course_name' => 'Bachelor of Science in Marine Transportation', 'course_status' => 'ACTIVE'],
            ['course_name' => 'Bachelor of Science in Naval Architecture', 'course_status' => 'ACTIVE'],
            ['course_name' => 'Bachelor of Science in Fisheries', 'course_status' => 'ACTIVE'],
            ['course_name' => 'Bachelor of Science in Maritime Technology', 'course_status' => 'ACTIVE'],
            ['course_name' => 'Bachelor of Science in Ocean Engineering', 'course_status' => 'ACTIVE'],
            ['course_name' => 'Bachelor of Science in Marine Biology', 'course_status' => 'ACTIVE'],
            ['course_name' => 'Bachelor of Science in Marine Environmental Science', 'course_status' => 'ACTIVE'],
            ['course_name' => 'Bachelor of Science in Marine Surveying', 'course_status' => 'ACTIVE'],
            ['course_name' => 'Bachelor of Science in Port Management', 'course_status' => 'ACTIVE'],
            ['course_name' => 'Bachelor of Science in Logistics and Supply Chain Management', 'course_status' => 'ACTIVE'],
            ['course_name' => 'Bachelor of Science in Maritime Business', 'course_status' => 'ACTIVE'],
            ['course_name' => 'Bachelor of Science in Marine Electronics', 'course_status' => 'ACTIVE'],
            ['course_name' => 'Bachelor of Science in Marine Communication', 'course_status' => 'ACTIVE'],
            ['course_name' => 'Bachelor of Science in Marine Safety', 'course_status' => 'ACTIVE']
        ];

        foreach ($courses as $course) {
            MainCourse::create($course);
        }

        // Sample schools data
        $schools = [
            [
                'school_name' => 'Philippine Merchant Marine Academy',
                'school_address' => 'San Narciso, Zambales, Philippines',
                'school_status' => 'ACTIVE'
            ],
            [
                'school_name' => 'John B. Lacson Foundation Maritime University',
                'school_address' => 'Arevalo, Iloilo City, Philippines',
                'school_status' => 'ACTIVE'
            ],
            [
                'school_name' => 'Maritime Academy of Asia and the Pacific',
                'school_address' => 'Kamaya Point, Limay, Bataan, Philippines',
                'school_status' => 'ACTIVE'
            ],
            [
                'school_name' => 'University of Cebu - Maritime Education and Training Center',
                'school_address' => 'Sanciangko St, Cebu City, Philippines',
                'school_status' => 'ACTIVE'
            ],
            [
                'school_name' => 'Manila Central University - Maritime Academy',
                'school_address' => 'Sampaloc, Manila, Philippines',
                'school_status' => 'ACTIVE'
            ],
            [
                'school_name' => 'Philippine State College of Aeronautics',
                'school_address' => 'Piccio Garden, Villamor Air Base, Pasay City, Philippines',
                'school_status' => 'ACTIVE'
            ],
            [
                'school_name' => 'University of the Philippines - Marine Science Institute',
                'school_address' => 'Velasquez St, Diliman, Quezon City, Philippines',
                'school_status' => 'ACTIVE'
            ],
            [
                'school_name' => 'De La Salle University - Maritime Studies',
                'school_address' => 'Taft Avenue, Manila, Philippines',
                'school_status' => 'ACTIVE'
            ],
            [
                'school_name' => 'Ateneo de Manila University - Environmental Science',
                'school_address' => 'Loyola Heights, Quezon City, Philippines',
                'school_status' => 'ACTIVE'
            ],
            [
                'school_name' => 'University of San Carlos - Maritime Studies',
                'school_address' => 'P. del Rosario St, Cebu City, Philippines',
                'school_status' => 'ACTIVE'
            ],
            [
                'school_name' => 'Cebu Institute of Technology - Maritime',
                'school_address' => 'N. Bacalso Ave, Cebu City, Philippines',
                'school_status' => 'ACTIVE'
            ],
            [
                'school_name' => 'FEATI University - Maritime Engineering',
                'school_address' => 'Helios St, Santa Cruz, Manila, Philippines',
                'school_status' => 'ACTIVE'
            ],
            [
                'school_name' => 'Pamantasan ng Lungsod ng Maynila - Maritime',
                'school_address' => 'Intramuros, Manila, Philippines',
                'school_status' => 'ACTIVE'
            ],
            [
                'school_name' => 'Technological Institute of the Philippines - Maritime',
                'school_address' => '938 Aurora Blvd, Cubao, Quezon City, Philippines',
                'school_status' => 'ACTIVE'
            ],
            [
                'school_name' => 'Lyceum of the Philippines University - Maritime',
                'school_address' => 'Muralla St, Intramuros, Manila, Philippines',
                'school_status' => 'ACTIVE'
            ]
        ];

        foreach ($schools as $school) {
            MainSchool::create($school);
        }
    }
}
