<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['title', 'description','created_by','identifier', 'start_date', 'end_date', 'status'])]
class Election extends Model
{
    public function ballots()
    {
        return $this->hasMany(Ballot::class);
    }

    public function voters()
    {
        return $this->hasMany(Voter::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isActive()
    {
        return $this->status === 'active';
    }
    public function status()
    {
        $now = now();

        if ($this->status === 'archived') {
            return 'archived';
        }

        if ($this->status === 'completed') {
            return 'completed';
        }

        if ($this->status === 'paused') {
            return 'paused';
        }

        if ($this->start_date && $now->lt($this->start_date)) {
            return 'upcoming';
        }

        if ($this->end_date && $now->gt($this->end_date)) {
            return 'completed';
        }

        return $this->status;
    }

    public function candidates()
    {
        return $this->hasManyThrough(Option::class, Ballot::class, 'election_id', 'ballot_id');
    }
    public function votes()
    {
        return $this->hasManyThrough(Vote::class, Ballot::class, 'election_id', 'ballot_id');
    }
}
