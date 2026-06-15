<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['name','slug','description','price','currency','min_voters','max_voters','status'])]
class Plan extends Model
{
    public function subscriptions(){
        return $this->hasMany(Subscription::class);
    }
}
