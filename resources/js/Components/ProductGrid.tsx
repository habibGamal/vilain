import ProductCard from "@/Components/ProductCard";
import { useI18n } from "@/hooks/use-i18n";
import { PackageOpen, ArrowRight, ArrowLeft } from "lucide-react";
import { Link, WhenVisible, usePage } from "@inertiajs/react";
import { Skeleton } from "@/Components/ui/skeleton";
import { cn } from "@/lib/utils";
import EmptyState from "./ui/empty-state";
import { App } from "@/types";

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
    viewType = "scroll", // Default to horizontal scrolling view
}: ProductGridProps) {
    const { t ,direction } = useI18n();
    const page = usePage();

    const sectionKey = `section_${sectionId}_page`;
    const actualDataKey = `${sectionKey}_data`;
    const actualPaginationKey = `${sectionKey}_pagination`;

    // Get data from page props
    const products = page.props[actualDataKey] as
        | App.Models.Product[]
        | undefined;

    console.log(page.props[actualPaginationKey]);
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
                        <div className="flex items-center gap-2">
                            <PackageOpen className="h-6 w-6 text-primary" />
                            <h2 className="text-2xl md:text-3xl font-bold">
                                {t(title)}
                            </h2>
                        </div>
                    )}
                    {viewAllLink && (
                        <Link
                            href={viewAllLink}
                            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors group"
                        >
                            {t("view_all", "View All")}
                            {direction === 'rtl' ? (
                                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            ) : (
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            )}
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
                    title={
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
