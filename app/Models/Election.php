<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

#[Fillable(['title', 'description', 'created_by', 'identifier', 'start_date', 'end_date', 'status', 'leaderboard_on'])]
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

    public function getLeaderboard()
    {
        // Cache for 1 minute to reduce database load
        $cacheKey = "election_{$this->id}_leaderboard";

        return Cache::remember($cacheKey, 60, function () {
            $results = [];

            foreach ($this->ballots as $ballot) {
                $optionVoteCounts = Vote::where('election_id', $this->id)
                    ->where('ballot_id', $ballot->id)
                    ->select('option_id', DB::raw('count(*) as vote_count'))
                    ->groupBy('option_id')
                    ->pluck('vote_count', 'option_id');

                $totalVotesForBallot = $optionVoteCounts->sum();

                $ballotResults = [];

                foreach ($ballot->options as $option) {
                    $voteCount = $optionVoteCounts[$option->id] ?? 0;

                    $ballotResults[] = [
                        'option_id' => $option->id,
                        'option_title' => $option->title,
                        'option_description' => $option->description,
                        'photo_url' => $option->photo_url,
                        'should_display_a_photo' => $option->should_display_a_photo,
                        'vote_count' => $voteCount,
                        'percentage' => $totalVotesForBallot > 0
                            ? round(($voteCount / $totalVotesForBallot) * 100, 2)
                            : 0,
                    ];
                }

                usort($ballotResults, fn($a, $b) => $b['vote_count'] - $a['vote_count']);

                $results[$ballot->id] = [
                    'ballot_id' => $ballot->id,
                    'ballot_title' => $ballot->title,
                    'ballot_type' => $ballot->type,
                    'total_votes' => $totalVotesForBallot,
                    'options' => $ballotResults,
                ];
            }

            return $results;
        });
    }

    // Clear cache when a new vote is cast
    public static function boot()
    {
        parent::boot();

        static::updated(function ($election) {
            Cache::forget("election_{$election->id}_leaderboard");
        });
    }

    public function isLeaderboardVisible()
    {
        // Check if leaderboard is enabled AND election is active/completed
        return $this->leaderboard_on && in_array($this->status, ['active', 'completed']);
    }
}
