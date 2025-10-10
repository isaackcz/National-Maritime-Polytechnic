<?php

namespace App\Http\Controllers\Authenticated\Trainee;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\{
    User,
    AuditTrail,
    GeneralInformation,
    ContactPerson,
    EducationalAttainment,
    LatestShipboardExperience,
    TraineeRegistrationFile,
    AdditionalTraineeInfo
};

class MyAccount extends Controller
{
    public function get_trainee_general_info(Request $request) {
        try {
            $trainee_general_info = User::with([
                'additional_trainee_info',
                'additional_trainee_info.general_info',
                'additional_trainee_info.contact_person',
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
    //    $validations = [
    //         'gen_info_status' => 'required|in:NEW,RETURNEE',
    //         'gen_info_srn' => 'required|integer',
    //         'gen_info_gender' => 'required|in:MALE,FEMALE',
    //         'gen_info_citizenship' => 'required|string',
    //         'gen_info_civil_status' => 'required|in:SINGLE,MARRIED,WIDOWED,DIVORCED,SEPARATED',
    //         'gen_info_house_no' => 'required|string',
    //         'gen_info_region' => 'required|string',
    //         'gen_info_province' => 'required|string',
    //         'gen_info_municipality' => 'required|string',
    //         'gen_info_barangay' => 'required|string',
    //         'gen_info_postal' => 'required|string',
    //         'gen_info_number_one' => 'required|integer',
    //         'gen_info_number_two' => 'required|integer',
    //         'gen_info_email' => 'required|string|email',
    //         'gen_info_facebook' => 'required|string',
    //         "gen_info_birthplace_region" => 'required|string',
    //         "gen_info_birthplace_province" => 'required|string',
    //         "gen_info_birthplace_municipality" => 'required|string',
    //         "gen_info_birthplace_barangay" => 'required|string',
    //         //contact person
    //         'person_name' => 'required|string',
    //         'person_address' => 'required|string',
    //         'person_relationship' => 'required|string',
    //         'person_email' => 'required|string|email',
    //         'person_number_one' => 'required|integer',
    //         'person_number_two' => 'required|integer',
    //         //educational attainment
    //         'school_course_taken' => 'required|string',
    //         'school_address' => 'required|string',
    //         'school_graduated' => 'required|string',
    //         //trainee registration files
    //         'file_e_signature' => 'required',
    //         'file_id_picture' => 'required',
    //         'file_srn_number' => 'required',
    //         'file_sea_service' => 'required',
    //     ];

    //     $validator = \Validator::make($request->all(), $validations);

        // if($validator->fails()) {
        //     $errors = $validator->messages()->all();
        //     return response()->json(['message' => implode(', ', $errors)], 422);
        // } else {
            try {
                DB::beginTransaction();

                $this_gen_info = $request->httpMethod == "POST" 
                        ? new GeneralInformation
                        : GeneralInformation::find($request->document_gen_info_id);

                $this_gen_info->fill([
                    "gen_info_status"=> $request->gen_info_status,
                    "gen_info_trainee_id" => $request->gen_info_trainee_id,
                    "gen_info_srn" => $request->gen_info_srn,
                    "gen_info_gender" => $request->gen_info_gender,
                    "gen_info_citizenship" => $request->gen_info_citizenship,
                    "gen_info_civil_status" => $request->gen_info_civil_status,
                    "gen_info_house_no" => $request->gen_info_house_no,
                    "gen_info_region" => $request->gen_info_region,
                    "gen_info_province" => $request->gen_info_province,
                    "gen_info_municipality" => $request->gen_info_municipality,
                    "gen_info_barangay" => $request->gen_info_barangay,
                    "gen_info_postal" => $request->gen_info_postal,
                    "gen_info_birthplace_region" => $request->gen_info_region,
                    "gen_info_birthplace_province" => $request->gen_info_province,
                    "gen_info_birthplace_municipality" => $request->gen_info_municipality,
                    "gen_info_birthplace_barangay" => $request->gen_info_barangay,
                    "gen_info_number_one" => $request->gen_info_number_one,
                    "gen_info_number_two" => $request->gen_info_number_two,
                    "gen_info_landline" => $request->gen_info_landline,
                    "gen_info_email" => $request->gen_info_email,
                    "gen_info_facebook" => $request->gen_info_facebook,
                ]);
                $this_gen_info->save();

                //contact
                $this_contact = $request->httpMethod == "POST" 
                    ? new ContactPerson
                    : ContactPerson::find($request->document_contact_id);

                $this_contact->person_name = $request->person_name;
                $this_contact->person_address = $request->person_address;
                $this_contact->person_relationship = $request->person_relationship;
                $this_contact->person_email = $request->person_email;
                $this_contact->person_number_one = $request->person_number_one;
                $this_contact->person_number_two = $request->person_number_two;
                $this_contact->landline = $request->landline;
                $this_contact->save();

                //education
                $this_education = $request->httpMethod == "POST" 
                    ? new EducationalAttainment
                    : EducationalAttainment::find($request->document_education_id);

                $this_education->school_course_taken = $request->school_course_taken;
                $this_education->school_address = $request->school_address;
                $this_education->school_graduated = $request->school_graduated;
                $this_education->save();

                //train files
                $this_trainee_files = $request->httpMethod == "POST" 
                    ? new TraineeRegistrationFile         
                    : TraineeRegistrationFile::find($request->document_trainee_file_id);

                //e-signature
                if ($request->hasFile('file_e_signature')){
                    $this_trainee_files->file_e_signature = $this->savefile($request->file_e_signature, $this_trainee_files->file_e_signature, "file_e_signature");
                }
                //file_id_picture
                if ($request->hasFile('file_id_picture')){
                    $this_trainee_files->file_id_picture = $this->savefile($request->file_id_picture, $this_trainee_files->file_id_picture, "file_id_picture");
                }
                //file_srn_number
                if ($request->hasFile('file_srn_number')){
                    $this_trainee_files->file_srn_number = $this->savefile($request->file_srn_number, $this_trainee_files->file_srn_number, "file_srn_number");
                }
                //file_last_embarkment
                if($request->hasFile('file_last_disembarkment')){
                    $this_trainee_files->file_last_disembarkment = $this->savefile($request->file_last_disembarkment, $this_trainee_files->file_last_disembarkment, "file_last_disembarkment");
                }
                //file_marina_license
                if($request->hasFile('file_marina_license')){
                    $this_trainee_files->file_marina_license = $this->savefile($request->file_marina_license, $this_trainee_files->file_marina_license, "file_marina_license");
                }
                //file_sea_service
                if($request->hasFile('file_sea_service')){
                    $this_trainee_files->file_sea_service = $this->savefile($request->file_sea_service, $this_trainee_files->file_sea_service, "file_sea_service");
                }
                $this_trainee_files->save();

                $this_embarkment = $request->httpMethod == "POST" 
                    ? new LatestShipboardExperience
                    : LatestShipboardExperience::find($request->document_latest_shipboard_experience_id);

                $this_embarkment->ship_status = $request->ship_status;
                $this_embarkment->ship_license = $request->ship_license;
                $this_embarkment->ship_rank = $request->ship_rank;
                $this_embarkment->ship_date_of_embarkment = $request->ship_date_of_embarkment;
                $this_embarkment->ship_principal = $request->ship_principal;
                $this_embarkment->ship_manning = $request->ship_manning;
                $this_embarkment->ship_landline = $request->ship_landline;
                $this_embarkment->ship_number = $request->ship_number;
                $this_embarkment->save();

                $this_additional_info = $request->httpMethod == "POST" 
                    ? new AdditionalTraineeInfo
                    : AdditionalTraineeInfo::find($request->document_additional_trainee_info_id);

                $this_additional_info->user_id = $request->user()->id;        
                $this_additional_info->general_information_id = $this_gen_info->id;
                $this_additional_info->contact_person_id = $this_contact->id;
                $this_additional_info->latest_shipboard_experience_id = $this_embarkment->id;
                $this_additional_info->educational_attainment_id = $this_education->id;
                $this_additional_info->trainee_registration_file = $this_trainee_files->id;
                $this_additional_info->save();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You have " . ($request->httpMethod == "POST" ? 'created' : 'updated') . "  your information.";
                $new_log->save();

                DB::commit();
                return response()->json(['message' => "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " your information. "], 201);
            } catch (\Exception $e) {
                DB::rollback();
                return response()->json(['message' => $e->getMessage()], 500);
            }
        // }
    }


    public function savefile($request, $this_trainee_files, $name){
        if ($request !== $this_trainee_files)
        {
            if (file_exists(public_path("trainee-files/" . $this_trainee_files))){
                unlink(public_path('trainee-files/' . $this_trainee_files));
            }
        }
        $file_requested = $request->file($name);
        $filename_requested = time() . '_' . uniqid() . '.' . $file_requested->getClientOriginalExtension();
        $file_requested->move(public_path('trainee-files'), $filename_requested);
        return $file_requested ? $filename_requested : null;
    }

}
