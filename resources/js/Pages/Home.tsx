import AnnouncementBanner from "@/Components/AnnouncementBanner";
import BrandGrid from "@/Components/BrandGrid";
import CategoryGrid from "@/Components/CategoryGrid";
import HeroCarousel from "@/Components/HeroCarousel";
import ProductGrid from "@/Components/ProductGrid";
import { useLanguage } from "@/Contexts/LanguageContext";
import { App } from "@/types";
import { Head } from "@inertiajs/react";

interface HomePageProps extends App.Interfaces.AppPageProps {
    featuredProducts: App.Models.Product[];
    announcements: { id: number; title_en: string; title_ar: string }[];
    heroSlides: {
        id: number;
        title_en: string;
        title_ar: string;
        description_en: string;
        description_ar: string;
        image: string;
        cta_link: string;
    }[];
}

export default function Home({
    featuredProducts,
    announcements,
    heroSlides,
    categories,
    brands,
}: HomePageProps) {
    const { t } = useLanguage();

    // Filter active categories and brands
    const activeCategories = categories?.filter((cat) => cat.is_active) || [];
    const activeBrands = brands?.filter((brand) => brand.is_active) || [];

    return (
        <>
            <Head title={t("Home")} />

            {/* Top Announcement Banner */}
            {announcements && announcements.length > 0 && (
                <AnnouncementBanner announcements={announcements} />
            )}

            {/* Hero Carousel/Slider */}
            {heroSlides && heroSlides.length > 0 && (
                <HeroCarousel heroSlides={heroSlides} />
            )}

            {/* Category Grid */}
            <CategoryGrid
                categories={activeCategories}
                title={t("shop_by_category", "Shop by Category")}
            />

            {/* Brand Grid */}
            <BrandGrid
                brands={activeBrands.slice(0, 12)}
                title={t("our_brands", "Our Brands")}
            />

            {/* Best Offers Product Grid */}
            <ProductGrid
                sectionId="feat"
                title={t("best_offers", "Best Offers")}
                viewAllLink="/products?on_sale=1"
                emptyMessage={t("no_offers_available", "No offers available")}
            />
        </>
    );
}
