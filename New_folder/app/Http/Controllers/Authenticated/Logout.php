<?php

namespace App\Http\Controllers\Authenticated;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class Logout extends Controller
{
    public function logout_user(Request $request) {
        if(Auth::check() && $request->user()) {
            Auth::logout();
            $request->user()->logout();
        }
    }
}
