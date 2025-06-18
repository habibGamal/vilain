import { Card } from "@/Components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { resolveStoragePath } from "@/utils/storageUtils";
import { cn } from "@/lib/utils";
import { Link } from "@inertiajs/react";
import { ArrowLeft, ArrowRight, Award, ShoppingBag } from "lucide-react";
import EmptyState from "./ui/empty-state";
import { Image } from "./ui/Image";
import { App } from "@/types";

interface BrandGridProps {
    brands: App.Models.Brand[];
    title?: string;
}

export default function BrandGrid({ brands, title }: BrandGridProps) {
    const { t, getLocalizedField,direction } = useI18n();

    // Function to determine if a brand should be featured (larger size)
    const isFeatureBrand = (index: number) => {
        return !(index % 3);
    };

    return (
        <section className="py-12 md:py-16">
            <div className="flex items-center justify-between pb-8">
                <div className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                        {title || t("Featured Brands")}
                    </h2>
                </div>
                <Link
                    href="/brands"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors group"
                >
                    {t("view_all", "View All")}
                    {direction === 'rtl' ? (
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    ) : (
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    )}
                </Link>
            </div>

            {brands && brands.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 auto-rows-[200px]">
                    {brands.map((brand, index) => (
                        <Card
                            key={brand.id}
                            className={cn(
                                "group relative transition-all duration-300 hover:shadow-lg overflow-hidden border-muted/40 hover:border-primary/30",
                                isFeatureBrand(index) &&
                                    "sm:col-span-2 sm:row-span-2"
                            )}
                        >
                            <Link
                                href={`/search?brands[]=${brand.id}`}
                                className="block h-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            >
                                <div className="relative h-full bg-background group-hover:bg-muted/10">
                                    {(brand.display_image || brand.image) ? (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={resolveStoragePath(brand.display_image || brand.image) || ''}
                                                alt={getLocalizedField(
                                                    brand,
                                                    "name"
                                                )}
                                                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                                sizes={
                                                    isFeatureBrand(index)
                                                        ? "(max-width: 640px) 100vw, 50vw"
                                                        : "(max-width: 640px) 50vw, 25vw"
                                                }
                                                fallback={
                                                    <div className="w-full h-full flex items-center justify-center bg-muted/5 text-muted-foreground">
                                                        <span className="text-sm font-medium">
                                                            {getLocalizedField(
                                                                brand,
                                                                "name"
                                                            )}
                                                        </span>
                                                    </div>
                                                }
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-muted/5 text-muted-foreground group-hover:bg-muted/10 transition-colors duration-300">
                                            <span className="text-sm font-medium">
                                                {getLocalizedField(
                                                    brand,
                                                    "name"
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <div className="flex items-center gap-2">
                                            <p
                                                className={cn(
                                                    "font-medium line-clamp-1",
                                                    isFeatureBrand(index)
                                                        ? "text-lg"
                                                        : "text-sm"
                                                )}
                                            >
                                                {getLocalizedField(
                                                    brand,
                                                    "name"
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </Card>
                    ))}
                </div>
            ) : (
                <EmptyState
                    title={t("No brands available")}
                    icon={
                        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                    }
                />
            )}
        </section>
    );
}
