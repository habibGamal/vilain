<?php

namespace App\Http\Controllers;

use App\Services\WishlistService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;

class WishlistController extends Controller
{
    /**
     * The wishlist service instance.
     */
    protected WishlistService $wishlistService;

    /**
     * Create a new controller instance.
     */
    public function __construct(WishlistService $wishlistService)
    {
        $this->wishlistService = $wishlistService;
    }

    /**
     * Display the user's wishlist.
     */
    public function index(): Response
    {
        $items = $this->wishlistService->getUserList(auth()->user());

        return Inertia::render('Wishlist/Index', [
            'items' => $items,
        ]);
    }

    /**
     * Add an item to the wishlist.
     */
    public function addItem(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
        ]);

        $item = $this->wishlistService->addItem(
            auth()->user(),
            $validated['product_id']
        );

        return response()->back();
    }

    /**
     * Remove an item from the wishlist.
     */
    public function removeItem(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|integer',
        ]);

        $success = $this->wishlistService->removeItem(
            auth()->user(),
            $validated['product_id']
        );

        return response()->back();
    }

    /**
     * Clear the wishlist.
     */
    public function clearList()
    {
        $success = $this->wishlistService->clearList(auth()->user());

        return response()->back();
    }
}
