<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DormitoryRoom extends Model
{
    public function tenants() {
        return $this->hasMany(DormitoryTenant::class);
    }
}
