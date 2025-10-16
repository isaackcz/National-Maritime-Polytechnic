<?php

namespace App\Http\Controllers\Authenticated\Administrator;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\{
    MainCourse,
    MainSchool,
    AuditTrail
};

class Masterlist extends Controller
{
    /** school */
    public function get_schools (Request $request) {
        $schools = MainSchool::withCount(['hasData'])->get();
        return response()->json(['schools' => $schools], 200);
    }
    public function create_or_update_school (Request $request) {
        $validations = [
            'name' => 'required|string',
            'address' => 'required|string'
        ];

        $validator = \Validator::make($request->all(), $validations);

        if($validator->fails()) {
            $errors = $validator->messages()->all();
            return response()->json(['message' => implode(', ', $errors)], 422);
        } else {
            try {
                $this_school = $request->httpMethod == "POST" 
                        ? new MainSchool
                        : MainSchool::find($request->documentId);

                $this_school->school_name = $request->name;
                $this_school->school_address = $request->address;
                if($request->httpMethod !== "POST") $this_school->school_status = $request->status;

                $this_school->save();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a school. SCHOOLID# " . $this_school->id;
                $new_log->save();

                return response()->json(['message' => "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a school. SCHOOLID# " . $this_school->id], 201);
            } catch (\Exception $e) {
                return response()->json(['message' => $e->getMessage()], 500);
            }
        }
    }
    public function remove_school (Request $request, int $school_id) {
        try {
            $this_school = MainSchool::withCount(['hasData'])->where('id', $school_id)->first();
            if($this_school->has_data_count > 0) {
                return response()->json(['message' => "Can't remove school. It already has connected data."], 200);
            } else {
                $this_school->delete();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've removed school. SCHOOLID# $school_id";
                $new_log->save();

                return response()->json(['message' => "You've removed school. SCHOOLID# $school_id"], 200);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /** course */
    public function get_courses (Request $request) {
        $courses = MainCourse::withCount(['hasData'])->get();
        return response()->json(['courses' => $courses], 200);
    }
    public function create_or_update_course (Request $request) {
        $validations = ['name' => 'required|string'];
        $validator = \Validator::make($request->all(), $validations);

        if($validator->fails()) {
            $errors = $validator->messages()->all();
            return response()->json(['message' => implode(', ', $errors)], 422);
        } else {
            try {
                $this_course = $request->httpMethod == "POST" 
                        ? new MainCourse
                        : MainCourse::find($request->documentId);

                $this_course->course_name = $request->name;
                if($request->httpMethod !== "POST") $this_course->course_status = $request->status;

                $this_course->save();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a course. COURSEID# " . $this_course->id;
                $new_log->save();

                return response()->json(['message' => "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a course. COURSEID# " . $this_course->id], 201);
            } catch (\Exception $e) {
                return response()->json(['message' => $e->getMessage()], 500);
            }
        }
    }
    public function remove_course (Request $request, int $course_id) {
        try {
            $this_course = MainCourse::withCount(['hasData'])->where('id', $course_id)->first();
            if($this_course->has_data_count > 0) {
                return response()->json(['message' => "Can't remove course. It already has connected data."], 200);
            } else {
                $this_course->delete();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've removed course. COURSEID# $course_id";
                $new_log->save();

                return response()->json(['message' => "You've removed course. COURSEID# $course_id"], 200);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
