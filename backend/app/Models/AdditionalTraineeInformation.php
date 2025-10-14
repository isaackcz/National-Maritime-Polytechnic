<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdditionalTraineeInformation extends Model
{
    use HasFactory;

    public function user() {
        return $this->belongsTo(User::class);
    }
    public function general_info() {
        return $this->belongsTo(GeneralInformation::class);
    }
    public function contact_person() {
        return $this->belongsTo(ContactPerson::class);
    }
    public function trainee_registration_file() {
        return $this->belongsTo(TrainingRegFile::class);
    }
    public function educational_attainment() {
        return $this->belongsTo(EducationalAttainment::class);
    }
    public function latest_shipboard_attainment() {
        return $this->belongsTo(LatestSBExp::class);
    }
}
