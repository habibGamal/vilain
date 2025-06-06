<?php

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\CartService;
use App\Services\StockValidationService;
use App\Exceptions\InsufficientStockException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->cartService = app(CartService::class);
    Auth::login($this->user);
});

describe('getOrCreateCart', function () {
    it('creates a new cart if user does not have one', function () {
        // Ensure user has no cart
        expect($this->user->cart)->toBeNull();

        $cart = $this->cartService->getOrCreateCart();

        expect($cart)->toBeInstanceOf(Cart::class);
        expect($cart->user_id)->toBe($this->user->id);
        expect($cart->exists)->toBeTrue();
    });

    it('returns existing cart if user already has one', function () {
        // Create an existing cart
        $existingCart = Cart::factory()->create(['user_id' => $this->user->id]);

        $cart = $this->cartService->getOrCreateCart();

        expect($cart->id)->toBe($existingCart->id);
        expect(Cart::where('user_id', $this->user->id)->count())->toBe(1);
    });
});

describe('addToCart', function () {
    it('adds quantity to existing cart item', function () {
        $product = Product::factory()->create(['price' => 100]);
        $variant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'quantity' => 10
        ]);

        $cart = $this->cartService->getOrCreateCart();
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 2
        ]);

        $result = $this->cartService->addToCart($cartItem, 3);

        expect($result->quantity)->toBe(5);
        expect($cartItem->fresh()->quantity)->toBe(5);
    });

    it('throws exception when insufficient stock', function () {
        $product = Product::factory()->create(['price' => 100]);
        $variant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'quantity' => 3
        ]);

        $cart = $this->cartService->getOrCreateCart();
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 2
        ]);

        expect(function () use ($cartItem) {
            $this->cartService->addToCart($cartItem, 5); // 2 + 5 = 7, but only 3 available
        })->toThrow(InsufficientStockException::class);
    });
});

describe('updateCartItemQuantity', function () {
    it('updates cart item quantity successfully', function () {
        $product = Product::factory()->create(['price' => 100]);
        $variant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'quantity' => 10
        ]);

        $cart = $this->cartService->getOrCreateCart();
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 2
        ]);

        $result = $this->cartService->updateCartItemQuantity($cartItem, 5);

        expect($result->quantity)->toBe(5);
        expect($cartItem->fresh()->quantity)->toBe(5);
    });

    it('throws exception when updating to quantity exceeding stock', function () {
        $product = Product::factory()->create(['price' => 100]);
        $variant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'quantity' => 3
        ]);

        $cart = $this->cartService->getOrCreateCart();
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 2
        ]);

        expect(function () use ($cartItem) {
            $this->cartService->updateCartItemQuantity($cartItem, 5);
        })->toThrow(InsufficientStockException::class);
    });
});

describe('removeFromCart', function () {
    it('removes cart item successfully', function () {
        $product = Product::factory()->create();
        $cart = $this->cartService->getOrCreateCart();
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 2
        ]);

        $result = $this->cartService->removeFromCart($cartItem);

        expect($result)->toBeTrue();
        expect(CartItem::find($cartItem->id))->toBeNull();
    });

    it('handles deletion of already deleted cart item gracefully', function () {
        $product = Product::factory()->create();
        $cart = $this->cartService->getOrCreateCart();
        $cartItem = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'quantity' => 2
        ]);

        // Delete the item first
        $cartItem->delete();

        // Should throw exception when trying to delete non-existent item
        expect(function () use ($cartItem) {
            $this->cartService->removeFromCart($cartItem);
        })->toThrow(ModelNotFoundException::class);
    });
});

describe('clearCart', function () {
    it('removes all items from cart', function () {
        $product1 = Product::factory()->create();
        $product2 = Product::factory()->create();
        $cart = $this->cartService->getOrCreateCart();

        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product1->id,
            'quantity' => 2
        ]);

        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product2->id,
            'quantity' => 3
        ]);

        expect($cart->items()->count())->toBe(2);

        $this->cartService->clearCart();

        expect($cart->items()->count())->toBe(0);
    });
});

