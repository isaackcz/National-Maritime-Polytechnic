<?php

namespace App\Http\Controllers\Authenticated\Administrator;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use App\Models\{
    MainCertificate,
    CourseModule,
    TrainingSchedule,
    Training,
    TrainingFee,
    AuditTrail,
    TrainingReceivableCertificate,
    Requirement,
    TrainingRequirement
};

class TrainingCtrl extends Controller
{
    public function trainings (Request $request) {
        $trainings = Training::withCount(['hasData'])->with(['module'])->get();
        return response()->json(['trainings' => $trainings], 200);
    }

    public function remove_training (Request $request, int $training_id) {
        try {
            $this_course = Training::withCount(['hasData'])->where('id', $training_id)->first();
            if($this_course->has_data_count > 0) {
                return response()->json(['message' => "Can't remove course. It already has connected data."], 200);
            } else {
                $this_course->delete();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've removed course. ID# $training_id";
                $new_log->save();

                return response()->json(['message' => "You've removed course. ID# $training_id"], 200);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function get_cmtfc (Request $request) {
        $modules = CourseModule::where('status', 'ACTIVE')->get();
        $trainingFees = TrainingFee::where('status', 'ACTIVE')->get();
        $certificates = MainCertificate::all();
        $requirements = Requirement::where('status', 'ACTIVE')->get();

        return response()->json([
            'modules' => $modules,
            'trainingFees' => $trainingFees,
            'certificates' => $certificates,
            'requirements' => $requirements
        ], 200);
    }

    public function create_or_update_training (Request $request) {
        $validations = [
            'module' => 'required',
            'training_fee' => 'required',
            'assessment_fee' => 'required',
            'batch_number' => 'required|numeric',
            'daily_hours' => 'required|numeric',
            'schedule' => 'required|array',
            'receivable_certificate' => 'required|array',
            'training_requirements' => 'required|array',
        ];

        $validator = \Validator::make($request->all(), $validations);

        if($validator->fails()) {
            $errors = $validator->messages()->all();
            return response()->json(['message' => implode(', ', $errors)], 422);
        } else {
            try {
                $this_training = $request->httpMethod == "POST" 
                    ? new Training
                    : Training::find($request->documentId);

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

                TrainingReceivableCertificate::where(['training_id', $this_training->id])->truncate();
                foreach($request->receivable_certificate as $rc) {
                    $this_training_rc = new TrainingReceivableCertificate;
                    $this_training_rc->training_id = $this_training->id;
                    $this_training_rc->main_certificate_id = $rc;
                    $this_training_rc->save();
                }

                TrainingRequirement::where(['training_id', $this_training->id])->truncate();
                foreach($request->training_requirements as $tr) {
                    $this_training_tr = new TrainingRequirement;
                    $this_training_tr->training_id = $this_training->id;
                    $this_training_tr->requirement_id = $tr;
                    $this_training_tr->save();
                }

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a training. ID# " . $this_training->id;
                $new_log->save();

                return response()->json(['message' => "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a training. ID# " . $this_training->id], 200);
            } catch (\Exception $e) {
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
            'compendium' => 'required|string'
        ];

        if($request->httpMethod == "POST") {
            $validations['moduleFile'] = 'required';
        }

        $validator = \Validator::make($request->all(), $validations);

        if($validator->fails()) {
            $errors = $validator->messages()->all();
            return response()->json(['message' => implode(', ', $errors)], 422);
        } else {
            try {
                $this_module = $request->httpMethod == "POST" 
                        ? new CourseModule
                        : CourseModule::find($request->documentId);

                $this_module->name = $request->name;
                $this_module->acronym = $request->short_name;
                $this_module->compendium = $request->compendium;
                if($request->httpMethod !== "POST") $this_module->status = $request->status;

                if($request->hasFile('moduleFile')) {
                    if(($request->moduleFile !== $this_module->file)) {
                        if(file_exists(public_path('module-images/' . $this_module->file))){
                            unlink(public_path('module-images/' . $this_module->file));
                        }
                    }

                    $file_name = Str::uuid() . '.pdf';
                    $module_file = $request->file('moduleFile');
                    $module_file->move(public_path('module-file'), $file_name);
                    $this_module->file = $file_name;
                }

                $this_module->save();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a module. ID# " . $this_module->id;
                $new_log->save();

                return response()->json(['message' => "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a module. ID# " . $this_module->id], 201);
            } catch (\Exception $e) {
                return response()->json(['message' => $e->getMessage()], 500);
            }
        }
    }

    public function remove_module (Request $request, int $module_id) {
        try {
            $this_module = CourseModule::withCount(['hasData'])->where('id', $module_id)->first();
            if($this_module->has_data_count > 0) {
                return response()->json(['message' => "Can't remove module. It already has connected data."], 200);
            } else {
                if(file_exists(public_path('module-file/' . $this_module->file))){
                    unlink(public_path('module-file/' . $this_module->file));
                }

                $this_module->delete();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've removed module. ID# $module_id";
                $new_log->save();

                return response()->json(['message' => "You've removed course. ID# $module_id"], 200);
            }
        } catch (\Exception $e) {
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

                return response()->json(['message' => "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a training fee. ID# " . $this_training_fee->id], 201);
            } catch (\Exception $e) {
                return response()->json(['message' => $e->getMessage()], 500);
            }
        }
    }

    public function remove_training_fee (Request $request, int $fee_id) {
        try {
            $this_course = TrainingFee::withCount(['hasData'])->where('id', $fee_id)->first();
            if($this_course->has_data_count > 0) {
                return response()->json(['message' => "Can't remove training fee. It already has connected data."], 200);
            } else {
                $this_course->delete();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've removed training fee. ID# $fee_id";
                $new_log->save();

                return response()->json(['message' => "You've removed training fee. ID# $fee_id"], 200);
            }
        } catch (\Exception $e) {
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
            'name' => 'required|string',
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
                $this_certificate = $request->httpMethod == "POST" 
                        ? new MainCertificate
                        : MainCertificate::find($request->documentId);

                $this_certificate->name = $request->name;
                $this_certificate->header = $request->header;
                $this_certificate->header_1 = $request->header_1;
                $this_certificate->header_2 = $request->header_2;
                $this_certificate->body = $request->body;
                $this_certificate->save();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a certificate. ID# " . $this_certificate->id;
                $new_log->save();

                return response()->json(['message' => "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a certificate. ID# " . $this_certificate->id], 201);
            } catch (\Exception $e) {
                return response()->json(['message' => $e->getMessage()], 500);
            }
        }
    }

    public function remove_certificate (Request $request, int $certificate_id) {
        try {
            $this_course = MainCertificate::withCount(['hasData'])->where('id', $certificate_id)->first();
            if($this_course->has_data_count > 0) {
                return response()->json(['message' => "Can't remove certificate. It already has connected data."], 200);
            } else {
                $this_course->delete();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've removed certificate. ID# $certificate_id";
                $new_log->save();

                return response()->json(['message' => "You've removed certificate. ID# $certificate_id"], 200);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /** requirements */
    public function get_requirements (Request $request) {
        $requirements = Requirement::withCount(['hasData'])->get();
        return response()->json(['requirements' => $requirements], 200);
    }

    public function create_or_update_requirement (Request $request) {
        $validations = [
            'name' => 'required|string',
            'description' => 'required|string'
        ];

        $validator = \Validator::make($request->all(), $validations);

        if($validator->fails()) {
            $errors = $validator->messages()->all();
            return response()->json(['message' => implode(', ', $errors)], 422);
        } else {
            try {
                $this_requirement = $request->httpMethod == "POST" 
                        ? new Requirement
                        : Requirement::find($request->documentId);

                $this_requirement->name = $request->name;
                $this_requirement->description = $request->description;
                if($request->httpMethod !== "POST") $this_requirement->status = $request->status;
                $this_requirement->save();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a certificate. ID# " . $this_requirement->id;
                $new_log->save();

                return response()->json(['message' => "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a certificate. ID# " . $this_requirement->id], 201);
            } catch (\Exception $e) {
                return response()->json(['message' => $e->getMessage()], 500);
            }
        }
    }

    public function remove_requirement (Request $request, int $requirement_id) {
        try {
            $this_course = Requirement::withCount(['hasData'])->where('id', $requirement_id)->first();
            if($this_course->has_data_count > 0) {
                return response()->json(['message' => "Can't remove requirement. It already has connected data."], 200);
            } else {
                $this_course->delete();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've removed requirement. ID# $requirement_id";
                $new_log->save();

                return response()->json(['message' => "You've removed requirement. ID# $requirement_id"], 200);
            }
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
