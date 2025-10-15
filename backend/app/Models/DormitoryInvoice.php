<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DormitoryInvoice extends Model
{
    public function tenant() {
        return $this->hasOne(User::class, 'id', 'user_id');
    }
}
