import { App } from "@/types";
import ProductGrid from "@/Components/ProductGrid";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { useLanguage } from "@/Contexts/LanguageContext";
import { Button } from "@/Components/ui/button";
import { Link } from "@inertiajs/react";
import { ChevronRight } from "lucide-react";
import EmptyState from "@/Components/EmptyState";

interface ProductSectionProps {
    section: App.Models.Section;
    showViewAll?: boolean;
    viewAllLink?: string;
}

export default function ProductSection({
    section,
    showViewAll = false,
    viewAllLink = "/products",
}: ProductSectionProps) {
    const { currentLang } = useLanguage();
    const titleKey = `title_${currentLang}` as keyof typeof section;
    const title = section[titleKey] as string;

    // Check if section has products
    const hasProducts = section.products && section.products.length > 0;

    return (
        <Card className="w-full shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl md:text-2xl">{title}</CardTitle>
                {showViewAll && hasProducts && (
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={viewAllLink} className="flex items-center">
                            {currentLang === 'en' ? 'View all' : 'عرض الكل'}
                            <ChevronRight className="ms-1 h-4 w-4" />
                        </Link>
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {hasProducts ? (
                    <ProductGrid products={section.products} />
                ) : (
                    <EmptyState
                        title={currentLang === 'en' ? 'No products found' : 'لم يتم العثور على منتجات'}
                        description={
                            currentLang === 'en'
                                ? 'There are no products in this section yet.'
                                : 'لا توجد منتجات في هذا القسم حتى الآن.'
                        }
                    />
                )}
            </CardContent>
        </Card>
    );
}
