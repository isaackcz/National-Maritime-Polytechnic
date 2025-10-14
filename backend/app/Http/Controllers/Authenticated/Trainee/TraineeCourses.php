<?php

namespace App\Http\Controllers\Authenticated\Trainee;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\{
    User,
    MainCourse
};

class TraineeCourses extends Controller
{
    public function get_all_courses(Request $request) {
        try {
            $courses = MainCourse::where('course_status', 'ACTIVE')->get();
            return response()->json(['courses' => $courses]);
        } catch (\Exception $e) {
            return response()->json(["error" => $e->getMessage()], 500);
        }   
    }

    public function get_trainee_courses(Request $request) {
        try {
            $enrolled_courses = User::with([
                'trainee_enrolled_courses', 
                'trainee_enrolled_courses.main_course'
            ])->where('id', $request->user()->id)->get();
            
            return response()->json(['enrolled_courses' => $enrolled_courses]);
        } catch (\Exception $e) {
            return response()->json(["error" => $e->getMessage()], 500);
        }
    }
}
