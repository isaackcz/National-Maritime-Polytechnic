<?php

namespace App\Http\Controllers\Authenticated\Trainee;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\{
    User,
    AuditTrail,
    GeneralInformation,
    Contact,
    EducationalAttainment,
    LatestSBExp,
    TrainingRegFile,
    AdditionalTraineeInformation,
    MainCourse,
    MainSchool
};

class MyAccount extends Controller
{
    public function get_trainee_general_info(Request $request) {
        try {
            $trainee_general_info = User::with([
                'additional_trainee_info',
                'additional_trainee_info.general_info',
                'additional_trainee_info.contact',
                'additional_trainee_info.trainee_registration_file',
                'additional_trainee_info.educational_attainment',
                'additional_trainee_info.latest_shipboard_attainment'
            ])->where('id', $request->user()->id)->get();

            return response()->json(['trainee_general_info'=> $trainee_general_info], 200);
        } catch (\Exception $e) { 
            return response()->json(['message'=> $e->getMessage()], 500);
        }
    }
    public function create_or_update_additional_info (Request $request) {
        // Check if user has existing trainee information and files
        $user = User::with(['additional_trainee_info.trainee_registration_file'])->find($request->user()->id);
        $hasExistingFiles = $user?->additional_trainee_info?->trainee_registration_file ?? null;
        
        // Base validation rules
        $validations = [
            'fname'=> 'required|string',
            'lname'=> 'required|string',
            'mname'=> 'required|string',
            'suffix'=> 'required|string',
            'birthdate'=> 'required|date',
            'gen_info_status' => 'required',
            'gen_info_trainee_id' => 'required|integer',
            'gen_info_srn' => 'required|integer',
            'gen_info_gender' => 'required',
            'gen_info_citizenship' => 'required|string',
            'gen_info_civil_status' => 'required',
            'gen_info_house_no' => 'required|string',
            'gen_info_region' => 'required|string',
            'gen_info_province' => 'required|string',
            'gen_info_municipality' => 'required|string',
            'gen_info_barangay' => 'required|string',
            'gen_info_postal' => 'required|string',
            'gen_info_number_one' => 'required|string',
            'gen_info_number_two' => 'required|string',
            'gen_info_email' => 'required|string|email',
            'gen_info_facebook' => 'required|string',
            "gen_info_birthplace_region" => 'required|string',
            "gen_info_birthplace_province" => 'required|string',
            "gen_info_birthplace_municipality" => 'required|string',
            "gen_info_birthplace_barangay" => 'required|string',
            //contact person
            'person_name' => 'required|string',
            'person_address' => 'required|string',
            'person_relationship' => 'required|string',
            'person_email' => 'required|string|email',
            'person_number_one' => 'required|string',
            'person_number_two' => 'required|string',
            //educational attainment
            'school_course_taken' => 'required',
            'school' => 'required',
            'school_year_graduated' => 'required|string',
        ];

        // File validation: required only if no existing files OR if creating new entry
        if (!$hasExistingFiles) {
            // For new entries, files are required
            $validations['file_e_signature'] = 'required';
            $validations['file_id_picture'] = 'required';
            $validations['file_srn_number'] = 'required';
            $validations['file_sea_service'] = 'required';
        } else {
            // For updates with existing files, only validate if new files are provided
            $validations['file_e_signature'] = 'sometimes|file';
            $validations['file_id_picture'] = 'sometimes|file';
            $validations['file_srn_number'] = 'sometimes|file';
            $validations['file_sea_service'] = 'sometimes|file';
            $validations['file_last_disembarkment'] = 'sometimes|file';
            $validations['file_marina_license'] = 'sometimes|file';
        }

        $validator = \Validator::make($request->all(), $validations);

        if($validator->fails()) {
            $errors = $validator->messages()->all();
            return response()->json(['message' => implode(', ', $errors)], 422);
        } else {
            try {
                DB::beginTransaction();
                $user->fname = $request->fname;
                $user->lname = $request->lname;
                $user->mname = $request->mname;
                $user->suffix = $request->suffix;
                $user->birthdate = $request->birthdate;
                $user->save();
                
                //general info
                $general_info = $user?->additional_trainee_info?->general_information_id;  
                $this_gen_info = $general_info ? GeneralInformation::findOrFail($general_info) : new GeneralInformation();

                $this_gen_info->gen_info_status = $request->gen_info_status;
                $this_gen_info->gen_info_trainee_id = $request->gen_info_trainee_id;
                $this_gen_info->gen_info_srn = $request->gen_info_srn;
                $this_gen_info->gen_info_gender = $request->gen_info_gender;
                $this_gen_info->gen_info_citizenship = $request->gen_info_citizenship;
                $this_gen_info->gen_info_civil_status = $request->gen_info_civil_status;
                $this_gen_info->gen_info_house_no = $request->gen_info_house_no;
                $this_gen_info->gen_info_region = $request->gen_info_region;
                $this_gen_info->gen_info_province = $request->gen_info_province;
                $this_gen_info->gen_info_municipality = $request->gen_info_municipality;
                $this_gen_info->gen_info_barangay = $request->gen_info_barangay;
                $this_gen_info->gen_info_birthplace_region = $request->gen_info_birthplace_region;
                $this_gen_info->gen_info_birthplace_province = $request->gen_info_birthplace_province;
                $this_gen_info->gen_info_birthplace_municipality = $request->gen_info_birthplace_municipality;
                $this_gen_info->gen_info_birthplace_barangay = $request->gen_info_birthplace_barangay;
                $this_gen_info->gen_info_postal = $request->gen_info_postal;
                $this_gen_info->gen_info_number_one = $request->gen_info_number_one;
                $this_gen_info->gen_info_number_two = $request->gen_info_number_two;
                $this_gen_info->gen_info_landline = $request->gen_info_landline;
                $this_gen_info->gen_info_email = $request->gen_info_email;
                $this_gen_info->gen_info_facebook = $request->gen_info_facebook;
                $this_gen_info->save();

                //contact
                $contact_info = $user?->additional_trainee_info?->contact_id; 
                $this_contact_info = $contact_info ? Contact::find($contact_info) : New Contact();

                $this_contact_info->person_name = $request->person_name;
                $this_contact_info->person_address = $request->person_address;
                $this_contact_info->person_relationship = $request->person_relationship;
                $this_contact_info->person_email = $request->person_email;
                $this_contact_info->person_number_one = $request->person_number_one;
                $this_contact_info->person_number_two = $request->person_number_two;
                $this_contact_info->person_landline = $request->landline;
                $this_contact_info->save();
                
                //education
                $education_info = $user?->additional_trainee_info?->educational_attainment_id;
                $this_education_info = $education_info ? EducationalAttainment::find($education_info) : new EducationalAttainment();
            
                $this_education_info->main_course_id= $request->school_course_taken;
                $this_education_info->main_school_id = $request->school;
                $this_education_info->school_graduated = $request->school_year_graduated;
                $this_education_info->save();

                //disembarkment
                $latest_disembarkment_info = $user?->additional_trainee_info?->latest_s_b_exp_id;
                $this_latest_disembarkment_info = $latest_disembarkment_info ? LatestSBExp::find( $latest_disembarkment_info) : new LatestSBExp();

                $this_latest_disembarkment_info->ship_status = $request->ship_status;
                $this_latest_disembarkment_info->ship_license = $request->ship_license;
                $this_latest_disembarkment_info->ship_rank = $request->ship_rank;
                $this_latest_disembarkment_info->ship_date_of_disembarkment = $request->ship_date_of_embarkment;
                $this_latest_disembarkment_info->ship_principal = $request->ship_principal;
                $this_latest_disembarkment_info->ship_manning = $request->ship_manning;
                $this_latest_disembarkment_info->ship_landline = $request->ship_landline;
                $this_latest_disembarkment_info->ship_number = $request->ship_number;
                $this_latest_disembarkment_info->save();

                $trainee_files_info = $user?->additional_trainee_info?->training_reg_file_id;
                $this_trainee_files_info = $trainee_files_info ? TrainingRegFile::find($trainee_files_info) : new TrainingRegFile();

                // Save the TrainingRegFile record first to get an ID (especially for new records)
                $this_trainee_files_info->save();

                //e-signature
                if ($request->hasFile('file_e_signature')){
                    $oldFilename = $this_trainee_files_info->file_e_signature;
                    $newFilename = $this->savefile($request->file_e_signature, $this_trainee_files_info->file_e_signature);
                    $this_trainee_files_info->file_e_signature = $newFilename;
                    \Log::info("Signature file update: old={$oldFilename}, new={$newFilename}");
                }
                //file_id_picture
                if ($request->hasFile('file_id_picture')){
                    $this_trainee_files_info->file_id_picture = $this->savefile($request->file_id_picture, $this_trainee_files_info->file_id_picture);
                }
                //file_srn_number
                if ($request->hasFile('file_srn_number')){
                    $this_trainee_files_info->file_srn_number = $this->savefile($request->file_srn_number, $this_trainee_files_info->file_srn_number);
                }
                //file_last_embarkment
                if($request->hasFile('file_last_disembarkment')){
                    $this_trainee_files_info->file_last_disembarkment = $this->savefile($request->file_last_disembarkment, $this_trainee_files_info->file_last_disembarkment);
                }
                //file_marina_license
                if($request->hasFile('file_marina_license')){
                    $this_trainee_files_info->file_marina_license = $this->savefile($request->file_marina_license, $this_trainee_files_info->file_marina_license);
                }
                //file_sea_service
                if($request->hasFile('file_sea_service')){
                    $this_trainee_files_info->file_sea_service = $this->savefile($request->file_sea_service, $this_trainee_files_info->file_sea_service);
                }
                
                // Save again after updating file fields
                $this_trainee_files_info->save();
                \Log::info("TrainingRegFile saved with ID: {$this_trainee_files_info->id}, signature: {$this_trainee_files_info->file_e_signature}");

                //Additional Information
                $additional_info = $user?->additional_trainee_info?->id;
                $this_additional_info = $general_info ? AdditionalTraineeInformation::findOrFail($additional_info) : new AdditionalTraineeInformation();

                $this_additional_info->user_id = $request->user()->id;        
                $this_additional_info->general_information_id = $this_gen_info->id;
                $this_additional_info->contact_id = $this_contact_info->id;
                $this_additional_info->latest_s_b_exp_id = $this_latest_disembarkment_info->id;
                $this_additional_info->educational_attainment_id = $this_education_info->id;
                $this_additional_info->training_reg_file_id = $this_trainee_files_info->id;
                $this_additional_info->save();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You have posted your new information!";
                $new_log->save();

                DB::commit();
                
                return response()->json(['message' => "You have posted your new information!"], 201);
            } catch (\Exception $e) {
                DB::rollback(); 
                return response()->json(['message'=> $e->getMessage()], 500);
            }
        }
    }
    public function savefile($fileUploaded, $existingFileName) {
        if($fileUploaded){
            \Log::info("savefile called: existingFileName={$existingFileName}");
            
            // Delete old file if it exists
            if ($existingFileName && file_exists(public_path('trainee-files/' . $existingFileName))) {
                \Log::info("Deleting old file: {$existingFileName}");
                unlink(public_path('trainee-files/' . $existingFileName));
            }

            // Generate new filename
            $filename_requested = time() . '_' . uniqid() . '.' . $fileUploaded->getClientOriginalExtension();
            \Log::info("Generated new filename: {$filename_requested}");
            
            // Move uploaded file to directory
            $fileUploaded->move(public_path('trainee-files'), $filename_requested);
            \Log::info("File moved successfully to: {$filename_requested}");

            return $filename_requested;
        }
        return null;
    }

    public function get_all_courses_and_schools (Request $request) {
        $courses = MainCourse::where('course_status', 'ACTIVE')->get();
        $schools = MainSchool::where('school_status', 'ACTIVE')->get();
        return response()->json(['courses' => $courses, 'schools' => $schools], 200);
    }
}
