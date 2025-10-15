<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DormitoryTenant extends Model
{
        public function tenant() {
            return $this->hasOne(User::class, 'id', 'user_id');
        }

        public function dormitory_room() {
            return $this->belongsTo(DormitoryRoom::class, 'dormitory_room_id', 'id');
        }
        public function tenant_invoices() {
            return $this->hasMany(DormitoryInvoice::class);
        }
        
        // public function current_tenant_invoices() {
        //     return $this->tenant_invoices()->orderBy('id','desc')->first();
        // }
}
