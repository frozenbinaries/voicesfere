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


    public function subscription()
    {
        return $this->hasOne(Subscription::class);
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

    public function getResults()
    {
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

            // Mark winners
            if (!empty($ballotResults)) {
                $maxVotes = $ballotResults[0]['vote_count'];
                foreach ($ballotResults as &$result) {
                    $result['is_winner'] = $result['vote_count'] == $maxVotes && $maxVotes > 0;
                }
            }

            $results[$ballot->id] = [
                'ballot_id' => $ballot->id,
                'ballot_title' => $ballot->title,
                'ballot_type' => $ballot->type,
                'total_votes' => $totalVotesForBallot,
                'options' => $ballotResults,
            ];
        }

        return $results;
    }

    /**
     * Get election statistics
     */
    // app/Models/Election.php - Updated getStatistics() method
    public function getStatistics()
    {
        $totalVoters = $this->voters()->count();

        // Count unique voters who have voted (not total votes)
        $totalVotersWhoVoted = Vote::where('election_id', $this->id)
            ->distinct('voter_token')
            ->count('voter_token');

        // OR if you have voter_id in votes table:
        // $totalVotersWhoVoted = Vote::where('election_id', $this->id)
        //     ->distinct('voter_id')
        //     ->count('voter_id');

        return [
            'total_voters' => $totalVoters,
            'total_votes_cast' => Vote::where('election_id', $this->id)->count(), // Total votes across all ballots
            'voters_who_voted' => $totalVotersWhoVoted, // Unique voters who voted
            'turnout' => $totalVoters > 0
                ? round(($totalVotersWhoVoted / $totalVoters) * 100, 2)
                : 0,
            'ballots_count' => $this->ballots()->count(),
            'candidates_count' => $this->ballots->reduce(function ($total, $ballot) {
                return $total + $ballot->options->count();
            }, 0),
        ];
    }
}
