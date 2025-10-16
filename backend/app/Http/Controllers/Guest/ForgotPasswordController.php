<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Http;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;
use App\Models\User;

class ForgotPasswordController extends Controller
{
    public function forgotPassword(Request $request) {
        $request->validate(['email' => 'required|email', 'google_captcha' => 'required']);

        $response = Http::get("https://www.google.com/recaptcha/api/siteverify", [
            'secret' => env('GOOGLE_RECAPTCHA_SECRET_KEY'),
            'response' => $request->google_captcha,
        ]);

        if($response->successful()) {
            $status = Password::sendResetLink($request->only('email'));

            return $status === Password::RESET_LINK_SENT
                ? response()->json(['status' => 'success', 'message' => __($status)])
                : response()->json(['status' => 'error', 'message' => __($status)]);
        } else {
            return response()->json(['message' => $response->status()], 500); 
        }
    }

    public function resetPassword(Request $request) {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required_with:password_confirmation', 'min:8', 'regex:/[a-z]/', 'regex:/[A-Z]/', 'regex:/[0-9]/', 'regex:/[@$!%*#?&]/'],
            'password_confirmation' => 'same:password',
            'google_captcha' => 'required'
        ]);

        $response = Http::get("https://www.google.com/recaptcha/api/siteverify", [
            'secret' => env('GOOGLE_RECAPTCHA_SECRET_KEY'),
            'response' => $request->google_captcha,
        ]);

        if($response->successful()) {
            $status = Password::reset(
                $request->only('email', 'password', 'password_confirmation', 'token'), function (User $user, string $password) use ($request) {
                    $user->forceFill([ 'password' => bcrypt($password) ])->setRememberToken(Str::random(60));
                    $user->save();

                    event(new PasswordReset($user));
                }
            );

            return $status == Password::PASSWORD_RESET
                ? response()->json(['status' => 'success', 'message' => __($status)])
                : response()->json(['status' => 'error', 'message' => __($status)]);
        } else {
            return response()->json(['message' => $response->status()], 500); 
        }
    }
}
