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
        return $this->belongsTo(GeneralInformation::class, "general_information_id", "id");
    }
    public function contact() {
        return $this->belongsTo(Contact::class, "contact_id","id");
    }
    public function trainee_registration_file() {
        return $this->belongsTo(TrainingRegFile::class, "training_reg_file_id", "id");
    }
    public function educational_attainment() {
        return $this->belongsTo(EducationalAttainment::class, "educational_attainment_id", "id");
    }
    public function latest_shipboard_attainment() {
        return $this->belongsTo(LatestSBExp::class, "latest_s_b_exp_id", "id");
    }
}
