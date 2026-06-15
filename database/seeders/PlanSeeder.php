<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Plan;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            // Plan 1: Micro (1-20 voters) - FREE
            [
                'name' => 'Micro',
                'slug' => 'micro',
                'description' => 'Perfect for small group elections like class representatives or club officers.',
                'price' => 0,
                'currency' => 'MWK',
                'min_voters' => 1,
                'max_voters' => 20,
                'status' => 'active',
            ],

            // Plan 2: Starter (21-100 voters)
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => 'Ideal for small organizations, church groups, and community elections.',
                'price' => 50000, // 50,000 MWK
                'currency' => 'MWK',
                'min_voters' => 21,
                'max_voters' => 100,
                'status' => 'active',
            ],

            // Plan 3: Basic (101-300 voters)
            [
                'name' => 'Basic',
                'slug' => 'basic',
                'description' => 'Great for medium-sized organizations and school-wide elections.',
                'price' => 150000, // 150,000 MWK
                'currency' => 'MWK',
                'min_voters' => 101,
                'max_voters' => 300,
                'status' => 'active',
            ],

            // Plan 4: Standard (301-600 voters)
            [
                'name' => 'Standard',
                'slug' => 'standard',
                'description' => 'Perfect for large schools, colleges, and growing businesses.',
                'price' => 300000, // 300,000 MWK
                'currency' => 'MWK',
                'min_voters' => 301,
                'max_voters' => 600,
                'status' => 'active',
            ],

            // Plan 5: Professional (601-1000 voters)
            [
                'name' => 'Professional',
                'slug' => 'professional',
                'description' => 'Designed for large organizations and corporate elections.',
                'price' => 500000, // 500,000 MWK
                'currency' => 'MWK',
                'min_voters' => 601,
                'max_voters' => 1000,
                'status' => 'active',
            ],

            // Plan 6: Business (1001-2000 voters)
            [
                'name' => 'Business',
                'slug' => 'business',
                'description' => 'For large-scale elections with many participants.',
                'price' => 800000, // 800,000 MWK
                'currency' => 'MWK',
                'min_voters' => 1001,
                'max_voters' => 2000,
                'status' => 'active',
            ],

            // Plan 7: Enterprise (2001-5000 voters)
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'description' => 'For enterprise-level elections with thousands of voters.',
                'price' => 1500000, // 1,500,000 MWK
                'currency' => 'MWK',
                'min_voters' => 2001,
                'max_voters' => 5000,
                'status' => 'active',
            ],

            // Plan 8: Unlimited (5001+ voters)
            [
                'name' => 'Ultimate',
                'slug' => 'ultimate',
                'description' => 'Unlimited voters for massive nationwide or enterprise elections.',
                'price' => 3000000, // 3,000,000 MWK
                'currency' => 'MWK',
                'min_voters' => 5001,
                'max_voters' => 100000, // Large cap for unlimited
                'status' => 'active',
            ],
        ];

        foreach ($plans as $plan) {
            Plan::create($plan);
        }
    }
}