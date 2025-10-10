<?php

namespace App\Http\Controllers\Authenticated\Trainee;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class TraineeCertificate extends Controller
{
    public function get_trainee_certificate(Request $request){
        try {
            $received_certificates = User::with([
                'trainee_enrolled_courses.enrolled_course',
                'trainee_enrolled_courses.enrolled_course_certificate',
                'trainee_enrolled_courses.enrolled_course_certificate.enrolled_course_certificates'
            ])->where('id', $request->user()->id)->get();

            return response()->json(['received_certificates' => $received_certificates]);
        } catch (\Exception $e) {
            return response()->json(["error" => $e->getMessage()], 500);
        }
    }
}
