<?php

namespace App\Http\Controllers;

use App\Models\Election;
use App\Models\Voter;
use App\Models\Vote;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use App\Services\FraudDetectionService;

class VoteController extends Controller
{
    protected $fraudDetection;
    public function __construct(FraudDetectionService $fraudDetection)
    {
        $this->fraudDetection = $fraudDetection;
    }

    public function vote($electionIdentifier)
    {
        // Find the election by identifier
        $election = Election::where('identifier', $electionIdentifier)
            ->with(['ballots.options'])
            ->firstOrFail();

        // Check if election is active
        $now = now();
        $startDate = $election->start_date ? new \DateTime($election->start_date) : null;
        $endDate = $election->end_date ? new \DateTime($election->end_date) : null;

        if ($election->status !== 'active') {
            return inertia('Votes/ElectionNotActive', [
                'election' => $election,
                'message' => 'This election is not currently active.'
            ]);
        }

        if ($startDate && $now < $startDate) {
            return inertia('Votes/ElectionNotActive', [
                'election' => $election,
                'message' => 'This election has not started yet. It will begin on ' . $startDate->format('F j, Y g:i A')
            ]);
        }

        if ($endDate && $now > $endDate) {
            return inertia('Votes/ElectionNotActive', [
                'election' => $election,
                'message' => 'This election has ended.'
            ]);
        }

        // Show voter key login page
        return inertia('Votes/VoterKeyLogin', [
            'election' => $election
        ]);
    }

    public function authenticate(Request $request, $electionIdentifier)
    {


        $election = Election::where('identifier', $electionIdentifier)->firstOrFail();

        $validated = $request->validate([
            'voter_key' => 'required|string'
        ]);

        // Find voter by voter_key
        $voter = Voter::where('voter_token', $validated['voter_key'])
            ->where('election_id', $election->id)
            ->first();

        if (!$voter) {
            $this->fraudDetection->recordInvalidToken($election, $request, $validated['voter_key']);
            return back()->withErrors([
                'voter_key' => 'Invalid voter key. Please check and try again.'
            ]);
        }

        // Check if voter has already voted
        if ($voter->has_voted) {
            $this->fraudDetection->recordDuplicateVote($voter, $election, $request);
            return inertia('Votes/AlreadyVoted', [
                'election' => $election,
                'voter' => $voter
            ]);
        }

        // Store voter in session
        session(['voter_token' => $voter->voter_token]);
        session(['voter_id' => $voter->id]);
        session(['election_id' => $election->id]);

        // Redirect to voting page
        return redirect()->route('elections.vote.home', $election->identifier);
    }

    public function voteHome($electionIdentifier, Request $request)
    {
        // Check if voter is authenticated
        if (!session('voter_token')) {
            $election = Election::where('identifier', $electionIdentifier)->firstOrFail();
            $this->fraudDetection->recordBypassAttempt($election, $request);
            return redirect()->route('elections.vote', $electionIdentifier);
        }

        $election = Election::where('identifier', $electionIdentifier)
            ->with([
                'ballots' => function ($query) {
                    // Order ballots by creation date (oldest first)
                    $query->orderBy('created_at', 'asc')
                        ->with(['options' => function ($query) {
                            // Order options within each ballot
                            $query->orderBy('display_order', 'asc')
                                ->orderBy('created_at', 'asc');
                        }]);
                }
            ])
            ->firstOrFail();

        $voter = Voter::where('voter_token', session('voter_token'))->first();

        return inertia('Votes/VoteHome', [
            'election' => $election,
            'voter' => $voter
        ]);
    }

    public function submitVote(Request $request, $electionIdentifier)
    {
        if (!session('voter_token')) {
            return redirect()->route('elections.vote', $electionIdentifier);
        }

        $election = Election::where('identifier', $electionIdentifier)->firstOrFail();
        $voter    = Voter::where('voter_token', session('voter_token'))->first();

        if (!$voter || $voter->has_voted) {
            return redirect()->route('elections.vote', $electionIdentifier);
        }

        $validated = $request->validate([
            'votes'              => 'required|array',
            'votes.*.ballot_id'  => 'required|exists:ballots,id',
            'votes.*.type'       => 'required|in:single_choice,multiple_choice,ranked_choice,rating,text',

            // single_choice / multiple_choice
            'votes.*.option_ids'   => 'nullable|array',
            'votes.*.option_ids.*' => 'exists:options,id',

            // ranked_choice
            'votes.*.rankings'           => 'nullable|array',
            'votes.*.rankings.*.optionId' => 'exists:options,id',
            'votes.*.rankings.*.rank'     => 'integer|min:1',

            // rating
            'votes.*.option_id' => 'nullable|exists:options,id',
            'votes.*.rating'    => 'nullable|integer|min:1',

            // text
            'votes.*.response_text' => 'nullable|string|max:5000',
        ]);

        foreach ($validated['votes'] as $voteData) {
            $type    = $voteData['type'];
            $baseRow = [
                'voter_token' => $voter->voter_token,
                'election_id' => $election->id,
                'ballot_id'   => $voteData['ballot_id'],
                'ip_address'  => $request->ip(),
                'user_agent'  => $request->userAgent(),
                'metadata' => [
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'timestamp' => now()->toIso8601String(),
                    'method' => $request->method(),
                    'url' => $request->fullUrl(),
                    'headers' => $request->headers->all(),
                ]
            ];

            switch ($type) {
                case 'single_choice':
                case 'multiple_choice':
                    // One Vote row per selected option
                    foreach ($voteData['option_ids'] ?? [] as $optionId) {
                        Vote::create(array_merge($baseRow, [
                            'option_id' => $optionId,
                        ]));
                    }
                    break;

                case 'ranked_choice':
                    // One Vote row per option, carrying its rank
                    foreach ($voteData['rankings'] ?? [] as $ranking) {
                        Vote::create(array_merge($baseRow, [
                            'option_id' => $ranking['optionId'],
                            'rank'      => $ranking['rank'],
                        ]));
                    }
                    break;

                case 'rating':
                    // One row: the chosen option + the star rating
                    Vote::create(array_merge($baseRow, [
                        'option_id' => $voteData['option_id'] ?? null,
                        'rating'    => $voteData['rating']    ?? null,
                    ]));
                    break;

                case 'text':
                    // One row: the chosen option + the written response
                    Vote::create(array_merge($baseRow, [
                        'option_id'     => $voteData['option_id']     ?? null,
                        'text_response' => $voteData['response_text'] ?? null,
                    ]));
                    break;
            }
        }

        $voter->update([
            'has_voted' => true,
            'voted_at'  => now(),
        ]);

        session()->forget(['voter_token', 'voter_id', 'election_id']);

        return redirect()->route('elections.vote.thankyou', $election->identifier);
    }

    public function thankYou($electionIdentifier)
    {
        return inertia('Votes/ThankYou', [
            'electionIdentifier' => $electionIdentifier
        ]);
    }

    public function preview($electionIdentifier, Request $request)
    {
        $election = Election::where('identifier', $electionIdentifier)
            ->with([
                'ballots' => function ($query) {
                    // Order ballots by creation date (oldest first)
                    $query->orderBy('created_at', 'asc')
                        ->with(['options' => function ($query) {
                            // Order options by display_order or created_at
                            $query->orderBy('display_order', 'asc');
                        }]);
                }
            ])
            ->firstOrFail();

        return inertia('Votes/VoteHome', [
            'election' => $election,
            'voter' => Auth()->user(),
            'isPreview' => true,
        ]);
    }
}
