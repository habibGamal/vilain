<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Auth;

class CartService
{
    protected StockValidationService $stockValidator;

    public function __construct(StockValidationService $stockValidator)
    {
        $this->stockValidator = $stockValidator;
    }
    /**
     * Get the current user's cart or create one if it doesn't exist
     *
     * @return Cart
     */
    public function getOrCreateCart(): Cart
    {
        $user = Auth::user()->load('cart');

        $cart = $user->cart;

        if (!$cart) {
            $cart = $user->cart()->create();
        }

        return $cart;
    }

    /**
     * Add a CartItem to the cart
     *
     * @param CartItem $item
     * @param int $quantity
     * @return CartItem
     */
    public function addToCart(CartItem $item, int $quantity): CartItem
    {
        // Calculate new quantity (existing quantity + new quantity)
        $newQuantity = $item->quantity + $quantity;

        $this->stockValidator->validateCartItemStock($item, $newQuantity);

        $item->quantity = $newQuantity;

        $item->save();

        return $item;
    }

    /**
     * Update the quantity of a product in the cart
     *
     * @param CartItem $item
     * @param int $quantity
     * @return CartItem
     */
    public function updateCartItemQuantity(CartItem $item, int $quantity): CartItem
    {
        $this->stockValidator->validateCartItemStock($item, $quantity);

        $item->quantity = $quantity;

        $item->save();

        return $item;
    }

    /**
     * Remove an item from the cart
     *
     * @param CartItem $item
     * @return bool
     * @throws ModelNotFoundException
     */
    public function removeFromCart(CartItem $item): bool
    {
        // Check if the item still exists in the database
        if (!$item->exists) {
            throw new ModelNotFoundException("Cart item not found: {$item->id}");
        }

        $item->delete();

        return true;
    }

    /**
     * Clear all items from the cart
     *
     * @return bool
     */
    public function clearCart(): bool
    {
        $cart = $this->getOrCreateCart();
        $cart->items()->delete();
        return true;
    }

    /**
     * Get the current cart with its items and products
     *
     * @return Cart
     */
    public function getCart(): Cart
    {
        $cart = $this->getOrCreateCart();

        // Eager load the items with their products and variants for better performance
        return $cart->load(['items.product', 'items.variant']);
    }

    /**
     * Get cart summary (total items, total price)
     *
     * @return array
     */
    public function getCartSummary(): array
    {
        $cart = $this->getCart();
        $totalItems = $cart->items->sum('quantity');
        $totalPrice = $cart->getTotalPrice();

        return [
            'totalItems' => $totalItems,
            'totalPrice' => $totalPrice,
        ];
    }

}
