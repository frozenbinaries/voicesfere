<?php

namespace App\Http\Controllers;

use App\Models\Election;
use App\Models\Option;
use App\Models\Voter;
use App\Models\Ballot;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
        $plans = Plan::all();
        $election = Election::with('candidates', 'ballots.options', 'voters', 'votes', 'subscription.plan')->find($election->id);
        return inertia('Elections/Show', ['election' => $election, 'plans' => $plans]);
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
            'voter_id' => 'nullable|string|max:255',
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('voters')->where(function ($query) use ($election) {
                    return $query->where('election_id', $election->id);
                })->ignore(null, 'email'), // Allow multiple null emails
            ],
        ]);


        // Check if at least one identifier is provided
        if (empty($validated['voter_id']) && empty($validated['email'])) {
            return redirect()->back()->withErrors([
                'email' => 'Either Email or Voter ID is required.',
                'voter_id' => 'Either Email or Voter ID is required.'
            ])->withInput();
        }

        // Check if voter already exists for this election by email OR voter_id
        $existingVoter = Voter::where('election_id', $election->id)
            ->where(function ($query) use ($validated) {
                if (!empty($validated['email'])) {
                    $query->where('email', $validated['email']);
                }
                if (!empty($validated['voter_id'])) {
                    $query->orWhere('voter_id', $validated['voter_id']);
                }
            })
            ->first();

        if ($existingVoter) {
            $errorField = $existingVoter->email === $validated['email'] ? 'email' : 'voter_id';
            $errorMessage = $existingVoter->email === $validated['email']
                ? 'This email is already registered for this election.'
                : 'This Voter ID is already registered for this election.';

            return redirect()->back()->withErrors([
                $errorField => $errorMessage
            ])->withInput();
        }

        $voter = new Voter();
        $voter->election_id = $election->id;
        $voter->name = $validated['name'];
        $voter->voter_id = $validated['voter_id'] ?? null;
        $voter->email = $validated['email'] ?? null;
        $voter->voter_token = $this->generateUniqueVoterKey();
        $voter->invited_at = now();
        $voter->save();

        // Send invitation email (only if email exists)
        if ($voter->email) {
            // Mail::to($voter->email)->send(new VoterInvitation($voter, $election));
        }

        return redirect()->back()->with('success', 'Voter added successfully!');
    }



    public function importVoters(Request $request, $electionId)
    {
        // Validate the request
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240', // Max 10MB
        ]);

        // Find the election
        $election = Election::findOrFail($electionId);

        // Read CSV file
        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');

        if (!$handle) {
            return back()->withErrors([
                'file' => 'Unable to read the CSV file. Please try again.'
            ]);
        }

        // Get headers
        $headers = fgetcsv($handle);

        if (!$headers) {
            fclose($handle);
            return back()->withErrors([
                'file' => 'The CSV file is empty or invalid.'
            ]);
        }

        // Normalize headers to lowercase
        $headers = array_map('strtolower', $headers);

        // Validate required headers
        $requiredHeaders = ['name'];
        $missingHeaders = array_diff($requiredHeaders, $headers);

        if (!empty($missingHeaders)) {
            fclose($handle);
            return back()->withErrors([
                'file' => 'CSV must contain "name" column. Missing: ' . implode(', ', $missingHeaders)
            ]);
        }

        // Map column indexes
        $nameIndex = array_search('name', $headers);
        $voterIdIndex = array_search('voter_id', $headers);
        $emailIndex = array_search('email', $headers);

        $imported = 0;
        $errors = [];
        $rowNumber = 1;

        // Begin transaction
        DB::beginTransaction();

        try {
            while (($row = fgetcsv($handle)) !== false) {
                $rowNumber++;

                // Skip empty rows
                if (empty(array_filter($row, function ($value) {
                    return !is_null($value) && trim($value) !== '';
                }))) {
                    continue;
                }

                // Extract data
                $name = isset($row[$nameIndex]) ? trim($row[$nameIndex]) : null;
                $voterId = ($voterIdIndex !== false && isset($row[$voterIdIndex]))
                    ? trim($row[$voterIdIndex])
                    : null;
                $email = ($emailIndex !== false && isset($row[$emailIndex]))
                    ? trim($row[$emailIndex])
                    : null;

                // Validate row data
                if (empty($name)) {
                    $errors[] = "Row {$rowNumber}: Name is required";
                    continue;
                }

                if (empty($voterId) && empty($email)) {
                    $errors[] = "Row {$rowNumber}: Either Voter ID or Email is required";
                    continue;
                }

                if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $errors[] = "Row {$rowNumber}: Invalid email format: {$email}";
                    continue;
                }

                // Check for duplicates
                if (!empty($voterId)) {
                    $existingVoterId = Voter::where('election_id', $electionId)
                        ->where('voter_id', $voterId)
                        ->exists();

                    if ($existingVoterId) {
                        $errors[] = "Row {$rowNumber}: Voter ID '{$voterId}' already exists";
                        continue;
                    }
                }

                if (!empty($email)) {
                    $existingEmail = Voter::where('election_id', $electionId)
                        ->where('email', $email)
                        ->exists();

                    if ($existingEmail) {
                        $errors[] = "Row {$rowNumber}: Email '{$email}' already exists";
                        continue;
                    }
                }

                // Create voter
                try {
                    Voter::create([
                        'election_id' => $electionId,
                        'name' => $name,
                        'voter_id' => $voterId,
                        'email' => $email,
                        'voter_token' => $this->generateUniqueVoterKey(),
                        'has_voted' => false,
                        'invited_at' => null,
                        'voted_at' => null,
                    ]);
                    $imported++;
                } catch (\Exception $e) {
                    $errors[] = "Row {$rowNumber}: Failed to create voter - " . $e->getMessage();
                }
            }

            fclose($handle);

            // If there were errors, rollback
            if (!empty($errors)) {
                DB::rollBack();

                $errorMessage = "Imported 0 voters. Errors:\n" . implode("\n", array_slice($errors, 0, 10));
                if (count($errors) > 10) {
                    $errorMessage .= "\n... and " . (count($errors) - 10) . " more errors";
                }

                return back()->withErrors(['file' => $errorMessage]);
            }

            DB::commit();
            return back()->with('success', "Successfully imported {$imported} voters!");
        } catch (\Exception $e) {
            DB::rollBack();

            if (isset($handle) && is_resource($handle)) {
                fclose($handle);
            }

            Log::error('Import error: ' . $e->getMessage(), [
                'election_id' => $electionId,
                'file' => $file->getClientOriginalName()
            ]);

            return back()->withErrors([
                'file' => 'Failed to import voters: ' . $e->getMessage()
            ]);
        }
    }





    public function updateLeaderboardStatus(Request $request, $electionId)
    {
        $election = Election::findOrFail($electionId);
        $election->leaderboard_on = $request->input('leaderboard_on', false);
        $election->save();

        return redirect()->back()->with('success', 'Leaderboard status updated successfully.');
    }

    public function launch($electionId)
    {
        Election::findOrFail($electionId)->update([
            'status' => 'active'
        ]);

        return redirect()->back()->with('success', 'Election launched successfully');
    }

    public function pause(Election $election)
    {
        $election->update(['status' => 'paused']);
        return back();
    }

    public function resume(Election $election)
    {
        $election->update(['status' => 'active']);
        return back();
    }

    public function end(Election $election)
    {
        $election->update(['status' => 'completed']);
        return back();
    }


    public function copyElection(Request $request, $electionId)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'copy_ballots' => 'boolean',
            'copy_options' => 'boolean',
            'copy_voters' => 'boolean',
        ]);

        $original = Election::with(['ballots.options', 'voters'])->findOrFail($electionId);

        DB::beginTransaction();

        try {
            // Determine the new title
            $newTitle = $request->input('title')
                ? $request->input('title')
                : $original->title . ' (Copy)';

            // 1. Copy the election
            $copy = Election::create([
                'title' => $newTitle,
                'description' => $original->description,
                'status' => 'draft',
                'start_date' => null,
                'end_date' => null,
                'identifier' => Str::uuid(),
                'settings' => $original->settings,
                'is_leaderboard_public' => false,
                'created_by' => auth()->id(),
            ]);

            // 2. Copy ballots and options based on user selection
            if ($request->input('copy_ballots', true)) {
                foreach ($original->ballots as $originalBallot) {
                    $newBallot = $copy->ballots()->create([
                        'title' => $originalBallot->title,
                        'description' => $originalBallot->description,
                        'type' => $originalBallot->type,
                        'settings' => $originalBallot->settings,
                        'display_order' => $originalBallot->display_order,
                        'is_required' => $originalBallot->is_required,
                        'max_selections' => $originalBallot->max_selections,
                        'min_selections' => $originalBallot->min_selections,
                    ]);

                    // 3. Copy options only if user wants them
                    if ($request->input('copy_options', true)) {
                        foreach ($originalBallot->options as $originalOption) {
                            $newBallot->options()->create([
                                'title' => $originalOption->title,
                                'description' => $originalOption->description,
                                'display_order' => $originalOption->display_order,
                                'value' => $originalOption->value,
                            ]);
                        }
                    }
                }
            }

            // 4. Copy voters if user wants them
            if ($request->input('copy_voters', false)) {
                foreach ($original->voters as $originalVoter) {
                    $copy->voters()->create([
                        'name' => $originalVoter->name,
                        'email' => $originalVoter->email,
                        'voter_id' => $originalVoter->voter_id ? $originalVoter->voter_id : null,
                        'voter_token' => $this->generateUniqueVoterKey(),
                        'has_voted' => false,
                        'invited_at' => null,
                        'voted_at' => null,
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('elections.show', $copy->id)
                ->with('success', 'Election copied successfully!');
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to copy election: ' . $e->getMessage(), [
                'original_election_id' => $electionId,
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Failed to copy election. Please try again.');
        }
    }

    public function generateUniqueVoterKey()
    {
        do {
            $key = strtoupper(Str::random(8)); // Generates 8 character random string
        } while (Voter::where('voter_token', $key)->exists());

        return $key;
    }
}
