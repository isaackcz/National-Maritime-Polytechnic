<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\DormitoryRoom;
use App\Models\AuditTrail;

class LoginController extends Controller
{
    public function login_user(Request $request) {
        $validation = [
            'email' => 'required|string|email',
            'password' => 'required|string'
        ];

        $validator = \Validator::make($request->all(), $validation);

        if($validator->fails()) {
            return response()->json(['message' => $validator->messages()], 422);
        } else {
            try {
                if(Auth::attempt($request->only('email', 'password'))){
                    $user = Auth::user();

                    if (is_null($user->email_verified_at)) {
                        Auth::logout();
                        return response()->json(['message' => 'Your email address is not verified. Please check your inbox.'], 500);
                    }

                    $new_log = new AuditTrail;
                    $new_log->user_id = $user->id;
                    $new_log->actions = "You've logged into your account";
                    $new_log->save();

                    $token = $user->createToken('auth_token')->plainTextToken;
                    return response()->json(['token' => $token, 'role' => $user->role], 200);
                } else {
                    return response()->json(['message' => "Invalid username or password. Please try again"], 422);
                }
            } catch (\Exception $e) {
                return response()->json(['message' => $e->getMessage()], 500);
            }
        }
    }
}
