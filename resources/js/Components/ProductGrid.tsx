import EmptyState from "@/Components/EmptyState";
import ProductCard from "@/Components/ProductCard";
import { useLanguage } from "@/Contexts/LanguageContext";
import { PackageOpen } from "lucide-react";
import { Link, WhenVisible, usePage } from "@inertiajs/react";
import { Skeleton } from "@/Components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProductGridProps {
    title?: string | null;
    viewAllLink?: string | null;
    emptyMessage?: string;
    className?: string;
    sectionId: string | number;
    dataKey?: string;
    paginationKey?: string;
    viewType?: "scroll" | "grid"; // Added viewType prop
}

export default function ProductGrid({
    title,
    viewAllLink,
    emptyMessage,
    className = "",
    sectionId,
    paginationKey,
    dataKey,
    viewType = "scroll", // Default to horizontal scrolling view
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
        <div
            className={cn(
                "space-y-3",
                viewType === "scroll"
                    ? "snap-start flex-shrink-0 w-[250px] sm:w-[300px]"
                    : "w-full"
            )}
        >
            <Skeleton className="w-full h-[180px] rounded-lg" />
            <Skeleton className="w-3/4 h-5 rounded" />
            <Skeleton className="w-1/2 h-4 rounded" />
            <Skeleton className="w-1/4 h-6 rounded" />
        </div>
    );

    return (
        <section className={cn(`py-12 md:py-16`, className)}>
            {(title || viewAllLink) && (
                <div className="flex items-center justify-between pb-8">
                    {title && (
                        <h2 className="text-2xl md:text-3xl font-bold">
                            {t(title)}
                        </h2>
                    )}
                    {viewAllLink && (
                        <Link
                            href={viewAllLink}
                            className="text-primary hover:underline font-medium"
                        >
                            {t("view_all", "View All")}
                        </Link>
                    )}
                </div>
            )}

            {products && products.length > 0 ? (
                <div
                    className={cn(
                        viewType === "scroll"
                            ? "flex overflow-x-auto pb-4 gap-4 snap-x scrollbar-hide"
                            : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
                    )}
                >
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className={cn(
                                viewType === "scroll"
                                    ? "snap-start flex-shrink-0 w-[250px] sm:w-[300px]"
                                    : ""
                            )}
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
