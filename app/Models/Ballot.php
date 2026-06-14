<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['election_id', 'title', 'description','display_order', 'max_selections', 'min_selections', 'is_active', 'randomize_options', 'type'])]
class Ballot extends Model
{
    public function election()
    {
        return $this->belongsTo(Election::class);
    }

    public function options()
    {
        return $this->hasMany(Option::class)->orderBy('display_order');
    }
}
