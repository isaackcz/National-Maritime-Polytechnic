<?php

namespace App\Http\Controllers\Authenticated\DormitoryAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\{
    DormitoryRoom,
    AuditTrail,
    DormitoryTenant,
    DormitoryInvoice
};

class DormitoryController extends Controller
{
    public function dormitories (Request $request) {
        $dormitories = DormitoryRoom::withCount(['tenants'])->get();
        return response()->json(['dormitories' => $dormitories], 200);
    }

    public function get_tenants (Request $request, int $room_id) {
        $tenants = DormitoryTenant::with(['tenant'])->where('id', $room_id)->get();
        return response()->json(['tenants' => $tenants], 200);
    }

    public function get_tenants_invoices (Request $request, int $tenant_id) {
        $tenant_invoices = DormitoryInvoice::where('tenant_id', $tenant_id)->get();
        return response()->json(['tenant_invoices' => $tenant_invoices], 200);
    }

    public function create_or_update_dormitory (Request $request) {
        $validations = [
            'room_name' => 'required|string',
            'room_description' => 'required|string',
            'room_cost' => 'required|numeric',
            'room_slot' => 'required|numeric'
        ];

        $validator = \Validator::make($request->all(), $validations);

        if($validator->fails()) {
            $errors = $validator->messages()->all();
            return response()->json(['message' => implode(', ', $errors)], 422);
        } else {
            try {
                DB::beginTransaction();
                
                $this_dormitory = $request->httpMethod == "POST" 
                        ? new DormitoryRoom
                        : DormitoryRoom::find($request->document_id);

                $this_dormitory->user_id = $request->user()->id;
                $this_dormitory->room_name = $request->room_name;
                $this_dormitory->room_description = $request->room_description;
                $this_dormitory->room_cost = $request->room_cost;
                $this_dormitory->room_slot = $request->room_slot;
                $this_dormitory->room_status = $request->room_status ?? "ACTIVE";
                $this_dormitory->save();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a dormitory. ID# " . $this_dormitory->id;
                $new_log->save();

                DB::commit();
                return response()->json(['message' => "You've " . ($request->httpMethod == "POST" ? 'created' : 'updated') . " a dormitory. ID# " . $this_dormitory->id], 201);
            } catch (\Exception $e) {
                DB::rollback();
                return response()->json(['message' => $e->getMessage()], 500);
            }
        }
    }

    public function remove_dormitory (Request $request, int $dormitory_id) {
        try {
            DB::beginTransaction();

            $this_dorm = DormitoryRoom::withCount(['tenants'])->where('id', $dormitory_id)->first();
            if($this_dorm->tenants_count > 0) {
                return response()->json(['message' => "Can't remove room. It already has connected data."], 200);
            } else {
                $dormitory = DormitoryRoom::find($dormitory_id);
                $dormitory->delete();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've removed dormitory. ID# $dormitory_id";
                $new_log->save();

                DB::commit();
                return response()->json(['message' => "You've removed dormitory. ID# $dormitory_id"], 200);
            }
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
