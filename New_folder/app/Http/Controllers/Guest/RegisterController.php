<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\URL;
use App\Mail\VerifyEmail;

class RegisterController extends Controller
{
    public function register_user(Request $request) {
       $validations = [
            'fname' => 'required|string',
            'lname' => 'required|string',
            'mname' => 'nullable|string',
            'suffix' => 'nullable|string',
            'email' => 'required|string|email',
            'birthdate' => 'required|date|before:today',
            'password' => ['required', 'confirmed', 'min:6', 'regex:/[a-z]/', 'regex:/[A-Z]/', 'regex:/[0-9]/', 'regex:/[@$!%*#?&]/' ],
            'password_confirmation' => 'required',
        ];

        $validator = \Validator::make($request->all(), $validations);

        if($validator->fails()){
            $errors = $validator->messages()->all();
            return response()->json(['message' => implode(', ', $errors)], 422);
        } else {
            try {
                DB::beginTransaction();

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
                $user->birthdate = $request->birthdate;
                $user->password = bcrypt($request->password);
                $user->save();

                DB::commit();
                
                event(new Registered($user));

                return response()->json([
                    'success' => true,
                    'message' => 'Registration successful! Please check your email for verification link.'
                ], 201);

            } catch (\Exception $e) {
                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage()], 406);
            }
        }
    }
}
