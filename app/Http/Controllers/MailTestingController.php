<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Mail\VoterInvitationMail;
use App\Models\Voter;

class MailTestingController extends Controller
{
    public function preview()
    {
        // $c = Voter::create([
        //     'name' => 'Numeri Kachamba',
        //     'email' => 'numerikachamba@outlook.com',
        //     'election_id' => 2, // Assuming you have an election with ID 1
        //     'voter_token' => '123hYT45Q',
        //     'has_voted' => false,
        //     'invited_at' => now(),
        // ]);
        // if (!$c) {
        //     return 'Failed to create voter for testing.';
        // }
        $voter = Voter::first()->load('election');
        return new VoterInvitationMail($voter);
    }
}
