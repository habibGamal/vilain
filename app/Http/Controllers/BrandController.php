<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BrandController extends Controller
{
    /**
     * Display a listing of the brands.
     */
    public function index()
    {
        $brands = Brand::with('children')
            ->whereNull('parent_id')
            ->orderBy('display_order')
            ->get();

        return Inertia::render('Brands/Index', [
            'brands' => $brands
        ]);
    }

    /**
     * Display the specified brand.
     */
    public function show(Brand $brand)
    {
        $brand->load(['children', 'products' => function($query) {
            $query->where('is_active', true)
                ->orderBy('created_at', 'desc')
                ->take(12);
        }]);

        return Inertia::render('Brands/Show', [
            'brand' => $brand
        ]);
    }
}
