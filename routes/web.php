<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ElectionController;
use App\Http\Controllers\BallotController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\VoteController;
use App\Http\Controllers\MailTestingController;
use App\Http\Controllers\OptionController;
use App\Http\Controllers\VoterController;

// Route::inertia('/', 'welcome')->name('home');
Route::get('/', [HomeController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');




    //Resources
    Route::resource('/elections', ElectionController::class);
    Route::resource('/ballots', BallotController::class);
    Route::resource('/options', OptionController::class);
    Route::resource('/voters', VoterController::class);









    //OTHER ROUTES
    Route::post('/elections/{election}/ballots', [ElectionController::class, 'storeBallot'])->name('elections.ballots.store');
    Route::post('/elections/{election}/voters', [ElectionController::class, 'storeVoter'])->name('elections.voters.store');
    Route::post('/ballots/{ballot}/options', [BallotController::class, 'storeOption'])->name('ballots.options.store');

    //Voter
    Route::delete('/voters/{voter}', [VoterController::class, 'destroy'])->name('voters.destroy');

    Route::get('email/preview', [MailTestingController::class, 'preview'])->name('email.preview');
});


// Voting routes
Route::get('/vote/{electionIdentifier}', [VoteController::class, 'vote'])->name('elections.vote');
Route::post('/vote/{electionIdentifier}/authenticate', [VoteController::class, 'authenticate'])->name('elections.vote.authenticate');
Route::get('/vote/{electionIdentifier}/home', [VoteController::class, 'voteHome'])->name('elections.vote.home');
Route::post('/vote/{electionIdentifier}/submit', [VoteController::class, 'submitVote'])->name('elections.vote.submit');
Route::get('/vote/{electionIdentifier}/thankyou', [VoteController::class, 'thankYou'])->name('elections.vote.thankyou');


require __DIR__ . '/settings.php';
