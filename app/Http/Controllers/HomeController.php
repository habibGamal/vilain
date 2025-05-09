<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Section;
use App\Services\SectionService;
use Illuminate\Foundation\Application;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class HomeController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(SectionService $sectionService)
    {
        // Get sections from the SectionService
        $activeSections = $sectionService->getAllActiveSections();

        // For backward compatibility, still get featured products the old way
        $query = Product::where('is_active', true)
            ->where('is_featured', true)
            ->with([
                'brand' => function ($query) {
                    $query->select('id', 'name_en', 'name_ar', 'slug', 'image');
                }
            ])->paginate(5);

        return Inertia::render('Home', [
            // Auth data
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,

            // Home page specific data
            'sections' => $activeSections,
            
            // Keep legacy data for backward compatibility
            'section_feat_products_page_data' => inertia()->merge(
                $query->items()
            ),
            'section_feat_products_page_pagination' => Arr::except($query->toArray(), ['data']),


            'announcements' => $this->getAnnouncements(),

            'heroSlides' => $this->getHeroSlides(),

            'categories' => Category::where('is_active', true)
                ->select('id', 'name_en', 'name_ar', 'slug', 'image', 'is_active')
                ->orderBy('display_order', 'asc')
                ->limit(10)
                ->get(),

            'brands' => Brand::where('is_active', true)
                ->select('id', 'name_en', 'name_ar', 'slug', 'image', 'is_active')
                ->limit(12)
                ->get(),
        ]);
    }

    /**
     * Get announcements for the top banner.
     *
     * @return \Illuminate\Support\Collection
     */
    private function getAnnouncements()
    {
        // You might want to create an Announcement model if this becomes more complex
        // For now, we'll return some dummy data
        return collect([
            [
                'id' => 1,
                'title_en' => 'Free shipping on all orders over $50',
                'title_ar' => 'شحن مجاني على جميع الطلبات التي تزيد عن 50 دولار'
            ],
            [
                'id' => 2,
                'title_en' => 'Summer sale: Up to 50% off',
                'title_ar' => 'تخفيضات الصيف: خصم يصل إلى 50%'
            ]
        ]);
    }

    /**
     * Get hero slides for the carousel.
     *
     * @return \Illuminate\Support\Collection
     */
    private function getHeroSlides()
    {
        // You might want to create a HeroSlide model if this becomes more complex
        // For now, we'll return some dummy data
        return collect([
            [
                'id' => 1,
                'title_en' => 'New Collection',
                'title_ar' => 'مجموعة جديدة',
                'description_en' => 'Discover our latest products with premium quality and exclusive deals.',
                'description_ar' => 'اكتشف أحدث منتجاتنا ذات الجودة العالية والعروض الحصرية.',
                'image' => 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200',
                'cta_link' => '/products/new-arrivals'
            ],
            [
                'id' => 2,
                'title_en' => 'Summer Sale',
                'title_ar' => 'تخفيضات الصيف',
                'description_en' => 'Up to 50% off on selected items. Limited time offer.',
                'description_ar' => 'خصم يصل إلى 50٪ على منتجات مختارة. عرض لفترة محدودة.',
                'image' => 'https://images.unsplash.com/photo-1574634534894-89d7576c8259?q=80&w=1200',
                'cta_link' => '/products/on-sale'
            ]
        ]);
    }
}
