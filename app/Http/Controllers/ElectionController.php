<?php

namespace App\Http\Controllers;

use App\Models\Election;
use App\Models\Option;
use App\Models\Voter;
use App\Models\Ballot;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ElectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $allElections = Election::with('candidates', 'ballots')->latest()->get();
        return inertia('Elections/Index', ['allElections' => $allElections]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia('Elections/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        $validated['created_by'] = auth()->id();
        $validated['identifier'] = Str::uuid();
        Election::create($validated);

        return redirect()->back()->with('success', 'Election created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Election $election)
    {
        $election = Election::with('candidates', 'ballots.options', 'voters','votes')->find($election->id);
        return inertia('Elections/Show', ['election' => $election]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Election $election)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Election $election)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Election $election)
    {
        Election::destroy($election->id);
        return redirect()->back()->with('success', 'Election deleted successfully.');
    }

    public function storeBallot(Request $request, Election $election)
    {
        // return $request->all();
        $ballot = new Ballot($request->all());
        $ballot->election_id = $election->id;
        $ballot->save();

        // return redirect()->route('elections.show', $election);
    }

    public function storeVoter(Request $request, Election $election)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('voters')->where(function ($query) use ($election) {
                    return $query->where('election_id', $election->id);
                }),
            ],
        ]);

        // Check if voter already exists for this election
        $existingVoter = Voter::where('email', $validated['email'])
            ->where('election_id', $election->id)
            ->first();

        if ($existingVoter) {
            return redirect()->back()->withErrors([
                'email' => 'This voter has already been added to this election.'
            ])->withInput();
        }

        $voter = new Voter();
        $voter->election_id = $election->id;
        $voter->name = $validated['name'];
        $voter->email = $validated['email'];
        $voter->voter_token = $this->generateUniqueVoterKey();
        $voter->invited_at = now();
        $voter->save();

        // Send invitation email
        // Mail::to($voter->email)->send(new VoterInvitation($voter, $election));

        return redirect()->back()->with('success', 'Voter added successfully!');
    }



    public function generateUniqueVoterKey()
    {
        do {
            $key = strtoupper(Str::random(8)); // Generates 8 character random string
        } while (Voter::where('voter_token', $key)->exists());

        return $key;
    }
}
