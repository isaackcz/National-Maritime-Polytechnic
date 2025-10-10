<?php

namespace App\Http\Controllers\Authenticated\Trainee;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use App\Models\DormitoryRoom;

class TraineeDormitory extends Controller
{

    public function get_all_dormitories(Request $request) {
        $dormitories = DormitoryRoom::withCount(['tenants'])->get();
        return response()->json(['dormitories' => $dormitories], 200);
    }
    
    public function get_personal_dormitory(Request $request) {
        try {
            $trainee_dormitories = User::with([
                'trainee_dormitory
            '])->where('id', $request->user()->id)->get();

            return response()->json(['trainee_dormitories' => $trainee_dormitories]);
        } catch (\Exception $e) {
            return response()->json(["error"=> $e->getMessage()], 500);
        }
    }
}

