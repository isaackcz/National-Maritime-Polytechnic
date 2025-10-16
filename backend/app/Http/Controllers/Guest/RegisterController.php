<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\{
    User,
    AuditTrail
};
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\URL;
use App\Mail\VerifyEmail;

class RegisterController extends Controller
{
    public function register_user(Request $request) { 
        $validations = [
            'email' => 'required|string|email',
            'is_from_social_login' => 'required'
        ];

        if(!$request->is_from_social_login){
            $validations['birthdate'] = 'required|date|before:today';
            $validations['fname'] = 'required';
            $validations['lname'] = 'required';
            $validations['mname'] = 'required';
            $validations['google_captcha'] = 'required';
            $validations['password'] = ['required', 'confirmed', 'min:6', 'regex:/[a-z]/', 'regex:/[A-Z]/', 'regex:/[0-9]/', 'regex:/[@$!%*#?&]/' ];
            $validations['password_confirmation'] = 'required';
        }

        $validator = \Validator::make($request->all(), $validations);

        if($validator->fails()){
            $errors = $validator->messages()->all();
            return response()->json(['message' => implode(', ', $errors)], 422);
        } else {
            try {
                $random_password = strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
                if(!$request->is_from_social_login) {
                    $response = Http::get("https://www.google.com/recaptcha/api/siteverify", [
                        'secret' => env('GOOGLE_RECAPTCHA_SECRET_KEY'),
                        'response' => $request->google_captcha,
                    ]);

                    if(!$response->successful()) {
                        return response()->json(['message' => $response->status()], 500); 
                    }
                }

                DB::beginTransaction();

                if($request->is_from_social_login) {
                    $user = User::where('email', $request->email)->first();
                    if($user) {
                        Auth::login($user);

                        $new_log = new AuditTrail;
                        $new_log->user_id = $user->id;
                        $new_log->actions = "You've logged into your account";
                        $new_log->save();

                        DB::commit();

                        $token = $user->createToken('auth_token')->plainTextToken;
                        return response()->json(['token' => $token, 'role' => $user->role, 'autoLogin' => true], 200);
                    }
                }
                
                $users = User::all();
                foreach ($users as $user) {
                    if (strtolower($user->fname . " " . $user->lname . " ". $user->mname . " " . $user->suffix) == 
                        strtolower($request->fname . " " . $request->lname . " ". $request->mname . " " . $request->suffix)) {
                        return response()->json(['message' => 'Sorry, Your name is already taken.'], 422);
                    }
                }

                $user = new User;
                $user->fname = $request->fname;
                $user->lname = $request->lname;
                $user->mname = $request->mname;
                $user->suffix = $request->suffix;
                $user->email = $request->email;

                if($request->avatar) {
                    
                }

                if($request->is_from_social_login) $user->email_verified_at = Carbon::now();
                $user->birthdate = $request->birthdate;
                $user->password = bcrypt(!$request->is_from_social_login ? $request->password : '');
                $user->save();

                if($request->is_from_social_login) {
                    if(Auth::attempt(['email' => $request->email, 'password' => ''])){
                        $user = Auth::user();

                        $new_log = new AuditTrail;
                        $new_log->user_id = $user->id;
                        $new_log->actions = "You've logged into your account";
                        $new_log->save();

                        DB::commit();

                        $token = $user->createToken('auth_token')->plainTextToken;
                        return response()->json(['token' => $token, 'role' => $user->role, 'autoLogin' => true], 200);
                    }
                } else {
                    event(new Registered($user));
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'autoLogin' => false,
                    'message' => 'Registration successful! Please check your email for verification link.'
                ], 201);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['message' => $e->getMessage()], 500);
            }
        }
    }
}
