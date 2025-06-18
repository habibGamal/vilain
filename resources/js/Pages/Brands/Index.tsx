import { Head } from "@inertiajs/react";
import { useI18n } from "@/hooks/use-i18n";
import { resolveStoragePath } from "@/utils/storageUtils";
import { Card } from "@/Components/ui/card";
import { Image } from "@/Components/ui/Image";
import { Award, ShoppingBag } from "lucide-react";
import { Link } from "@inertiajs/react";
import EmptyState from "@/Components/ui/empty-state";
import { cn } from "@/lib/utils";
import { App } from "@/types";

interface BrandsPageProps {
    brands: App.Models.Brand[];
}

export default function Index({ brands }: BrandsPageProps) {
    const { t, getLocalizedField } = useI18n();

    // Function to determine if a brand should be featured (larger size)
    const isFeatureBrand = (index: number) => {
        return !(index % 3);
    };

    return (
        <>
            <Head title={t("brands", "Brands")} />

            <div className="flex items-center gap-2 mb-8">
                <Award className="h-7 w-7 text-primary" />
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {t("brands", "Brands")}
                </h1>
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
                    icon={
                        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                    }
                    title={t("no_brands_available", "No brands available")}
                    description={t(
                        "no_brands_available_description",
                        "There are no brands available at the moment."
                    )}
                />
            )}
        </>
    );
}
