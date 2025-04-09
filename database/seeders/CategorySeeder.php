<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create parent categories
        $parentCategories = Category::factory()
            ->count(5)
            ->create();

        // Create child categories for each parent
        foreach ($parentCategories as $parentCategory) {
            Category::factory()
                ->count(3)
                ->create([
                    'parent_id' => $parentCategory->id,
                ]);
        }
    }
}
