<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name_en',
        'name_ar',
        'slug',
        'description_en',
        'description_ar',
        'price',
        'sale_price',
        'cost_price',
        'category_id',
        'brand_id',
        'is_active',
        'is_featured',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    protected $appends = [
        'featured_image'
    ];

    /**
     * Get the brand that owns the product.
     */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    /**
     * Get the category that owns the product.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the wishlist items for this product.
     */
    public function wishlists()
    {
        return $this->hasMany(WishlistItem::class);
    }

    /**
     * Check if the product is in the wishlist of the given user.
     *
     * @param int|null $userId
     * @return bool
     */
    public function getIsInWishlistAttribute($userId = null)
    {
        if (!$userId && !auth()->check()) {
            return false;
        }

        $userId = $userId ?? auth()->id();

        return $this->wishlists()->where('user_id', $userId)->exists();
    }

    /**
     * Get the variants for the product.
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * Get the sections for the product.
     */
    public function sections()
    {
        return $this->belongsToMany(Section::class, 'section_product')
            ->withTimestamps();
    }

    /**
     * Get the default variant for the product.
     */
    public function defaultVariant()
    {
        return $this->variants()
            ->where('is_default', true)
            ->where('is_active', true)
            ->first() ?: $this->variants()->where('is_active', true)->first();
    }

    /**
     * Get the total quantity across all variants.
     */
    public function getTotalQuantityAttribute(): int
    {
        return $this->variants->sum('quantity');
    }

    /**
     * Get the featured image from the default variant or first variant.
     */
    public function getFeaturedImageAttribute()
    {
        // Try to get image from default variant
        $defaultVariant = $this->defaultVariant();
        if ($defaultVariant && !empty($defaultVariant->images)) {
            return $defaultVariant->featured_image;
        }

        // If no default variant, try the first variant with images
        $variantWithImages = $this->variants->first(function ($variant) {
            return !empty($variant->images);
        });

        return $variantWithImages ? $variantWithImages->featured_image : null;
    }

    /**
     * Get all images from all variants.
     */
    public function getAllImagesAttribute(): array
    {
        $images = [];
        foreach ($this->variants as $variant) {
            if (!empty($variant->images)) {
                $images = array_merge($images, $variant->images);
            }
        }
        return array_unique($images);
    }

    /**
     * Check if the product has any variants in stock.
     */
    public function getIsInStockAttribute(): bool
    {
        return $this->variants->where('quantity', '>', 0)->count() > 0;
    }

    public function scopeForCards()
    {
        return $this->where('is_active', true)
            ->with([
                'brand' => function ($query) {
                    $query->select('id', 'name_en', 'name_ar', 'slug', 'image');
                }
            ]);
    }
}
