<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EducationalAttainment extends Model
{
    public function main_course() {
        return $this->belongsTo(MainCourse::class, );
    }
}
