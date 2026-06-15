<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['election_id', 'plan_id', 'status', 'expires_at', 'amount_paid', 'payment_method', 'transaction_id'])]
class Subscription extends Model
{
    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function election()
    {
        return $this->belongsTo(Election::class);
    }
}
