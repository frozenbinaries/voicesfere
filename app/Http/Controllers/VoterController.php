<?php

namespace App\Http\Controllers;

use App\Models\Voter;
use Illuminate\Http\Request;
use App\Models\Election;

class VoterController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $elections = Election::with('voters')->get();
        return inertia('Voters/Index', ['elections' => $elections]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $elections = Election::all();
        return inertia('Voters/Create', ['elections' => $elections]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Voter $voter)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Voter $voter)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Voter $voter)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Voter $voter)
    {
        Voter::destroy($voter->id);
        return redirect()->back()->with('success', 'Voter deleted successfully.');
    }

    public function export($electionId)
{
    $election = Election::findOrFail($electionId);
    $voters = $election->voters;

    $filename = "voters_{$election->identifier}_{$election->title}.csv";

    $headers = [
        'Content-Type' => 'text/csv',
        'Content-Disposition' => "attachment; filename=\"$filename\"",
    ];

    $callback = function() use ($voters) {
        $file = fopen('php://output', 'w');

        // Add headers
        fputcsv($file, ['Name', 'Email','Voter ID', 'Voter Token', 'Has Voted', 'Invited At', 'Voted At']);

        // Add rows
        foreach ($voters as $voter) {
            fputcsv($file, [
                $voter->name,
                $voter->email,
                $voter->voter_id,
                $voter->voter_token,
                $voter->has_voted ? 'Yes' : 'No',
                $voter->invited_at,
                $voter->voted_at,
            ]);
        }

        fclose($file);
    };

    return response()->stream($callback, 200, $headers);
}
}
