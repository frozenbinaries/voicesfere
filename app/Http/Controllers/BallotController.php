<?php

namespace App\Http\Controllers;

use App\Models\Ballot;
use App\Models\Option;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BallotController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Ballot::create($request->all());
    }

    /**
     * Display the specified resource.
     */
    public function show(Ballot $ballot)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Ballot $ballot)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Ballot $ballot)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Ballot $ballot)
    {
        Ballot::destroy($ballot->id);

        return redirect()->back()->with('success', 'Ballot deleted successfully.');
    }


public function storeOption(Request $request, Ballot $ballot)
{
    $validated = $request->validate([
        'options'                          => 'required|array',
        'options.*.id'                     => 'nullable|integer',
        'options.*.title'                  => 'required|string|max:255',
        'options.*.description'            => 'nullable|string',
        'options.*.should_display_a_photo' => 'boolean',
        'options.*.photo'                  => 'nullable|image|max:2048', // actual file upload, max 2 MB
        'options.*.photo_url'              => 'nullable|string',         // existing stored URL (no new upload)
        'options.*.display_order'          => 'nullable|integer',
    ]);

    foreach ($validated['options'] as $index => $optionData) {
        // Resolve the photo URL: new upload takes priority, otherwise keep existing
        $photoUrl = $optionData['photo_url'] ?? null;

        if ($request->hasFile("options.{$index}.photo")) {
            $file     = $request->file("options.{$index}.photo");
            $path     = $file->store("elections/{$ballot->election_id}/options", 'public');
            $photoUrl = Storage::url($path);

            // Delete the old file if we're replacing one
            if (!empty($optionData['photo_url'])) {
                $oldPath = str_replace('/storage/', '', parse_url($optionData['photo_url'], PHP_URL_PATH));
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }
        }

        $payload = [
            'title'                  => $optionData['title'],
            'description'            => $optionData['description'] ?? null,
            'should_display_a_photo' => $optionData['should_display_a_photo'] ?? false,
            'photo_url'              => $photoUrl,
            'display_order'          => $optionData['display_order'] ?? 0,
        ];

        if (!empty($optionData['id'])) {
            $option = Option::where('id', $optionData['id'])
                ->where('ballot_id', $ballot->id)
                ->first();

            if ($option) {
                $option->update($payload);
            }
        } else {
            $ballot->options()->create($payload);
        }
    }
}
}
