<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Services\Currency\CurrencyConverter;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanController extends Controller
{
    public function __construct(protected CurrencyConverter $currency)
    {
    }

    /**
     * Example: GET /plans — shown e.g. in the SubscriptionModal on the
     * election page, but as a real page instead of a modal.
     */
    public function index(Request $request)
    {
        $plans = Plan::where('status', 'active')->orderBy('min_voters')->get();

        // Detect currency once, convert every plan's USD price using the
        // same cached rate — avoids N geolocation/rate lookups for N plans.
        $localizedPrices = $this->currency->localizeMany(
            $plans->pluck('price')->map(fn ($p) => (float) $p)->all(),
            $request,
        );

        $plansWithPricing = $plans->values()->map(function (Plan $plan, int $i) use ($localizedPrices) {
            return [
                'id' => $plan->id,
                'name' => $plan->name,
                'description' => $plan->description,
                'min_voters' => $plan->min_voters,
                'max_voters' => $plan->max_voters,
                'price' => $plan->price, // USD
                'currency' => $plan->currency, // USD
                'localized' => $localizedPrices[$i], // { currency, amount, formatted, rate, ... }
            ];
        });

        return Inertia::render('Plans/Index', [
            'plans' => $plansWithPricing,
        ]);
    }
}