describe('getCart', function () {
    it('returns cart with eager loaded relationships', function () {
        $product = Product::factory()->create(['price' => 100]);
        $variant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'quantity' => 10
        ]);

        $cart = $this->cartService->getOrCreateCart();
        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 2
        ]);

        $result = $this->cartService->getCart();

        expect($result)->toBeInstanceOf(Cart::class);
        expect($result->items)->toHaveCount(1);
        expect($result->items->first()->product)->toBeInstanceOf(Product::class);
        expect($result->items->first()->variant)->toBeInstanceOf(ProductVariant::class);

        // Check that relationships are loaded (not lazy loaded)
        expect($result->relationLoaded('items'))->toBeTrue();
        expect($result->items->first()->relationLoaded('product'))->toBeTrue();
        expect($result->items->first()->relationLoaded('variant'))->toBeTrue();
    });

    it('returns empty cart when no items exist', function () {
        $cart = $this->cartService->getCart();

        expect($cart)->toBeInstanceOf(Cart::class);
        expect($cart->items)->toHaveCount(0);
    });
});

describe('getCartSummary', function () {
    it('calculates correct summary for cart with items', function () {
        $product1 = Product::factory()->create(['price' => 100]);
        $product2 = Product::factory()->create(['price' => 200]);

        $cart = $this->cartService->getOrCreateCart();

        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product1->id,
            'quantity' => 2
        ]);

        CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product2->id,
            'quantity' => 3
        ]);

        $summary = $this->cartService->getCartSummary();

        expect($summary['totalItems'])->toBe(5); // 2 + 3
        expect($summary['totalPrice'])->toBe(800.0); // (2 * 100) + (3 * 200)
    });

    it('returns zero summary for empty cart', function () {
        $summary = $this->cartService->getCartSummary();

        expect($summary['totalItems'])->toBe(0);
        expect($summary['totalPrice'])->toBe(0.0);
    });

    it('returns correct summary structure', function () {
        $summary = $this->cartService->getCartSummary();

        expect($summary)->toHaveKeys(['totalItems', 'totalPrice']);
        expect($summary['totalItems'])->toBeInt();
        expect($summary['totalPrice'])->toBeFloat();
    });
});

describe('Cart Service Integration', function () {
    it('handles complete cart workflow', function () {
        // Create products
        $product1 = Product::factory()->create(['price' => 150]);
        $product2 = Product::factory()->create(['price' => 250]);

        $variant1 = ProductVariant::factory()->create([
            'product_id' => $product1->id,
            'quantity' => 10
        ]);
        $variant2 = ProductVariant::factory()->create([
            'product_id' => $product2->id,
            'quantity' => 5
        ]);

        // Get cart
        $cart = $this->cartService->getOrCreateCart();
        expect($cart->items)->toHaveCount(0);

        // Add items
        $item1 = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product1->id,
            'product_variant_id' => $variant1->id,
            'quantity' => 1
        ]);

        $item2 = CartItem::factory()->create([
            'cart_id' => $cart->id,
            'product_id' => $product2->id,
            'product_variant_id' => $variant2->id,
            'quantity' => 1
        ]);

        // Add more quantity to first item
        $this->cartService->addToCart($item1, 2);

        // Update second item quantity
        $this->cartService->updateCartItemQuantity($item2, 3);

        // Check summary
        $summary = $this->cartService->getCartSummary();
        expect($summary['totalItems'])->toBe(6); // 3 + 3
        expect($summary['totalPrice'])->toBe(1200.0); // (3 * 150) + (3 * 250)

        // Remove one item
        $this->cartService->removeFromCart($item1);

        $summary = $this->cartService->getCartSummary();
        expect($summary['totalItems'])->toBe(3);
        expect($summary['totalPrice'])->toBe(750.0); // 3 * 250

        // Clear cart
        $this->cartService->clearCart();

        $summary = $this->cartService->getCartSummary();
        expect($summary['totalItems'])->toBe(0);
        expect($summary['totalPrice'])->toBe(0.0);
    });
});
