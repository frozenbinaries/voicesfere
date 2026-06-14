<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Election;

class ElectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
       Election::create([
           'created_by' => 1,
           'title' => 'Presidential Election 2026',
           'description' => 'Election for the president of the country 2026.',
           'status' => 'active',
           'start_date' => now(),
           'end_date' => now()->addDays(14),
           'identifier' => 'PE-2026',
       ]);
    }
}
