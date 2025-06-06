<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Exceptions\ProductNotFoundException;
use App\Exceptions\ProductVariantNotFoundException;
use App\Exceptions\InsufficientStockException;

class CartItemResolverService
{
    /**
     * Resolve and prepare a CartItem for adding to cart.
     * Verifies product & variant existence, checks stock availability,
     * and determines if the item already exists in the cart.
     *
     * @param Cart $cart
     * @param int $productId
     * @param int $quantity
     * @param int|null $variantId
     * @return CartItem
     * @throws ProductNotFoundException
     * @throws ProductVariantNotFoundException
     * @throws InsufficientStockException
     */
    public function resolveCartItem(Cart $cart, int $productId, ?int $variantId = null): CartItem
    {
        // Verify product exists and is active
        $product = $this->verifyProduct($productId);

        // Resolve the appropriate variant
        $variant = $this->resolveVariant($product, $variantId);

        // Check if item already exists in cart
        $existingCartItem = $this->findExistingCartItem($cart, $productId, $variant->id);

        if ($existingCartItem) {
            // Return existing cart item without modifying quantity
            return $existingCartItem;
        }

        // Create new cart item (not saved yet) with quantity 0
        $cartItem = new CartItem([
            'cart_id' => $cart->id,
            'product_id' => $productId,
            'product_variant_id' => $variant->id,
            'quantity' => 0,
        ]);

        return $cartItem;
    }

    /**
     * Verify that the product exists and is active.
     *
     * @param int $productId
     * @return Product
     * @throws ProductNotFoundException
     */
    protected function verifyProduct(int $productId): Product
    {
        $product = Product::where('id', $productId)
            ->where('is_active', true)
            ->first();

        if (!$product) {
            throw new ProductNotFoundException($productId);
        }

        return $product;
    }

    /**
     * Resolve the appropriate variant for the product.
     *
     * @param Product $product
     * @param int|null $variantId
     * @return ProductVariant
     * @throws ProductVariantNotFoundException
     */
    protected function resolveVariant(Product $product, ?int $variantId = null): ProductVariant
    {
        if ($variantId) {
            // Specific variant requested
            $variant = ProductVariant::where('id', $variantId)
                ->where('product_id', $product->id)
                ->where('is_active', true)
                ->first();

            if (!$variant) {
                throw new ProductVariantNotFoundException($variantId);
            }

            return $variant;
        }

        // Use default variant if no specific variant requested
        $variant = $product->variants()
            ->where('is_active', true)
            ->where('is_default', true)
            ->first();

        if (!$variant) {
            // Fallback to first active variant if no default is set
            $variant = $product->variants()
                ->where('is_active', true)
                ->first();
        }

        if (!$variant) {
            throw new ProductVariantNotFoundException(0);
        }

        return $variant;
    }

    /**
     * Find existing cart item with the same product and variant.
     *
     * @param Cart $cart
     * @param int $productId
     * @param int $variantId
     * @return CartItem|null
     */
    protected function findExistingCartItem(Cart $cart, int $productId, int $variantId): ?CartItem
    {
        return $cart->items()
            ->where('product_id', $productId)
            ->where('product_variant_id', $variantId)
            ->first();
    }

    /**
     * Validate that there's sufficient stock for the requested quantity.
     *
     * @param ProductVariant $variant
     * @param int $requestedQuantity
     * @param Product $product
     * @throws InsufficientStockException
     */
    protected function validateStock(ProductVariant $variant, int $requestedQuantity, Product $product): void
    {
        if ($variant->quantity < $requestedQuantity) {
            $productName = $product->name_en ?? $product->name_ar ?? "Product #{$product->id}";
            throw new InsufficientStockException($requestedQuantity, $variant->quantity, $productName);
        }
    }


}
