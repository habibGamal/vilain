<?php

use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\StockValidationService;
use App\Exceptions\InsufficientStockException;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->stockValidationService = app(StockValidationService::class);
});

describe('validateCartItemStock', function () {
    it('returns cart item when stock is sufficient', function () {
        // Arrange
        $product = Product::factory()->create([
            'name_en' => 'Test Product',
            'name_ar' => 'منتج تجريبي'
        ]);
        
        $variant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'quantity' => 10
        ]);
        
        $cartItem = CartItem::factory()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 3
        ]);
        
        // Load relationships
        $cartItem->load(['product', 'variant']);
        
        // Act
        $result = $this->stockValidationService->validateCartItemStock($cartItem, 5);
        
        // Assert
        expect($result)->toBeInstanceOf(CartItem::class);
        expect($result->id)->toBe($cartItem->id);
    });
    
    it('returns cart item when requested quantity equals available stock', function () {
        // Arrange
        $product = Product::factory()->create([
            'name_en' => 'Test Product',
            'name_ar' => 'منتج تجريبي'
        ]);
        
        $variant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'quantity' => 10
        ]);
        
        $cartItem = CartItem::factory()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 5
        ]);
        
        // Load relationships
        $cartItem->load(['product', 'variant']);
        
        // Act
        $result = $this->stockValidationService->validateCartItemStock($cartItem, 10);
        
        // Assert
        expect($result)->toBeInstanceOf(CartItem::class);
        expect($result->id)->toBe($cartItem->id);
    });
    
    it('throws InsufficientStockException when requested quantity exceeds available stock', function () {
        // Arrange
        $product = Product::factory()->create([
            'name_en' => 'Test Product',
            'name_ar' => 'منتج تجريبي'
        ]);
        
        $variant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'quantity' => 5
        ]);
        
        $cartItem = CartItem::factory()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 3
        ]);
        
        // Load relationships
        $cartItem->load(['product', 'variant']);
        
        // Act & Assert
        expect(fn() => $this->stockValidationService->validateCartItemStock($cartItem, 10))
            ->toThrow(InsufficientStockException::class);
    });
    
    it('throws exception with correct message when stock is insufficient', function () {
        // Arrange
        $product = Product::factory()->create([
            'name_en' => 'Amazing Product',
            'name_ar' => 'منتج رائع'
        ]);
        
        $variant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'quantity' => 3
        ]);
        
        $cartItem = CartItem::factory()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 2
        ]);
        
        // Load relationships
        $cartItem->load(['product', 'variant']);
        
        // Act & Assert
        try {
            $this->stockValidationService->validateCartItemStock($cartItem, 5);
            $this->fail('Expected InsufficientStockException was not thrown');
        } catch (InsufficientStockException $e) {
            expect($e->getMessage())->toBe('Insufficient stock for Amazing Product. Requested: 5, Available: 3');
        }
    });
    
    it('uses English name when available for exception message', function () {
        // Arrange
        $product = Product::factory()->create([
            'name_en' => 'English Product Name',
            'name_ar' => 'اسم المنتج بالعربية'
        ]);
        
        $variant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'quantity' => 2
        ]);
        
        $cartItem = CartItem::factory()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1
        ]);
        
        // Load relationships
        $cartItem->load(['product', 'variant']);
        
        // Act & Assert
        try {
            $this->stockValidationService->validateCartItemStock($cartItem, 5);
            $this->fail('Expected InsufficientStockException was not thrown');
        } catch (InsufficientStockException $e) {
            expect($e->getMessage())->toContain('English Product Name');
        }
    });
      it('uses Arabic name when English is not available for exception message', function () {
        // Arrange
        $product = Product::factory()->create([
            'name_en' => '',
            'name_ar' => 'اسم المنتج بالعربية'
        ]);
        
        $variant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'quantity' => 2
        ]);
        
        $cartItem = CartItem::factory()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1
        ]);
        
        // Load relationships
        $cartItem->load(['product', 'variant']);
        
        // Act & Assert
        try {
            $this->stockValidationService->validateCartItemStock($cartItem, 5);
            $this->fail('Expected InsufficientStockException was not thrown');
        } catch (InsufficientStockException $e) {
            expect($e->getMessage())->toContain('اسم المنتج بالعربية');
        }
    });
      it('uses product ID as fallback when no names are available for exception message', function () {
        // Arrange
        $product = Product::factory()->create([
            'name_en' => '',
            'name_ar' => ''
        ]);
        
        $variant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'quantity' => 2
        ]);
        
        $cartItem = CartItem::factory()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1
        ]);
        
        // Load relationships
        $cartItem->load(['product', 'variant']);
        
        // Act & Assert
        try {
            $this->stockValidationService->validateCartItemStock($cartItem, 5);
            $this->fail('Expected InsufficientStockException was not thrown');
        } catch (InsufficientStockException $e) {
            expect($e->getMessage())->toContain("Product #{$product->id}");
        }
    });
    
    it('handles cart item without variant gracefully', function () {
        // Arrange
        $product = Product::factory()->create([
            'name_en' => 'Test Product',
            'name_ar' => 'منتج تجريبي'
        ]);
        
        $cartItem = CartItem::factory()->create([
            'product_id' => $product->id,
            'product_variant_id' => null,
            'quantity' => 3
        ]);
        
        // Load relationships
        $cartItem->load(['product', 'variant']);
        
        // Act
        $result = $this->stockValidationService->validateCartItemStock($cartItem, 5);
        
        // Assert - Should return the cart item since no variant means no stock validation
        expect($result)->toBeInstanceOf(CartItem::class);
        expect($result->id)->toBe($cartItem->id);
    });
    
    it('validates zero requested quantity successfully', function () {
        // Arrange
        $product = Product::factory()->create([
            'name_en' => 'Test Product',
            'name_ar' => 'منتج تجريبي'
        ]);
        
        $variant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'quantity' => 10
        ]);
        
        $cartItem = CartItem::factory()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 3
        ]);
        
        // Load relationships
        $cartItem->load(['product', 'variant']);
        
        // Act
        $result = $this->stockValidationService->validateCartItemStock($cartItem, 0);
        
        // Assert
        expect($result)->toBeInstanceOf(CartItem::class);
        expect($result->id)->toBe($cartItem->id);
    });
    
    it('handles variant with zero stock', function () {
        // Arrange
        $product = Product::factory()->create([
            'name_en' => 'Out of Stock Product',
            'name_ar' => 'منتج نفد مخزونه'
        ]);
        
        $variant = ProductVariant::factory()->create([
            'product_id' => $product->id,
            'quantity' => 0
        ]);
        
        $cartItem = CartItem::factory()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'quantity' => 1
        ]);
        
        // Load relationships
        $cartItem->load(['product', 'variant']);
        
        // Act & Assert
        expect(fn() => $this->stockValidationService->validateCartItemStock($cartItem, 1))
            ->toThrow(InsufficientStockException::class);
    });
});
