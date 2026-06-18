<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ElectionController;
use App\Http\Controllers\BallotController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\VoteController;
use App\Http\Controllers\MailTestingController;
use App\Http\Controllers\OptionController;
use App\Http\Controllers\VoterController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\HelpController;
use App\Http\Controllers\ResultsController;
use App\Http\Controllers\FraudAnalysisController;
use App\Http\Controllers\ResultSubscriptionController;

// Route::inertia('/', 'welcome')->name('home');
Route::get('/', [HomeController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
  Route::inertia('dashboard', 'dashboard')->name('dashboard');




  //Resources
  Route::resource('/elections', ElectionController::class);
  Route::resource('/ballots', BallotController::class);
  Route::resource('/options', OptionController::class);
  Route::resource('/voters', VoterController::class);









  //ELECTIONS
  Route::post('/elections/{election}/ballots', [ElectionController::class, 'storeBallot'])->name('elections.ballots.store');
  Route::post('/elections/{election}/voters', [ElectionController::class, 'storeVoter'])->name('elections.voters.store');
  Route::put('/elections/{electionId}/leaderboard', [ElectionController::class, 'updateLeaderboardStatus'])->name('elections.leaderboard.update');
  Route::post('/elections/{election}/launch', [ElectionController::class, 'launch']);
  Route::post('/elections/{election}/pause',  [ElectionController::class, 'pause']);
  Route::post('/elections/{election}/resume', [ElectionController::class, 'resume']);
  Route::post('/elections/{election}/end',    [ElectionController::class, 'end']);
  Route::post('/elections/{electionId}/voters/import', [ElectionController::class, 'importVoters'])->name('voters.import');
  Route::post('/elections/{electionId}/copy', [ElectionController::class, 'copyElection'])->name('election.copy');

  Route::post('/ballots/{ballot}/options', [BallotController::class, 'storeOption'])->name('ballots.options.store');

  //Voter
  Route::delete('/voters/{voter}', [VoterController::class, 'destroy'])->name('voters.destroy');

  //Calendar
  Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar.index');

  Route::get('/elections/{election}/voters/export', [VoterController::class, 'export'])->name('voters.export');
  Route::get('results', [ResultsController::class, 'index'])->name('results');
  Route::get('/results/{id}', [ResultsController::class, 'show'])->name('results.show');
  Route::get('/results/{id}/export', [ResultsController::class, 'export'])->name('results.export');

  //Fraud-analysis
  Route::get('/fraud-analysis', [FraudAnalysisController::class, 'index'])->name('fraud-analysis.index');
  Route::get('/fraud-analysis/{electionId}', [FraudAnalysisController::class, 'show'])->name('fraud-analysis.show');

  //TESTING ROUTES
  Route::get('email/preview', [MailTestingController::class, 'preview'])->name('email.preview');
});


// Voting routes
Route::get('/vote/{electionIdentifier}', [VoteController::class, 'vote'])->name('elections.vote');
Route::post('/vote/{electionIdentifier}/authenticate', [VoteController::class, 'authenticate'])->name('elections.vote.authenticate');
Route::get('/vote/{electionIdentifier}/home', [VoteController::class, 'voteHome'])->name('elections.vote.home');
Route::post('/vote/{electionIdentifier}/submit', [VoteController::class, 'submitVote'])->name('elections.vote.submit');
Route::get('/vote/{electionIdentifier}/thankyou', [VoteController::class, 'thankYou'])->name('elections.vote.thankyou');

//voters
Route::get('/voters/export', [VoterController::class, 'export'])->name('voters.export');
Route::post('/voters/import', [VoterController::class, 'import'])->name('voters.import');

//HELP
Route::get('/help', [HelpController::class, 'index'])->name('help.index');

//SUBSCRIBE TO RESULTS
Route::post('/subscribe-results', [ResultSubscriptionController::class, 'subscribe'])->name('results.subscribe');
Route::delete('/unsubscribe-results', [ResultSubscriptionController::class, 'unsubscribe'])->name('results.unsubscribe');
Route::get('/check-subscription', [ResultSubscriptionController::class, 'check'])->name('results.check');
//Leaderboard route
Route::get('/leaderboard/{identifier}', [LeaderboardController::class, 'index'])->name('leaderboard.show');
require __DIR__ . '/settings.php';
