<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Training extends Model
{
    use HasFactory;

    public function hasData() {
        return $this->hasMany(EnrolledCourse::class);
    }

    public function module() {
        return $this->hasOne(CourseModule::class, 'id', 'course_module_id');
    }
}
