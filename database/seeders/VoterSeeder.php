<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Voter;

class VoterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Voter::create([
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'voter_token' => 'abc123',
            'invited_at' => now(),
            'election_id' => 2
        ]);
    }
}
