import AnnouncementBanner from "@/Components/AnnouncementBanner";
import BrandGrid from "@/Components/BrandGrid";
import CategoryGrid from "@/Components/CategoryGrid";
import HeroCarousel from "@/Components/HeroCarousel";
import ProductGrid from "@/Components/ProductGrid";
import { useI18n } from "@/hooks/use-i18n";
import { useSiteBranding } from "@/hooks/useSettings";
import { App } from "@/types";
import { Head } from "@inertiajs/react";

interface HomePageProps extends App.Interfaces.AppPageProps {
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
    sections?: App.Models.Section[];
}

export default function Home({
    announcements,
    heroSlides,
    categories,
    brands,
    sections,
}: HomePageProps) {
    const { t, getLocalizedField } = useI18n();
    const { title } = useSiteBranding();

    // Filter active categories and brands
    const activeCategories = categories?.filter((cat) => cat.is_active) || [];
    const activeBrands = brands?.filter((brand) => brand.is_active) || [];
    console.log(categories);

    return (
        <>
            <Head title={title} />

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

            {sections &&
                sections.map((section) => (
                    <ProductGrid
                        key={section.id}
                        sectionId={section.id}
                        title={getLocalizedField(section, "title")}
                        viewAllLink={`/sections/${section.id}`}
                        emptyMessage={t(
                            "no_products_available",
                            "No products available in this section"
                        )}
                    />
                ))}
        </>
    );
}
