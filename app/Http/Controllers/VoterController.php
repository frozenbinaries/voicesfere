<?php

namespace App\Http\Controllers;

use App\Models\Voter;
use Illuminate\Http\Request;
use App\Models\Election;
use Illuminate\Support\Facades\DB;

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

    // public function export($electionId)
    // {
    //     $election = Election::findOrFail($electionId);
    //     $voters = $election->voters;

    //     $filename = "voters_{$election->identifier}_{$election->title}.csv";

    //     $headers = [
    //         'Content-Type' => 'text/csv',
    //         'Content-Disposition' => "attachment; filename=\"$filename\"",
    //     ];

    //     $callback = function () use ($voters) {
    //         $file = fopen('php://output', 'w');

    //         // Add headers
    //         fputcsv($file, ['Name', 'Email', 'Voter ID', 'Voter Token', 'Has Voted', 'Invited At', 'Voted At']);

    //         // Add rows
    //         foreach ($voters as $voter) {
    //             fputcsv($file, [
    //                 $voter->name,
    //                 $voter->email,
    //                 $voter->voter_id,
    //                 $voter->voter_token,
    //                 $voter->has_voted ? 'Yes' : 'No',
    //                 $voter->invited_at,
    //                 $voter->voted_at,
    //             ]);
    //         }

    //         fclose($file);
    //     };

    //     return response()->stream($callback, 200, $headers);
    // }

    public function export(Request $request, $electionId)
    {
        $election = Election::with('voters')->findOrFail($electionId);
        $format = $request->input('format', 'full');

        // Set filename
        $filename = $format === 'names'
            ? "voters_names_{$election->identifier}.csv"
            : "voters_full_{$election->identifier}.csv";

        // Set headers for CSV download
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        // Create output stream
        $callback = function () use ($election, $format) {
            $handle = fopen('php://output', 'w');

            if ($format === 'names') {
                // Simple names only export
                fputcsv($handle, ['Name']);

                foreach ($election->voters as $voter) {
                    fputcsv($handle, [$voter->name]);
                }
            } else {
                // Full export with all details
                fputcsv($handle, [
                    'Name',
                    'Voter ID',
                    'Email',
                    'Voter Token',
                    'Status',
                    'Invited At',
                    'Voted At',
                    'Created At'
                ]);

                foreach ($election->voters as $voter) {
                    fputcsv($handle, [
                        $voter->name,
                        $voter->voter_id ?? '',
                        $voter->email ?? '',
                        $voter->voter_token,
                        $voter->has_voted ? 'Voted' : 'Pending',
                        $voter->invited_at ?? '',
                        $voter->voted_at ?? '',
                        $voter->created_at ?? '',
                    ]);
                }
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

     public function import(Request $request, $electionId)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240', // Max 10MB
        ]);

        $election = Election::findOrFail($electionId);

        // Read CSV file
        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');

        // Get headers
        $headers = fgetcsv($handle);

        // Validate headers
        $requiredHeaders = ['name'];
        $missingHeaders = array_diff($requiredHeaders, array_map('strtolower', $headers));

        if (!empty($missingHeaders)) {
            fclose($handle);
            return back()->withErrors([
                'file' => 'CSV must contain "name" column. Missing: ' . implode(', ', $missingHeaders)
            ]);
        }

        // Map column indexes
        $nameIndex = array_search('name', array_map('strtolower', $headers));
        $voterIdIndex = array_search('voter_id', array_map('strtolower', $headers));
        $emailIndex = array_search('email', array_map('strtolower', $headers));

        $imported = 0;
        $errors = [];
        $rowNumber = 1; // Start from 1 (after header)

        // Begin transaction
        \DB::beginTransaction();

        try {
            while (($row = fgetcsv($handle)) !== false) {
                $rowNumber++;

                // Skip empty rows
                if (empty(array_filter($row))) {
                    continue;
                }

                $name = isset($row[$nameIndex]) ? trim($row[$nameIndex]) : null;
                $voterId = $voterIdIndex !== false && isset($row[$voterIdIndex])
                    ? trim($row[$voterIdIndex])
                    : null;
                $email = $emailIndex !== false && isset($row[$emailIndex])
                    ? trim($row[$emailIndex])
                    : null;

                // Validate row data
                if (empty($name)) {
                    $errors[] = "Row {$rowNumber}: Name is required";
                    continue;
                }

                // Either voter_id or email must be provided
                if (empty($voterId) && empty($email)) {
                    $errors[] = "Row {$rowNumber}: Either Voter ID or Email is required";
                    continue;
                }

                // Validate email format if provided
                if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $errors[] = "Row {$rowNumber}: Invalid email format: {$email}";
                    continue;
                }

                // Check for duplicate voter_id in this election
                if (!empty($voterId)) {
                    $existingVoterId = Voter::where('election_id', $electionId)
                        ->where('voter_id', $voterId)
                        ->exists();

                    if ($existingVoterId) {
                        $errors[] = "Row {$rowNumber}: Voter ID '{$voterId}' already exists in this election";
                        continue;
                    }
                }

                // Check for duplicate email in this election
                if (!empty($email)) {
                    $existingEmail = Voter::where('election_id', $electionId)
                        ->where('email', $email)
                        ->exists();

                    if ($existingEmail) {
                        $errors[] = "Row {$rowNumber}: Email '{$email}' already exists in this election";
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
                        'voter_token' => \Illuminate\Support\Str::random(32),
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

            // If there were errors, rollback and return errors
            if (!empty($errors)) {
                DB::rollBack();

                // Return with error messages
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
            fclose($handle);

            Log::error('Import error: ' . $e->getMessage(), [
                'election_id' => $electionId,
                'file' => $file->getClientOriginalName()
            ]);

            return back()->withErrors([
                'file' => 'Failed to import voters: ' . $e->getMessage()
            ]);
        }
    }
}
