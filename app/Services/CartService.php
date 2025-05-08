<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Auth;

class CartService
{
    /**
     * Get the current user's cart or create one if it doesn't exist
     *
     * @return Cart
     */
    public function getOrCreateCart(): Cart
    {
        $user = Auth::user();

        $cart = $user->cart;

        if (!$cart) {
            $cart = $user->cart()->create();
        }

        return $cart;
    }

    /**
     * Add a product to the cart
     *
     * @param int $productId
     * @param int $quantity
     * @param int|null $variantId
     * @return CartItem
     * @throws ModelNotFoundException
     */
    public function addToCart(int $productId, int $quantity = 1, ?int $variantId = null): CartItem
    {
        $product = Product::findOrFail($productId);
        $cart = $this->getOrCreateCart();
        $variantId = $variantId ? $variantId: $product->defaultVariant()->id;
        // Check if product and variant combination already exists in cart
        $query = $cart->items()->where('product_id', $productId);
        if ($variantId) {
            $query->where('product_variant_id', $variantId);
        } else {
            $query->whereNull('product_variant_id');
        }
        $cartItem = $query->first();

        if ($cartItem) {
            // Update quantity if product already exists in cart
            $cartItem->quantity += $quantity;
            $cartItem->save();
        } else {
            // Create new cart item if product doesn't exist in cart
            $cartItem = $cart->items()->create([
                'product_id' => $productId,
                'product_variant_id' => $variantId,
                'quantity' => $quantity
            ]);
        }

        return $cartItem;
    }

    /**
     * Update the quantity of a product in the cart
     *
     * @param int $cartItemId
     * @param int $quantity
     * @return CartItem
     * @throws ModelNotFoundException
     */
    public function updateCartItemQuantity(int $cartItemId, int $quantity): CartItem
    {
        $cart = $this->getOrCreateCart();
        $cartItem = $cart->items()->findOrFail($cartItemId);

        if ($quantity <= 0) {
            return $this->removeFromCart($cartItemId);
        }

        $cartItem->quantity = $quantity;
        $cartItem->save();

        return $cartItem;
    }

    /**
     * Remove an item from the cart
     *
     * @param int $cartItemId
     * @return CartItem The removed cart item
     * @throws ModelNotFoundException
     */
    public function removeFromCart(int $cartItemId): CartItem
    {
        $cart = $this->getOrCreateCart();
        $cartItem = $cart->items()->findOrFail($cartItemId);

        $removedItem = clone $cartItem;
        $cartItem->delete();

        return $removedItem;
    }

    /**
     * Clear all items from the cart
     *
     * @return bool
     */
    public function clearCart(): bool
    {
        $cart = $this->getOrCreateCart();
        return $cart->items()->delete();
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
