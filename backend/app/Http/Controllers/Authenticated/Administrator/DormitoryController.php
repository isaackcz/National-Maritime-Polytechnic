<?php

namespace App\Http\Controllers\Authenticated\Administrator;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\{
    DormitoryRoom,
    AuditTrail,
    DormitoryTenant,
    DormitoryInvoice,
    DormitoryRoomImage
};

class DormitoryController extends Controller
{
    public function dormitories (Request $request) {
        $dormitories = DormitoryRoom::withCount(['tenants'])->get();
        return response()->json(['dormitories' => $dormitories], 200);
    }

    public function get_all_requests (Request $request) {
        $room_requests = DormitoryTenant::with([
            'tenant',
            'dormitory_room'
        ])->get();
        return response()->json(['room_requests' => $room_requests], 200);
    }

    public function get_room_info (Request $request, int $room_id) {
        $room_info = DormitoryRoom::with([
            'room_images'
        ])->where('id', $room_id)->get();
        return response()->json(['room_info' => $room_info], 200);
    }

    public function get_tenants (Request $request, int $room_id) {
        $tenants = DormitoryTenant::with(['tenant'])->where('id', $room_id)->get();
        return response()->json(['tenants' => $tenants], 200);
    }

    public function get_tenants_invoices (Request $request, int $tenant_id) {
        $tenant_invoices = DormitoryInvoice::where('dormitory_tenant_id', $tenant_id)->get();
        return response()->json(['tenant_invoices' => $tenant_invoices], 200);
    }

    public function get_all_invoices (Request $request) {
        $invoices = DormitoryInvoice::with('tenant')->get();
        return response()->json(['invoices' => $invoices], 200);
    }

    public function create_or_update_dormitory (Request $request) {
        $validations = [
            'room_name' => 'required|string',
            'room_description' => 'required|string',
            'room_cost' => 'required|numeric',
            'room_slot' => 'required|numeric',
            'room_image' => 'required|array'
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
                        : DormitoryRoom::find($request->documentId);

                $this_dormitory->user_id = $request->user()->id;
                $this_dormitory->room_name = $request->room_name;
                $this_dormitory->room_description = $request->room_description;
                $this_dormitory->room_cost = $request->room_cost;
                $this_dormitory->room_slot = $request->room_slot;
                $this_dormitory->room_status = $request->room_status ?? "ACTIVE";
                $this_dormitory->save();

                // $room_images = DormitoryRoomImage::where('dormitory_room_id', $this_dormitory->id);
                // $room_image = $room_images->get();
                // foreach ($room_image as $ri) {
                //     if(file_exists(public_path('room-images/' . $ri->room_filename))){
                //         unlink(public_path('room-images/' . $ri->room_filename));
                //     }
                // }
                // $room_images->truncate();

                $uploadedImages = $request->httpMethod === "POST"
                    ? $request->room_image
                    : json_decode($request->input('room_image'));

                foreach ($uploadedImages as $ri) {
                    $room_image = new DormitoryRoomImage;
                    $room_image->dormitory_room_id = $this_dormitory->id;

                    $image_name = Str::uuid() . '.png';
                    $ri->move(public_path('room-images'), $image_name);

                    $room_image->room_filename = $image_name;
                    $room_image->save();
                }

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
                $room_images = DormitoryRoomImage::where('dormitory_room_id', $dormitory_id);
                $room_image = $room_images->get();
                foreach ($room_image as $ri) {
                    if(file_exists(public_path('room-images/' . $ri->room_filename))){
                        unlink(public_path('room-images/' . $ri->room_filename));
                    }
                }
                
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
