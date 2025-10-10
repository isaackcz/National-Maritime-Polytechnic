<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnrolledCourse extends Model
{
    public function enrolled_course_certificate() {
        return $this->hasMany(Certificate::class);
    }
    
    public function main_course() {
        return $this->hasOne(MainCourse::class, 'id', 'main_course_id');
    }
}
