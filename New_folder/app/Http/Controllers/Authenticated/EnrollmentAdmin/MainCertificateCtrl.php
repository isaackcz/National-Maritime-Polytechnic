<?php

namespace App\Http\Controllers\Authenticated\EnrollmentAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\{
    MainCertificate,
    AuditTrail
};

class MainCertificateCtrl extends Controller
{
    public function certificates (Request $request) {
        $certificates = MainCertificate::with(['hasData'])->get();
        return response()->json(['certificates' => $certificates], 200);
    }

    public function create_or_update_certificate (Request $request) {
        $validations = [
            'certificate_name' => 'required|string'
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
                        : MainCertificate::find($request->document_id);

                $this_certificate->main_cert_name = $request->main_cert_name;
                $this_certificate->qr = "";
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

    public function remove_certificate (Request $request, int $certificate_id) {
        try {
            DB::beginTransaction();
            
            $this_cert = MainCertificate::with(['hasData'])->where('id', $certificate_id)->first();
            if($this_cert->has_data > 0) {
                return response()->json(['message' => "Can't remove certificate. It already has connected data."], 200);
            } else {
                $certificate = MainCertificate::find($certificate_id);
                $certificate->delete();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've removed certificate. ID# $certificate_id";
                $new_log->save();

                DB::commit();
                return response()->json(['message' => "You've removed certificate. ID# $certificate_id"], 200);
            }
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
