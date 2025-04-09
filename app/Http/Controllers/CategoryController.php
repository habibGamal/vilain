<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of the categories.
     */
    public function index()
    {
        $categories = Category::with('children')
            ->whereNull('parent_id')
            ->orderBy('display_order')
            ->get();

        return Inertia::render('Categories/Index', [
            'categories' => $categories
        ]);
    }

    /**
     * Display the specified category.
     */
    public function show(Category $category)
    {
        $category->load(['children', 'products' => function($query) {
            $query->where('is_active', true)
                ->orderBy('created_at', 'desc')
                ->take(12);
        }]);

        return Inertia::render('Categories/Show', [
            'category' => $category
        ]);
    }
}
