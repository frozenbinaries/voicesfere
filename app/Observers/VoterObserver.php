<?php

namespace App\Observers;

use App\Models\Voter;
use App\Mail\VoterInvitationMail;
use Illuminate\Support\Facades\Mail;

class VoterObserver
{
    /**
     * Handle the Voter "created" event.
     */
    public function created(Voter $voter): void
    {
        $voter = $voter->load('election');
        try {
            Mail::to($voter->email)->queue(new VoterInvitationMail($voter));
        } catch (\Exception $e) {
            // Log the error or handle it as needed
            Mail::to($voter->email)->send(new VoterInvitationMail($voter));
        }
    }

    /**
     * Handle the Voter "updated" event.
     */
    public function updated(Voter $voter): void
    {
        //
    }

    /**
     * Handle the Voter "deleted" event.
     */
    public function deleted(Voter $voter): void
    {
        //
    }

    /**
     * Handle the Voter "restored" event.
     */
    public function restored(Voter $voter): void
    {
        //
    }

    /**
     * Handle the Voter "force deleted" event.
     */
    public function forceDeleted(Voter $voter): void
    {
        //
    }
}
