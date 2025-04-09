import EmptyState from "@/Components/EmptyState";
import { Card } from "@/Components/ui/card";
import { useLanguage } from "@/Contexts/LanguageContext";
import { ShoppingBag } from "lucide-react";
import { App } from "@/types";
import { Image } from "./ui/Image";
import { Link } from "@inertiajs/react";

interface BrandGridProps {
    brands: App.Models.Brand[];
    title?: string;
}

export default function BrandGrid({ brands, title }: BrandGridProps) {
    const { t, getLocalizedField } = useLanguage();

    return (
        <section className="py-12 md:py-16 bg-muted/50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between pb-8">
                    <h2 className="text-2xl md:text-3xl font-bold">
                        {title || t("Featured Brands")}
                    </h2>
                    <Link
                        href="/brands"
                        className="text-primary hover:underline font-medium"
                    >
                        {t("view_all", "View All")}
                    </Link>
                </div>

                {brands && brands.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                        {brands.map((brand) => (
                            <Card
                                key={brand.id}
                                className="group relative transition-all duration-300 hover:shadow-lg overflow-hidden border-muted/40 hover:border-primary/30"
                            >
                                <Link
                                    href={`/brands/${brand.slug}`}
                                    className="block h-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                >
                                    <div className="aspect-[4/3] relative bg-background p-4 flex items-center justify-center group-hover:bg-muted/10">
                                        {brand.image ? (
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={brand.image}
                                                    alt={getLocalizedField(
                                                        brand,
                                                        "name"
                                                    )}
                                                    className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-110 rounded-lg"
                                                    fallback={
                                                        <div className="w-full h-full flex items-center justify-center bg-muted/5 text-muted-foreground rounded-lg group-hover:bg-muted/10 transition-colors duration-300">
                                                            <span className="text-sm font-medium">
                                                                {getLocalizedField(
                                                                    brand,
                                                                    "name"
                                                                )}
                                                            </span>
                                                        </div>
                                                    }
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-muted/5 text-muted-foreground rounded-lg group-hover:bg-muted/10 transition-colors duration-300">
                                                <span className="text-sm font-medium">
                                                    {getLocalizedField(
                                                        brand,
                                                        "name"
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-background/40">
                                        <p className="text-sm font-medium truncate">
                                            {getLocalizedField(brand, "name")}
                                        </p>
                                    </div>
                                </Link>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        message={t("No brands available")}
                        icon={
                            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        }
                    />
                )}
            </div>
        </section>
    );
}
