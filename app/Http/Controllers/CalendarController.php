<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Election;
use Inertia\Inertia;

class CalendarController extends Controller
{
     public function index()
    {
        $elections = Election::where('created_by', auth()->id())
            ->withCount(['ballots', 'voters'])
            ->orderBy('start_date', 'asc')
            ->get();

        return Inertia::render('Calendar/Index', [
            'elections' => $elections,
        ]);
    }
}
