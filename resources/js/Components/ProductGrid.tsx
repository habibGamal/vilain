import EmptyState from "@/Components/EmptyState";
import ProductCard from "@/Components/ProductCard";
import { useLanguage } from "@/Contexts/LanguageContext";
import { PackageOpen } from "lucide-react";
import { App } from "@/types";
import { Link, WhenVisible, usePage } from "@inertiajs/react";
import { Skeleton } from "@/Components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProductGridProps {
    title?: string;
    viewAllLink?: string;
    emptyMessage?: string;
    className?: string;
    sectionId: string | number;
    dataKey?: string;
    paginationKey?: string;
}

export default function ProductGrid({
    title = "featured_products",
    viewAllLink = "/products",
    emptyMessage,
    className = "",
    sectionId,
    paginationKey,
    dataKey,
}: ProductGridProps) {
    const { t } = useLanguage();
    const page = usePage();

    // Calculate section-based keys
    const sectionKey = `section_${sectionId}_products_page`;
    const actualDataKey = `${sectionKey}_data`;
    const actualPaginationKey = `${sectionKey}_pagination`;

    // Get data from page props
    const products = page.props[actualDataKey] as
        | App.Models.Product[]
        | undefined;
    const pagination = page.props[actualPaginationKey] as any;

    const ProductCardSkeleton = () => (
        <div className="snap-start flex-shrink-0 w-[250px] sm:w-[300px] space-y-3">
            <Skeleton className="w-full h-[180px] rounded-lg" />
            <Skeleton className="w-3/4 h-5 rounded" />
            <Skeleton className="w-1/2 h-4 rounded" />
            <Skeleton className="w-1/4 h-6 rounded" />
        </div>
    );

    return (
        <section className={cn(`py-12 md:py-16`, className)}>
            <div className="flex items-center justify-between pb-8">
                <h2 className="text-2xl md:text-3xl font-bold">{t(title)}</h2>
                <Link
                    href={viewAllLink}
                    className="text-primary hover:underline font-medium"
                >
                    {t("view_all", "View All")}
                </Link>
            </div>

            {products && products.length > 0 ? (
                <div className="flex overflow-x-auto pb-4 gap-4 snap-x scrollbar-hide">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="snap-start flex-shrink-0 w-[250px] sm:w-[300px]"
                        >
                            <ProductCard product={product} />
                        </div>
                    ))}

                    {pagination && pagination.next_page_url && (
                        <WhenVisible
                            params={{
                                only: [actualDataKey, actualPaginationKey],
                                data: {
                                    [sectionKey]: pagination.current_page + 1,
                                },
                                preserveUrl: true,
                                onSuccess: (page) => {
                                    window.history.state.page.props =
                                        page.props;
                                },
                            }}
                            always={!!pagination.next_page_url}
                            fallback={<ProductCardSkeleton />}
                        >
                            <ProductCardSkeleton />
                        </WhenVisible>
                    )}
                </div>
            ) : (
                <EmptyState
                    message={
                        emptyMessage ||
                        t("no_products_available", "No products available")
                    }
                    icon={
                        <PackageOpen className="h-8 w-8 text-muted-foreground" />
                    }
                />
            )}
        </section>
    );
}
