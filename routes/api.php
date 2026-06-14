<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Election;
use App\Http\Controllers\LeaderboardController;
use Inertia\Inertia;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::get('/leaderboard/{identifier}', function ($identifier) {
    $election = Election::where('identifier', $identifier)
        ->with(['ballots.options', 'votes'])
        ->firstOrFail();

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

    return response()->json([
        'leaderboard' => $election->getLeaderboard(),
        'last_updated' => now(),
    ]);
});

Route::get('/leaderboard/{identifier}', [LeaderboardController::class, 'apiData']);
