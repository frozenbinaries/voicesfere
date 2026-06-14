<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['ballot_id', 'title', 'should_display_a_photo', 'photo_url', 'description', 'display_order'])]
class Option extends Model
{
    public function ballot()
    {
        return $this->belongsTo(Ballot::class);
    }

    public function votes()
    {
        return $this->hasMany(Vote::class);
    }
}
