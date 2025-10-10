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
    TrainingCtrl
};

/** trainee controllers */
use App\Http\Controllers\Authenticated\Trainee\{
    MyAccount,
    TraineeDormitory,
    TraineeCourses
};

/** general controllers */
use App\Http\Controllers\Authenticated\General\{
    Account
};

/** other controllers */
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
            Route::post('create_or_update_additional_info', [MyAccount::class,'create_or_update_additional_info']);
            Route::get('get_trainee_general_info', [MyAccount::class, 'get_trainee_general_info']);
            Route::post('update_password', [Account::class, 'update_password']);
            Route::get('get_activities', [Account::class, 'get_activities']);
        });

        Route::prefix('/courses/')->group(function() {
            Route::get('get_all_courses', [TraineeCourses::class, 'get_all_courses']);
            Route::get('get_trainee_courses', [TraineeCourses::class, 'get_trainee_courses']);
        });

        Route::prefix('/dormitories/')->group(function() {
            Route::get('get_all_dormitories', [TraineeDormitory::class, 'get_all_dormitories']);
            Route::get('get_personal_dormitory', [TraineeDormitory::class, 'get_dormitory']);
            Route::post('request_tenant_room', [TraineeDormitory::class,'request_tenant_room']);
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

        Route::prefix('/trainings/')->group(function() {
            Route::get('get', [TrainingCtrl::class, 'trainings']);
            Route::get('components/get_cmtf', [TrainingCtrl::class, 'get_cmtf']);
            Route::post('components/create_or_update_training', [TrainingCtrl::class, 'create_or_update_training']);

            Route::post('components/create_or_update_module', [TrainingCtrl::class, 'create_or_update_module']);
            Route::get('components/get_modules', [TrainingCtrl::class, 'get_modules']);
            Route::post('components/remove_module', [TrainingCtrl::class, 'remove_module']);

            Route::post('components/create_or_update_course', [TrainingCtrl::class, 'create_or_update_course']);
            Route::get('components/get_courses', [TrainingCtrl::class, 'get_courses']);
            Route::post('components/remove_course', [TrainingCtrl::class, 'remove_course']);

            Route::post('components/create_or_update_training_fee', [TrainingCtrl::class, 'create_or_update_training_fee']);
            Route::get('components/get_training_fees', [TrainingCtrl::class, 'get_training_fees']);
            Route::post('components/remove_fee', [TrainingCtrl::class, 'remove_training_fee']);

            Route::post('components/create_or_update_certificate', [TrainingCtrl::class, 'create_or_update_certificate']);
            Route::get('components/get_certificates', [TrainingCtrl::class, 'get_certificates']);
            Route::post('components/remove_certificate', [TrainingCtrl::class, 'remove_certificate']);
            
            Route::post('create_or_update_course', [TrainingCtrl::class, 'create_or_update_course']);
        });

        Route::prefix('/my-account/')->group(function() {
            Route::post('update_personal', [Account::class, 'update_personal']);
            Route::post('update_password', [Account::class, 'update_password']);
            Route::get('get_activities', [Account::class, 'get_activities']);
        });
    });
    /** dormitory */
    Route::middleware('admin-dormitory')->prefix('/dormitory-admin/')->group(function() {
        Route::prefix('/dormitory/')->group(function() {
            Route::get('get', [DormitoryController::class, 'dormitories']);
            Route::get('get/tenants/{dormitory_id}', [DormitoryController::class, 'get_tenants']);
            Route::get('get/tenants/invoice/{tenant_id}', [DormitoryController::class, 'get_tenants_invoices']);
            Route::post('create_or_update_dormitory', [DormitoryController::class, 'create_or_update_dormitory']);
            Route::get('remove/{dormitory_id}', [DormitoryController::class, 'remove_dormitory']);
        });

        Route::prefix('/my-account/')->group(function() {
            Route::post('update_personal', [Account::class, 'update_personal']);
            Route::post('update_password', [Account::class, 'update_password']);
            Route::get('get_activities', [Account::class, 'get_activities']);
        });
    });

    /** other routes */
    Route::get('logout', [Logout::class, 'logoutUser']);
});

