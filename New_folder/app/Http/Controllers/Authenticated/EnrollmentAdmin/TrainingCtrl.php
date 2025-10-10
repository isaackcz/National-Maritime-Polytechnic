<?php

namespace App\Http\Controllers\Authenticated\EnrollmentAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\{
    MainCourse,
    MainCertificate,
    CourseModule,
    TrainingSchedule,
    Training,
    TrainingFee,
    AuditTrail
};

class TrainingCtrl extends Controller
{
    public function trainings (Request $request) {
        $trainings = Training::withCount(['hasData'])->get();
        return response()->json(['trainings' => $trainings], 200);
    }

    public function remove_training (Request $request) {
        try {
            DB::beginTransaction();

            $this_course = Training::withCount(['hasData'])->where('id', $request->documentId)->first();
            if($this_course->has_data_count > 0) {
                return response()->json(['message' => "Can't remove course. It already has connected data."], 200);
            } else {
                $this_course->delete();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've removed course. ID# $request->document_id";
                $new_log->save();

                DB::commit();
                return response()->json(['message' => "You've removed course. ID# $request->document_id"], 200);
            }
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function get_cmtf (Request $request) {
        $modules = CourseModule::where('status', 'ACTIVE')->get();
        $courses = MainCourse::where('course_status', 'ACTIVE')->get();
        $trainingFees = TrainingFee::where('status', 'ACTIVE')->get();

        return response()->json([
            'modules' => $modules,
            'courses' => $courses,
            'trainingFees' => $trainingFees
        ], 200);
    }

    public function create_or_update_training (Request $request) {
        $validations = [
            'course' => 'required',
            'module' => 'required',
            'training_fee' => 'required',
            'assessment_fee' => 'required',
            'batch_number' => 'required|numeric',
            'daily_hours' => 'required|numeric',
            'schedule' => 'required|array'
        ];

        $validator = \Validator::make($request->all(), $validations);

        if($validator->fails()) {
            $errors = $validator->messages()->all();
            return response()->json(['message' => implode(', ', $errors)], 422);
        } else {
            try {
                DB::beginTransaction();

                $this_training = $request->httpMethod == "POST" 
                        ? new Training
                        : Training::find($request->documentId);

                $this_training->main_course_id = $request->course;
                $this_training->course_module_id = $request->module;
                $this_training->training_fee_id = $request->training_fee;
                $this_training->training_assessment_fee_id = $request->assessment_fee;
                $this_training->batch_number = $request->batch_number;
                $this_training->daily_hours = $request->daily_hours;
                if($request->httpMethod !== "POST") $this_training->status = $request->status;

                $this_training->save();

                foreach($request->schedule as $schedule) {
                    $this_training_schedule = $request->httpMethod == "POST" 
                        ? new TrainingSchedule
                        : TrainingSchedule::find($schedule['id']);

                    $this_training_schedule->training_id = $this_training->id;
                    $this_training_schedule->training_schedule_from = $schedule['from_date'];
                    $this_training_schedule->training_schedule_to = $schedule['to_date'];
                    $this_training_schedule->training_schedule_slot = $schedule['slot'];
                    $this_training_schedule->training_venue = $schedule['venue'];
                    $this_training_schedule->training_room = $schedule['room'];
                    $this_training_schedule->training_schedule_preference = $schedule['preference'];
                    $this_training_schedule->save();
                }

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a training. ID# " . $this_training->id;
                $new_log->save();

                DB::commit();
                return response()->json(['message' => "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a training. ID# " . $this_training->id], 200);
            } catch (\Exception $e) {
                DB::rollback();
                return response()->json(['message' => $e->getMessage()], 500);
            }
        }
    }

    /** modules */
    public function get_modules (Request $request) {
        $modules = CourseModule::withCount(['hasData'])->get();
        return response()->json(['modules' => $modules], 200);
    }

    public function create_or_update_module (Request $request) {
        $validations = [
            'name' => 'required|string',
            'short_name' => 'required|string',
            'certificate_series' => 'required|string',
            'compendium' => 'required|string'
        ];

        $validator = \Validator::make($request->all(), $validations);

        if($validator->fails()) {
            $errors = $validator->messages()->all();
            return response()->json(['message' => implode(', ', $errors)], 422);
        } else {
            try {
                DB::beginTransaction();

                $this_module = $request->httpMethod == "POST" 
                        ? new CourseModule
                        : CourseModule::find($request->documentId);

                $this_module->name = $request->name;
                $this_module->acronym = $request->short_name;
                $this_module->certificate_series = $request->certificate_series;
                $this_module->compendium = $request->compendium;
                if($request->httpMethod !== "POST") $this_module->status = $request->status;

                $this_module->save();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a module. ID# " . $this_module->id;
                $new_log->save();

                DB::commit();
                return response()->json(['message' => "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a module. ID# " . $this_module->id], 201);
            } catch (\Exception $e) {
                DB::rollback();
                return response()->json(['message' => $e->getMessage()], 500);
            }
        }
    }

    public function remove_module (Request $request) {
        try {
            DB::beginTransaction();

            $this_module = CourseModule::withCount(['hasData'])->where('id', $request->documentId)->first();
            if($this_module->has_data_count > 0) {
                return response()->json(['message' => "Can't remove module. It already has connected data."], 200);
            } else {
                $this_module->delete();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've removed module. ID# $request->documentId";
                $new_log->save();

                DB::commit();
                return response()->json(['message' => "You've removed course. ID# $request->documentId"], 200);
            }
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /** courses */
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
                DB::beginTransaction();

                $this_course = $request->httpMethod == "POST" 
                        ? new MainCourse
                        : MainCourse::find($request->documentId);

                $this_course->course_name = $request->name;
                if($request->httpMethod !== "POST") $this_course->course_status = $request->status;

                $this_course->save();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a course. ID# " . $this_course->id;
                $new_log->save();

                DB::commit();
                return response()->json(['message' => "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a course. ID# " . $this_course->id], 201);
            } catch (\Exception $e) {
                DB::rollback();
                return response()->json(['message' => $e->getMessage()], 500);
            }
        }
    }

    public function remove_course (Request $request) {
        try {
            DB::beginTransaction();

            $this_course = MainCourse::withCount(['hasData'])->where('id', $request->documentId)->first();
            if($this_course->has_data_count > 0) {
                return response()->json(['message' => "Can't remove course. It already has connected data."], 200);
            } else {
                $this_course->delete();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've removed course. ID# $request->documentId";
                $new_log->save();

                DB::commit();
                return response()->json(['message' => "You've removed course. ID# $request->documentId"], 200);
            }
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /** training fees */
    public function get_training_fees (Request $request) {
        $training_fees = TrainingFee::withCount(['hasData'])->get();
        return response()->json(['training_fees' => $training_fees], 200);
    }

    public function create_or_update_training_fee (Request $request) {
        $validations = [
            'name' => 'required|string',
            'amount' => 'required|numeric',
            'category' => 'required|string'
        ];

        $validator = \Validator::make($request->all(), $validations);

        if($validator->fails()) {
            $errors = $validator->messages()->all();
            return response()->json(['message' => implode(', ', $errors)], 422);
        } else {
            try {
                DB::beginTransaction();

                $this_training_fee = $request->httpMethod == "POST" 
                        ? new TrainingFee
                        : TrainingFee::find($request->documentId);

                $this_training_fee->name = $request->name;
                $this_training_fee->amount = $request->amount;
                $this_training_fee->category = $request->category;
                if($request->httpMethod !== "POST") $this_training_fee->status = $request->status;

                $this_training_fee->save();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a training fee. ID# " . $this_training_fee->id;
                $new_log->save();

                DB::commit();
                return response()->json(['message' => "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a training fee. ID# " . $this_training_fee->id], 201);
            } catch (\Exception $e) {
                DB::rollback();
                return response()->json(['message' => $e->getMessage()], 500);
            }
        }
    }

    public function remove_training_fee (Request $request) {
        try {
            DB::beginTransaction();

            $this_course = TrainingFee::withCount(['hasData'])->where('id', $request->documentId)->first();
            if($this_course->has_data_count > 0) {
                return response()->json(['message' => "Can't remove training fee. It already has connected data."], 200);
            } else {
                $this_course->delete();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've removed training fee. ID# $request->documentId";
                $new_log->save();

                DB::commit();
                return response()->json(['message' => "You've removed training fee. ID# $request->documentId"], 200);
            }
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /** certificates */
    public function get_certificates (Request $request) {
        $certificates = MainCertificate::withCount(['hasData'])->get();
        return response()->json(['certificates' => $certificates], 200);
    }

    public function create_or_update_certificate (Request $request) {
        $validations = [
            'header' => 'required|string',
            'header_1' => 'required|string',
            'header_2' => 'required|string',
            'body' => 'required|string'
        ];

        $validator = \Validator::make($request->all(), $validations);

        if($validator->fails()) {
            $errors = $validator->messages()->all();
            return response()->json(['message' => implode(', ', $errors)], 422);
        } else {
            try {
                DB::beginTransaction();

                $this_certificate = $request->httpMethod == "POST" 
                        ? new MainCertificate
                        : MainCertificate::find($request->documentId);

                $this_certificate->header = $request->header;
                $this_certificate->header_1 = $request->header_1;
                $this_certificate->header_2 = $request->header_2;
                $this_certificate->body = $request->body;
                $this_certificate->save();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a certificate. ID# " . $this_certificate->id;
                $new_log->save();

                DB::commit();
                return response()->json(['message' => "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a certificate. ID# " . $this_certificate->id], 201);
            } catch (\Exception $e) {
                DB::rollback();
                return response()->json(['message' => $e->getMessage()], 500);
            }
        }
    }

    public function remove_certificate (Request $request) {
        try {
            DB::beginTransaction();

            $this_course = MainCertificate::withCount(['hasData'])->where('id', $request->documentId)->first();
            if($this_course->has_data_count > 0) {
                return response()->json(['message' => "Can't remove certificate. It already has connected data."], 200);
            } else {
                $this_course->delete();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've removed certificate. ID# $request->documentId";
                $new_log->save();

                DB::commit();
                return response()->json(['message' => "You've removed certificate. ID# $request->documentId"], 200);
            }
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
