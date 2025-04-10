<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SearchController extends Controller
{
    /**
     * Search suggestions as user types
     */
    public function suggestions(Request $request)
    {
        $query = $request->input('q');

        if (empty($query) || strlen($query) < 2) {
            return response()->json(['suggestions' => []]);
        }

        $suggestions = Product::where('name_en', 'LIKE', "%{$query}%")
            ->orWhere('name_ar', 'LIKE', "%{$query}%")
            ->select('id', 'name_en', 'name_ar', 'slug', 'price','image')
            ->where('is_active', true)
            ->take(5)
            ->get();

        return response()->json(['suggestions' => $suggestions]);
    }

    /**
     * Show search results page
     */
    public function results(Request $request)
    {
        $query = $request->input('q');
        $page = $request->input('section_search_results_products_page', 1);
        $brandIds = $request->input('brands', []);
        $categoryIds = $request->input('categories', []);
        $minPrice = $request->input('min_price');
        $maxPrice = $request->input('max_price');
        $sortBy = $request->input('sort_by', 'newest');

        $products = [];
        $allBrands = [];
        $allCategories = [];
        $priceRange = [];

        if (!empty($query) || $brandIds || $categoryIds || $minPrice || $maxPrice) {
            $searchQuery = Product::query()->where('is_active', true);

            // Apply search query if provided
            if (!empty($query)) {
                $searchQuery->where(function($q) use ($query) {
                    $q->where('name_en', 'LIKE', "%{$query}%")
                      ->orWhere('name_ar', 'LIKE', "%{$query}%")
                      ->orWhere('description_en', 'LIKE', "%{$query}%")
                      ->orWhere('description_ar', 'LIKE', "%{$query}%");
                });
            }

            // Apply brand filter if provided
            if (!empty($brandIds)) {
                $searchQuery->whereIn('brand_id', $brandIds);
            }

            // Apply category filter if provided
            if (!empty($categoryIds)) {
                $searchQuery->whereIn('category_id', $categoryIds);
            }

            // Apply price range filter if provided
            if ($minPrice !== null) {
                $searchQuery->where('price', '>=', $minPrice);
            }

            if ($maxPrice !== null) {
                $searchQuery->where('price', '<=', $maxPrice);
            }

            // Apply sorting
            switch ($sortBy) {
                case 'price_low_high':
                    $searchQuery->orderBy('price', 'asc');
                    break;
                case 'price_high_low':
                    $searchQuery->orderBy('price', 'desc');
                    break;
                case 'name_a_z':
                    $searchQuery->orderBy('name_en', 'asc');
                    break;
                case 'name_z_a':
                    $searchQuery->orderBy('name_en', 'desc');
                    break;
                case 'newest':
                default:
                    $searchQuery->orderBy('created_at', 'desc');
                    break;
            }

            // Load relationships
            $searchQuery->with([
                'brand' => function ($query) {
                    $query->select('id', 'name_en', 'name_ar', 'slug', 'image');
                },
                'category' => function ($query) {
                    $query->select('id', 'name_en', 'name_ar', 'slug', 'image');
                }
            ]);

            $searchResults = $searchQuery->paginate(12, ['*'], 'section_search_results_products_page', $page)
                ->withQueryString();

            // Get all brands for filter
            $allBrands = \App\Models\Brand::where('is_active', true)
                ->select('id', 'name_en', 'name_ar')
                ->orderBy('name_en')
                ->get();

            // Get all categories for filter
            $allCategories = \App\Models\Category::where('is_active', true)
                ->select('id', 'name_en', 'name_ar')
                ->orderBy('name_en')
                ->get();

            // Get price range for filter
            $priceStats = Product::where('is_active', true)
                ->selectRaw('MIN(price) as min_price, MAX(price) as max_price')
                ->first();

            $priceRange = [
                'min' => $priceStats->min_price ?? 0,
                'max' => $priceStats->max_price ?? 1000,
            ];
        } else {
            $searchResults = collect([]);
        }

        return Inertia::render('Search/Results', [
            'section_search_results_products_page_data' => !$searchResults->isEmpty() ? inertia()->merge($searchResults->items()) : [],
            'section_search_results_products_page_pagination' => !$searchResults->isEmpty() ? \Illuminate\Support\Arr::except($searchResults->toArray(), ['data']) : null,
            'query' => $query,
            'filters' => [
                'brands' => $allBrands,
                'categories' => $allCategories,
                'priceRange' => $priceRange,
                'selectedBrands' => $brandIds,
                'selectedCategories' => $categoryIds,
                'minPrice' => $minPrice,
                'maxPrice' => $maxPrice,
                'sortBy' => $sortBy,
            ],
        ]);
    }
}
