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
/** trainee controllers */
use App\Http\Controllers\Authenticated\Trainee\{
    MyAccount,
    TraineeDormitory,
    TraineeCourses
};
/** administrator controllers */
use App\Http\Controllers\Authenticated\Administrator\{
    Account,
    EnrollmentCtrl,
    TrainingCtrl,
    LibraryController,
    DormitoryController,
    Masterlist
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
            Route::get('get_all_courses_and_schools', [MyAccount::class, 'get_all_courses_and_schools']);
        });

        Route::prefix('/courses/')->group(function() {
            Route::get('get_all_courses', [TraineeCourses::class, 'get_all_courses']);
            Route::get('get_trainee_courses', [TraineeCourses::class, 'get_trainee_courses']);
        });

        Route::prefix('/dormitories/')->group(function() {
            Route::get('get_all_dormitories', [TraineeDormitory::class, 'get_all_dormitories']);
            Route::get('get_personal_dormitory', [TraineeDormitory::class, 'get_personal_dormitory']);
            Route::post('request_tenant_room', [TraineeDormitory::class,'request_tenant_room']);
            Route::post('update_status_dormitory', [TraineeDormitory::class,'update_status_dormitory']);
        });
       
    });

    /** administrator routes */
    Route::prefix('/admin/')->group(function() {
        /** enrollment controllers */
        Route::middleware('user_role:SUPERADMIN,ADMIN-ENROLLMENT')->group(function() {
            Route::prefix('/enrollment/')->group(function() {
                Route::get('get_pendings', [EnrollmentCtrl::class, 'get_pendings']);
                Route::get('get_enrolled', [EnrollmentCtrl::class, 'get_enrolled']);
                Route::get('get_finished', [EnrollmentCtrl::class, 'get_finished']);
            });

            Route::prefix('/trainings/')->group(function() {
                Route::get('get', [TrainingCtrl::class, 'trainings']);
                Route::get('remove_training/{training_id}', [TrainingCtrl::class, 'remove_training']);
                Route::get('components/get_cmtfc', [TrainingCtrl::class, 'get_cmtfc']);
                Route::post('components/create_or_update_training', [TrainingCtrl::class, 'create_or_update_training']);
                Route::post('components/create_or_update_module', [TrainingCtrl::class, 'create_or_update_module']);
                Route::get('components/get_modules', [TrainingCtrl::class, 'get_modules']);
                Route::get('components/remove_module/{module_id}', [TrainingCtrl::class, 'remove_module']);
                Route::post('components/create_or_update_training_fee', [TrainingCtrl::class, 'create_or_update_training_fee']);
                Route::get('components/get_training_fees', [TrainingCtrl::class, 'get_training_fees']);
                Route::get('components/remove_training_fee/{fee_id}', [TrainingCtrl::class, 'remove_training_fee']);
                Route::post('components/create_or_update_certificate', [TrainingCtrl::class, 'create_or_update_certificate']);
                Route::get('components/get_certificates', [TrainingCtrl::class, 'get_certificates']);
                Route::get('components/remove_certificate/{certificate_id}', [TrainingCtrl::class, 'remove_certificate']);

                Route::post('components/create_or_update_requirement', [TrainingCtrl::class, 'create_or_update_requirement']);
                Route::get('components/get_requirements', [TrainingCtrl::class, 'get_requirements']);
                Route::get('components/training-requirements/remove_trequirement/{requirement_id}', [TrainingCtrl::class, 'remove_requirement']);
            });
        });

        /** library controllers */
        Route::middleware('user_role:SUPERADMIN,ADMIN-LIBRARY')->group(function() {
            Route::prefix('/books/')->group(function() {
                Route::get('get_books', [LibraryController::class, 'get_books']);
                Route::get('get_book_reservation', [LibraryController::class, 'get_book_reservation']);
                Route::post('update_reservation', [LibraryController::class, 'update_reservation']);
                Route::post('create_or_update_book', [LibraryController::class, 'create_or_update_book']);
                Route::get('remove_book/{book_id}', [LibraryController::class, 'remove_book']);
            });

            Route::prefix('/category/')->group(function() {
                Route::get('get_categories', [LibraryController::class, 'get_categories']);
                Route::get('get_active_categories', [LibraryController::class, 'get_active_categories']);
                Route::post('create_or_update_category', [LibraryController::class, 'create_or_update_category']);
                Route::get('remove_category/{category_id}', [LibraryController::class, 'remove_category']);
            });
        });

        /** dormitory controllers */
        Route::middleware('user_role:SUPERADMIN,ADMIN-DORMITORY')->group(function() {
            Route::prefix('/dormitory/')->group(function() {
                Route::get('get', [DormitoryController::class, 'dormitories']);
                Route::get('get_all_requests', [DormitoryController::class, 'get_all_requests']);
                Route::get('get_room_info/{dormitory_id}', [DormitoryController::class, 'get_room_info']);
                Route::post('create_or_update_dormitory', [DormitoryController::class, 'create_or_update_dormitory']);
                Route::get('remove_dormitory/{dormitory_id}', [DormitoryController::class, 'remove_dormitory']);

                Route::get('get_all_invoices', [DormitoryController::class, 'get_all_invoices']);
                Route::get('get/tenants/{dormitory_id}', [DormitoryController::class, 'get_tenants']);
                Route::get('get/tenants/invoice/{tenant_id}', [DormitoryController::class, 'get_tenants_invoices']);
                Route::post('update_status_dormitory', [DormitoryController::class, 'update_status_dormitory']);
            });
        });

        Route::middleware('user_role:SUPERADMIN')->prefix('/masterlist/')->group(function() {
            Route::prefix('/school/')->group(function() {
                Route::post('create_or_update_school', [Masterlist::class, 'create_or_update_school']);
                Route::get('get_schools', [Masterlist::class, 'get_schools']);
                Route::get('remove/{course_id}', [Masterlist::class, 'remove_school']);
            });

            Route::prefix('/course/')->group(function() {
                Route::post('create_or_update_course', [Masterlist::class, 'create_or_update_course']);
                Route::get('get_courses', [Masterlist::class, 'get_courses']);
                Route::get('remove/{course_id}', [Masterlist::class, 'remove_course']);
            });
        });

        /** general controllers */
        Route::prefix('/my-account/')->group(function() {
            Route::post('update_personal', [Account::class, 'update_personal']);
            Route::post('update_password', [Account::class, 'update_password']);
            Route::get('get_activities', [Account::class, 'get_activities']);
        });
    });
    /** other routes */
    Route::get('logout', [Logout::class, 'logoutUser']);
});

