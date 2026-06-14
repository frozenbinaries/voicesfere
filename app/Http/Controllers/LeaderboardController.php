<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Election;
use Inertia\Inertia;

class LeaderboardController extends Controller
{
    // Web route (returns Inertia page)
    public function index(string $identifier)
    {
        $election = Election::where('identifier', $identifier)
            ->with(['ballots.options'])
            ->first();

        if (!$election) {
            abort(404);
        }

        if (!$election->leaderboard_on) {
            return Inertia::render('Leaderboard/LeaderboardOff', [
                'election' => [
                    'id' => $election->id,
                    'title' => $election->title,
                    'identifier' => $election->identifier,
                    'status' => $election->status,
                ],
                'message' => 'Leaderboard is not available for this election.',
            ]);
        }

        return Inertia::render('Leaderboard/Leaderboard', [
            'election' => [
                'id' => $election->id,
                'title' => $election->title,
                'description' => $election->description,
                'identifier' => $election->identifier,
                'status' => $election->status,
                'start_date' => $election->start_date,
                'end_date' => $election->end_date,
            ],
            'leaderboard' => $election->getLeaderboard(),
        ]);
    }

    // API route (returns JSON only)
    public function apiData(string $identifier)
    {
        $election = Election::where('identifier', $identifier)
            ->with(['ballots.options'])
            ->first();

        if (!$election) {
            return response()->json(['error' => 'Election not found'], 404);
        }

        if (!$election->leaderboard_on) {
            return response()->json(['error' => 'Leaderboard not available'], 403);
        }

        return response()->json([
            'leaderboard' => $election->getLeaderboard(),
            'last_updated' => now()->toIso8601String(),
        ]);
    }
}
