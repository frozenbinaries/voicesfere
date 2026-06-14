<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['option_id', 'rating', 'text_response', 'voter_id', 'ballot_id', 'election_id', 'metadata', 'ip_address', 'voter_token', 'rank'])]
class Vote extends Model
{
    public function option()
    {
        return $this->belongsTo(Option::class);
    }

    public function voter()
    {
        return $this->belongsTo(Voter::class);
    }

    public function ballot()
    {
        return $this->belongsTo(Ballot::class);
    }

    public function election()
    {
        return $this->belongsTo(Election::class);
    }

    protected $casts = [
        'metadata' => 'array',
    ];
}
