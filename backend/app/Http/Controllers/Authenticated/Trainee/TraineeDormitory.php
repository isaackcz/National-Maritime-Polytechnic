<?php

namespace App\Http\Controllers\Authenticated\Trainee;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\{DormitoryRoom, DormitoryTenant, User, AuditTrail};

class TraineeDormitory extends Controller
{
    public function get_all_dormitories(Request $request) {
        $dormitories = DormitoryRoom::with(['room_images'])->withCount(['tenants'])->get();
        return response()->json(['dormitories' => $dormitories], 200);
    }
    public function get_personal_dormitory(Request $request) {
        try {
            $user = User::findOrFail($request->user()->id);
            $dormitory = $user->trainee_dormitory()->with(['dormitory_room'])->get();

            return response()->json(['data' => $dormitory]);
    }   catch (\Exception $e) {
            return response()->json(["error"=> $e->getMessage()], 500);
        }
    }
    public function request_tenant_room(Request $request) {
        $validations = [
            'tenant_from_date' => 'required|date|before_or_equal:tenant_to_date',
            'tenant_to_date' => 'required|date|after_or_equal:tenant_from_date',
            'tenant_status' => 'required',
        ];

        $user = $request->user();

        $exists = DormitoryTenant::where('user_id', $user->id)
            ->where('dormitory_room_id', $request->dormitory_room_id)
            ->where(function ($query) use ($request) {
                $query
                ->whereBetween('tenant_from_date', [$request->tenant_from_date, $request->tenant_to_date])
                ->orWhereBetween('tenant_to_date', [$request->tenant_from_date, $request->tenant_to_date]);
            })->exists();
        
        if ($exists) {
            return response()->json(['message' => 'You already have a request for this room and date range.']);
        }

        $validator = \Validator::make($request->all(), $validations);

        if($validator->fails()) {
            return response()->json(['errors'=> implode(',', $validator->errors()->all())],400);
        } else {
            try {
                DB::beginTransaction();

                $tenant_dormitory = new DormitoryTenant();
                $tenant_dormitory->user_id = $user->id;
                $tenant_dormitory->dormitory_room_id = $request->room_id;
                $tenant_dormitory->tenant_from_date = $request->tenant_from_date;
                $tenant_dormitory->tenant_status = $request->tenant_status;
                $tenant_dormitory->tenant_to_date = $request->tenant_to_date;
                $tenant_dormitory->save();

                $new_log = new AuditTrail;
                $new_log->user_id = $user->id;
                $new_log->actions = "User {$user->id} sent a dorm request.";
                $new_log->save();

                DB::commit();

                return response()->json(["success"=> true],200);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(["error"=> $e->getMessage()],400);
            }
           
        }   
    }
    public function update_status_dormitory (Request $request){
        $validations = [
            'document_id'=> 'required',
            'status'=> 'required',
        ];

        $validator = \Validator::make($request->all(), $validations);

        if ($validator->fails()) {
            return response()->json(['message'=> $validator->errors()], 400);
        } else {
            try {
                $dormitory_id = DormitoryTenant::find($request->document_id);
                $dormitory_id->tenant_status = $request->status;
                $dormitory_id->save();

                DB::commit();
            } catch (\Exception $e) {
                DB::rollback();
                return response()->json(['message'=> $e->getMessage()], 400);
            }
        }
    }
}

