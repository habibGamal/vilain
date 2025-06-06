<?php

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\CartItemResolverService;
use App\Exceptions\ProductNotFoundException;
use App\Exceptions\ProductVariantNotFoundException;
use App\Exceptions\InsufficientStockException;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->cart = Cart::factory()->create(['user_id' => $this->user->id]);
    $this->service = new CartItemResolverService();
});

describe('resolveCartItem', function () {
    it('returns existing cart item when product and variant match', function () {
        $product = Product::factory()->create(['is_active' => true]);
        $variant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'is_active' => true,
        ]);

        $existingCartItem = CartItem::factory()->create([
            'cart_id' => $this->cart->id,
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        $result = $this->service->resolveCartItem($this->cart, $product->id, $variant->id);

        expect($result->id)->toBe($existingCartItem->id);
        expect($result->quantity)->toBe(2);
    });

    it('creates new cart item with quantity 0 when no existing item found', function () {
        $product = Product::factory()->create(['is_active' => true]);
        $variant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'is_active' => true,
            'quantity' => 10,
        ]);

        $result = $this->service->resolveCartItem($this->cart, $product->id, $variant->id);

        expect($result)->toBeInstanceOf(CartItem::class);
        expect($result->cart_id)->toBe($this->cart->id);
        expect($result->product_id)->toBe($product->id);
        expect($result->product_variant_id)->toBe($variant->id);
        expect($result->quantity)->toBe(0);
        expect($result->exists)->toBeFalse(); // Not saved yet
    });

    it('uses default variant when no variant specified', function () {
        $product = Product::factory()->create(['is_active' => true]);
        $defaultVariant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'is_active' => true,
            'is_default' => true,
            'quantity' => 10,
        ]);
        $sv = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'is_active' => true,
            'is_default' => false,
        ]);

        $result = $this->service->resolveCartItem($this->cart, $product->id);
        dd($result->product_variant_id, $defaultVariant->id, $sv->id,$product->variants->map(fn($v) => $v->id));
        expect($result->product_variant_id)->toBe($defaultVariant->id);
    });

    it('uses first active variant when no default variant exists', function () {
        $product = Product::factory()->create(['is_active' => true]);
        $firstVariant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'is_active' => true,
            'is_default' => false,
            'quantity' => 10,
        ]);
        ProductVariant::factory()->create([
            'product_id' => $product->id,
            'is_active' => true,
            'is_default' => false,
        ]);

        $result = $this->service->resolveCartItem($this->cart, $product->id);

        expect($result->product_variant_id)->toBe($firstVariant->id);
    });

    it('throws ProductNotFoundException when product does not exist', function () {
        expect(fn() => $this->service->resolveCartItem($this->cart, 99999))
            ->toThrow(ProductNotFoundException::class);
    });

    it('throws ProductNotFoundException when product is inactive', function () {
        $product = Product::factory()->create(['is_active' => false]);

        expect(fn() => $this->service->resolveCartItem($this->cart, $product->id))
            ->toThrow(ProductNotFoundException::class);
    });

    it('throws ProductVariantNotFoundException when specified variant does not exist', function () {
        $product = Product::factory()->create(['is_active' => true]);

        expect(fn() => $this->service->resolveCartItem($this->cart, $product->id, 99999))
            ->toThrow(ProductVariantNotFoundException::class);
    });

    it('throws ProductVariantNotFoundException when specified variant is inactive', function () {
        $product = Product::factory()->create(['is_active' => true]);
        $variant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'is_active' => false,
        ]);

        expect(fn() => $this->service->resolveCartItem($this->cart, $product->id, $variant->id))
            ->toThrow(ProductVariantNotFoundException::class);
    });

    it('throws ProductVariantNotFoundException when variant belongs to different product', function () {
        $product1 = Product::factory()->create(['is_active' => true]);
        $product2 = Product::factory()->create(['is_active' => true]);
        $variant = ProductVariant::factory()->create([
            'product_id' => $product2->id,
            'is_active' => true,
        ]);

        expect(fn() => $this->service->resolveCartItem($this->cart, $product1->id, $variant->id))
            ->toThrow(ProductVariantNotFoundException::class);
    });

    it('throws ProductVariantNotFoundException when product has no active variants', function () {
        $product = Product::factory()->create(['is_active' => true]);
        ProductVariant::factory()->create([
            'product_id' => $product->id,
            'is_active' => false,
        ]);

        expect(fn() => $this->service->resolveCartItem($this->cart, $product->id))
            ->toThrow(ProductVariantNotFoundException::class);
    });
});
