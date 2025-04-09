<?php

namespace Database\Factories;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
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
            'image' => $this->faker->imageUrl(640, 480, 'product', true), // Use Faker's imageUrl
            'description_en' => $this->faker->paragraphs(3, true),
            'description_ar' => $this->faker->paragraphs(3, true),
            'price' => $this->faker->randomFloat(2, 10, 500),
            'sale_price' => $this->faker->optional(0.3)->randomFloat(2, 5, 450),
            'cost_price' => $this->faker->randomFloat(2, 1, 300),
            'quantity' => $this->faker->numberBetween(0, 100),
            'category_id' => Category::factory(),
            'brand_id' => Brand::factory(),
            'is_active' => $this->faker->boolean(80), // 80% chance of being active
            'is_featured' => $this->faker->boolean(20), // 20% chance of being featured
            'dimensions' => [
                'width' => $this->faker->numberBetween(10, 100),
                'height' => $this->faker->numberBetween(10, 100),
                'length' => $this->faker->numberBetween(10, 100),
                'weight' => $this->faker->randomFloat(2, 0.1, 20),
            ],
        ];
    }
}
