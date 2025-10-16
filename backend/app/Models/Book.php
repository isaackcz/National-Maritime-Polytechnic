<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    public function hasData() {
        return $this->hasMany(BookReservation::class);
    }

    public function category() {
        return $this->hasOne(BookCategory::class, 'id', 'book_category_id');
    }
}
