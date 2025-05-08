<?php

namespace Database\Factories;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name_en = $this->faker->unique()->words(3, true);
        return [
            'name_en' => $name_en,
            'name_ar' => $this->faker->unique()->words(3, true),
            'slug' => Str::slug($name_en),
            'description_en' => $this->faker->paragraphs(3, true),
            'description_ar' => $this->faker->paragraphs(3, true),
            'price' => $this->faker->randomFloat(2, 10, 500),
            'sale_price' => $this->faker->optional(0.3)->randomFloat(2, 5, 450),
            'cost_price' => $this->faker->randomFloat(2, 1, 300),
            'category_id' => Category::factory(),
            'brand_id' => Brand::factory(),
            'is_active' => $this->faker->boolean(80), // 80% chance of being active
            'is_featured' => $this->faker->boolean(20), // 20% chance of being featured

        ];
    }

    /**
     * Configure the model factory.
     *
     * @return $this
     */
    public function configure()
    {
        return $this->afterCreating(function (Product $product) {
            // Create a default variant
            ProductVariant::factory()
                ->default()
                ->create([
                    'product_id' => $product->id,
                    'sku' => 'SKU-' . $product->id . '-DEFAULT',
                    'quantity' => rand(0, 30),
                ]);

            // Create 0-3 additional variants
            $variantCount = rand(0, 3);
            for ($i = 1; $i <= $variantCount; $i++) {
                ProductVariant::factory()->create([
                    'product_id' => $product->id,
                    'sku' => 'SKU-' . $product->id . '-' . $i,
                    'quantity' => rand(0, 20),
                ]);
            }
        });
    }
}
