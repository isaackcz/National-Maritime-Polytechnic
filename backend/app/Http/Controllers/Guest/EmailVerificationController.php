<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use App\Models\User;

class EmailVerificationController extends Controller
{
  public function verify(Request $request)
    {
        $expires = $request->query('expires');

        if($expires && time() > $expires) {
            User::find($request->query('id'))->delete();
            return response()->json(['message' => 'Verification link has expired.'], 400);
        } else {
            if (!$request->hasValidSignature()) {
            abort(403);
        }

        $user = User::find($request->query('id'));

        if (!$user) {
            abort(404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified'], 400);
        }

        if (!hash_equals((string) $request->query('hash'), sha1($user->getEmailForVerification()))) {
            abort(403);
        }

        $user->markEmailAsVerified();

        event(new Verified($user));

        return response()->json(['message' => 'Email verified successfully']);
        }
}   
}
