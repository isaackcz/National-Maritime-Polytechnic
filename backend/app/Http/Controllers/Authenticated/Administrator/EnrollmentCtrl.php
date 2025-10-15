<?php

namespace App\Http\Controllers\Authenticated\Administrator;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\{
    EnrolledCourse,
    AuditTrail
};

class EnrollmentCtrl extends Controller
{
    public function get_pendings() {
        $pending_enrollment = EnrolledCourse::where('enrolled_courses_status', 'PENDING')
            ->groupBy('user_id')
            ->orderBy('created_at', 'DESC')->get();

        return response()->json(['pending_enrollment' => $pending_enrollment], 200);
    }
}
