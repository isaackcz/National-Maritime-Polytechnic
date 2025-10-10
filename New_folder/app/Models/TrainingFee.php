<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingFee extends Model
{
    use HasFactory;

    public function hasData() {
        return $this->hasMany(Training::class);
    }
}
