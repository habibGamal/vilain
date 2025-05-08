<?php

namespace App\Http\Controllers;

use App\Services\CartService;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    protected CartService $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    /**
     * Display the cart page
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $cart = $this->cartService->getCart();

        return Inertia::render('Cart/Index', [
            'cart' => $cart,
            'cartSummary' => $this->cartService->getCartSummary(),
        ]);
    }

    /**
     * Add a product to the cart
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addItem(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'product_variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem = $this->cartService->addToCart(
            $validated['product_id'],
            $validated['quantity'],
            $validated['product_variant_id'] ?? null
        );

        return response()->json([
            'success' => true,
            'message' => 'Product added to cart',
            'cart_summary' => $this->cartService->getCartSummary(),
            'cart_item' => $cartItem->load('product'),
        ]);
    }

    /**
     * Update cart item quantity
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateItem(Request $request, int $id)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $cartItem = $this->cartService->updateCartItemQuantity(
            $id,
            $validated['quantity']
        );

        return response()->json([
            'success' => true,
            'message' => 'Cart item updated',
            'cart_summary' => $this->cartService->getCartSummary(),
            'cart_item' => $cartItem->load('product'),
        ]);
    }

    /**
     * Remove a cart item
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeItem(int $id)
    {
        $this->cartService->removeFromCart($id);

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart',
            'cart_summary' => $this->cartService->getCartSummary(),
        ]);
    }

    /**
     * Clear all items from the cart
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function clearCart()
    {
        $this->cartService->clearCart();

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared',
            'cart_summary' => $this->cartService->getCartSummary(),
        ]);
    }

    /**
     * Get cart summary data for navigation or other components
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSummary()
    {
        return response()->json([
            'cart_summary' => $this->cartService->getCartSummary(),
        ]);
    }
}
