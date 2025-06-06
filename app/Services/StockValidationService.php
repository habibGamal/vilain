<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Exceptions\InsufficientStockException;

class StockValidationService
{
    /**
     * Validate stock and throw exception with detailed product information.
     * This method is specifically for cart items that already have product relationships loaded.
     *
     * @param CartItem $item
     * @param int $requestedQuantity
     * @throws InsufficientStockException
     */
    public function validateCartItemStock(CartItem $item, int $requestedQuantity): CartItem
    {
        // Validate stock availability
        $variant = $item->variant;
        $product = $item->product;

        if ($variant && $requestedQuantity > $variant->quantity) {
            $productName = (!empty($product->name_en)) ? $product->name_en :
                          ((!empty($product->name_ar)) ? $product->name_ar : "Product #{$product->id}");
            throw new InsufficientStockException($requestedQuantity, $variant->quantity, $productName);
        }
        return $item;
    }
}
