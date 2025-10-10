<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/** guest controllers */
use App\Http\Controllers\Guest\{
    LoginController, 
    RegisterController, 
    ForgotPasswordController, 
    EmailVerificationController
};

/** admin controllers */
use App\Http\Controllers\Authenticated\DormitoryAdmin\{
    DormitoryController,
    DormitoryMyAccountCtrl
};
use App\Http\Controllers\Authenticated\EnrollmentAdmin\{
    MainCertificateCtrl,
    MainCourseCtrl
};

/** trainee controllers */
use App\Http\Controllers\Authenticated\Trainee\{
    MyAccount,
    TraineeDormitory,
    TraineeCourses
};

/** general controllers */
use App\Http\Controllers\Authenticated\Logout;

/** guest routes */
Route::post('/login', [LoginController::class, 'login_user']);
Route::post('/register', [RegisterController::class,'register_user']);
Route::get('/email/verify', [EmailVerificationController::class, 'verify'])->middleware(['signed', 'throttle:6,1'])->name('verification.verify');
Route::post('/forgot-password', [ForgotPasswordController::class, 'forgotPassword']);
Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);

/** authenticated routes */
Route::middleware('auth:sanctum')->group(function () {
    /** current user */
    Route::get('/user', function(Request $request) {
        return response()->json(['user' => $request->user()]);
    });
    
    /** trainee routes */
    Route::middleware('trainee')->group(function() {
        Route::prefix('/my-account/')->group(function() {
            Route::post('update_password', [MyAccount::class, 'update_password']);
            Route::get('get_activities', [MyAccount::class, 'get_activities']);
            Route::get('get_trainee_general_info', [MyAccount::class, 'get_trainee_general_info']);
        });

        Route::prefix('/courses/')->group(function() {
            Route::get('get_all_courses', [TraineeCourses::class, 'get_all_courses']);
            Route::get('get_trainee_courses', [TraineeCourses::class, 'get_trainee_courses']);
        });

        Route::prefix('/dormitory/')->group(function() {
            Route::get('rooms', [TraineeDormitory::class, 'get_available_rooms']);
            Route::get('my-request', [TraineeDormitory::class, 'get_my_request']);
            Route::post('request', [TraineeDormitory::class, 'submit_request']);
            Route::post('cancel-request/{tenant_id}', [TraineeDormitory::class, 'cancel_request']);
        });
    });

    /** admin routes */
    /** enrollment */
    Route::middleware('admin-enrollment')->prefix('/enrollment-admin/')->group(function() {
        Route::prefix('/certificate/')->group(function() {
            Route::get('get', [MainCertificateCtrl::class, 'certificates']);
            Route::post('create_or_update_course', [MainCertificateCtrl::class, 'create_or_update_certificate']);
            Route::get('remove/{certificate_id}', [MainCertificateCtrl::class, 'remove_certificate']);
        });

        Route::prefix('/courses/')->group(function() {
            Route::get('get', [MainCourseCtrl::class, 'courses']);
            Route::post('create_or_update_course', [MainCourseCtrl::class, 'create_or_update_course']);
            Route::get('remove/{course_id}', [MainCourseCtrl::class, 'remove_course']);
        });
    });
    /** dormitory */
    Route::middleware('admin-dormitory')->prefix('/dormitory-admin/')->group(function() {
        Route::prefix('/dormitory/')->group(function() {
            Route::get('get', [DormitoryController::class, 'dormitories']);
            Route::get('get/tenants/{dormitory_id}', [DormitoryController::class, 'get_tenants']);
            Route::get('get/tenants/invoice/{tenant_id}', [DormitoryController::class, 'get_tenants_invoices']);
            Route::get('get/overdue-tenants/{dormitory_id}', [DormitoryController::class, 'get_overdue_tenants']);
            Route::post('create_or_update_dormitory', [DormitoryController::class, 'create_or_update_dormitory']);
            Route::post('toggle-status/{dormitory_id}', [DormitoryController::class, 'toggle_room_status']);
            Route::get('remove/{dormitory_id}', [DormitoryController::class, 'remove_dormitory']);
        });

        Route::prefix('/requests/')->group(function() {
            Route::get('/', [DormitoryController::class, 'get_all_requests']);
            Route::post('{tenant_id}/approve', [DormitoryController::class, 'approve_request']);
            Route::post('{tenant_id}/send-payment-link', [DormitoryController::class, 'send_payment_link']);
            Route::post('{tenant_id}/confirm-payment', [DormitoryController::class, 'confirm_payment']);
            Route::post('{tenant_id}/reject', [DormitoryController::class, 'reject_request']);
        });

        Route::prefix('/my-account/')->group(function() {
            Route::post('update_personal', [DormitoryMyAccountCtrl::class, 'update_personal']);
            Route::post('update_password', [DormitoryMyAccountCtrl::class, 'update_password']);
            Route::get('get_activities', [DormitoryMyAccountCtrl::class, 'get_activities']);
        });
    });

    /** general routes */
    Route::get('logout', [Logout::class, 'logoutUser']);
});

