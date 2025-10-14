<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DormitoryTenant extends Model
{
        public function tenant() {
            return $this->hasOne(User::class, 'id', 'user_id');
        }

        public function tenant_invoices() {
            return $this->hasMany(DormitoryInvoice::class);
        }
}
