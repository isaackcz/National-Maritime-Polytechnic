<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MainCertificate extends Model
{
    public function hasData() {
        return $this->hasMany(TrainingReceivableCertificate::class);
    }
}
