<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
     public function enrolled_course_certificates() {
        return $this->belongsTo(MainCertificate::class);
    }
}
