<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Call seeders in the correct order
        $this->call([
            GovSeeder::class,
            AreaSeeder::class,
            ShippingCostSeeder::class,
            UserSeeder::class,
            SectionSeeder::class,
            AnnouncementSeeder::class,
            HeroSlideSeeder::class,
            SettingsSeeder::class,
        ]);
    }
}
