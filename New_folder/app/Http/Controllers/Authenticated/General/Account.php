<?php

namespace App\Http\Controllers\Authenticated\General;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\{
    DB,
    Hash
};
use App\Mail\UpdatePassword;
use App\Models\{
    User,
    DormitoryRoom,
    AuditTrail
};

class Account extends Controller
{
    public function base64ToPng($base64String, $filename)
    {
        $base64String = preg_replace('/^data:image\/\w+;base64,/', '', $base64String);
        $decodedString = base64_decode($base64String, true);

        if ($decodedString === false) {
            throw new Exception('Base64 decoding failed');
        }

        $filePath = public_path('user_images/' . $filename);

        if (!file_put_contents($filePath, $decodedString)) {
            throw new Exception('Failed to save image');
        }

        return $filePath;
    }

    public function get_activities (Request $request) {
        try {
            $activities = AuditTrail::where('user_id', $request->user()->id)->orderBy('created_at', 'DESC')->get();
            return response()->json([ 'activities' => $activities], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /** applicable only for admins */
    public function update_personal(Request $request) {
        DB::beginTransaction();

        $validation = [
            'firstName' => 'required|string',
            'middleName' => 'string',
            'lastName' => 'required|string',
            'birthdate' => 'required|date|before:today',
            'email' => 'required|email|unique:users,email,' . $request->user()->id,
        ];

        $validator = \Validator::make($request->all(), $validation);

        if($validator->fails()) {
            $errors = $validator->messages()->all();
            return response()->json(['message' => implode(', ', $errors)], 422);
        } else {
            try {
                $reloggin = false;
                $user = User::findOrFail($request->user()->id);

                $user->fname = $request->firstName;
                $user->mname = $request->middleName;
                $user->lname = $request->lastName;
                $user->suffix = $request->suffix;
                $user->birthdate = $request->birthdate;

                if($user->email !== $request->email) {
                    $random_password = strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
                    $user->password = bcrypt($random_password);

                    \Mail::to($request->email)->send(new UpdatePassword(['password' => $random_password]));
                    $reloggin = true;
                }

                $user->email = $request->email;

                if($request->avatar){
                    if(($request->avatar !== $user->profile_picture) && $user->profile_picture !== 'default-avatar.png') {
                        if(file_exists(public_path('user-images/' . $user->profile_picture))){
                            unlink(public_path('user-images/' . $user->profile_picture));
                        }
                    }

                    $image_name = Str::uuid() . '.png';
                    $this->base64ToPng($request->avatar, $image_name);
                    $user->profile_picture = $image_name;
                }

                $user->save();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've updated your account personal information.";
                $new_log->save();

                DB::commit();
                return response()->json([
                    'message' => "You've updated your account personal information.",
                    'reloggin' => $reloggin
                ], 200);
            } catch (\Exception $e) {
                DB::rollback();
                return response()->json(['message' => $e->getMessage()], 500);
            }
        }
    }

    public function update_password(Request $request){
        DB::beginTransaction();

        $validation = [
            'current_password' => 'required',
            'password' => ['required', 'confirmed', 'min:6', 'regex:/[a-z]/', 'regex:/[A-Z]/', 'regex:/[0-9]/', 'regex:/[@$!%*#?&]/' ],
            'password_confirmation' => 'required',
        ];

        $validator = \Validator::make($request->all(), $validation);

        if ($validator->fails()) {
            $errors = $validator->messages()->all();
            return response()->json(['message' => implode(', ', $errors)], 422);
        } else {
            try {
                $user = User::findOrFail($request->user()->id);

                if (!Hash::check($request->current_password, $user->password)) {
                    return response()->json(['message' => 'Current password is incorrect'], 401);
                }

                $user->password = bcrypt($request->password);
                $user->save();

                $new_log = new AuditTrail;
                $new_log->user_id = $request->user()->id;
                $new_log->actions = "You've updated your account password.";
                $new_log->save();

                DB::commit();

                return response()->json([
                    'message' => 'Password changed successfully',
                    'reloggin' => true
                ]);
            } catch (\Exception $e) {
                DB::rollback();
                return response()->json(['message' => $e->getMessage()], 500);
            }
        }
    }
}
