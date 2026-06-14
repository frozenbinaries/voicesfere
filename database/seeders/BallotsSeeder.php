<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Ballot;

class BallotsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Ballot::create([
            'election_id' => 1,
            'title' => 'Presidential',
            'description' => 'Vote for your preferred presidential candidate.',
            // 'display_order' => 1,
            'max_selections' => 1,
            // 'min_selections' => 1,
            // 'is_active' => true,
            'randomize_options' => false,
            'type' => 'single_choice',
        ]);
    }
}
