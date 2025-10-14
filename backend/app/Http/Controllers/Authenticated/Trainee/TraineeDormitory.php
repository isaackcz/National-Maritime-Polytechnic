<?php

namespace App\Http\Controllers\Authenticated\Trainee;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\{DormitoryRoom, DormitoryTenant, User, AuditTrail};

class TraineeDormitory extends Controller
{

    public function get_all_dormitories(Request $request) {
        $dormitories = DormitoryRoom::withCount(['tenants'])->get();
        return response()->json(['dormitories' => $dormitories], 200);
    }

    public function request_tenant_room(Request $request) {
        $validations = [
            'tenant_from_date' => 'required|date|before_or_equal:tenant_to_date',
            'tenant_to_date' => 'required|date|after_or_equal:tenant_from_date',  
        ];

        $validator = \Validator::make($request->all(), $validations);

        if($validator->fails()) {
            return response()->json(['errors'=> implode(',', $validator->errors()->all())],400);
        } else {
            try {
            DB::beginTransaction();
            $user = $request->user();
            $tenant_dormitory = new DormitoryTenant();
            $tenant_dormitory->user_id = $user->id;
            $tenant_dormitory->dormitory_room_id = $request->room_id;
            $tenant_dormitory->tenant_from_date = $request->tenant_from_date;
            $tenant_dormitory->tenant_to_date = $request->tenant_to_date;
            $tenant_dormitory->save();

            $new_log = new AuditTrail;
            $new_log->user_id = $user->id;
            $new_log->actions = "User {$request->user_id} sent a dorm request.";
            $new_log->save();

            DB::commit();

            return response()->json(["success"=> true],200);

            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(["error"=> $e->getMessage()],400);
            }
           
        }   
    }
    
    public function get_personal_dormitory(Request $request) {
        try {
            $trainee_dormitories = User::with([
                'trainee_dormitory'
            ])->where('id', $request->user()->id)->first();

            return response()->json(['trainee_dormitories' => $trainee_dormitories]);
        } catch (\Exception $e) {
            return response()->json(["error"=> $e->getMessage()], 500);
        }
    }
}

