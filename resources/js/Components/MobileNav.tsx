import { Link } from "@inertiajs/react";
import { Sheet, SheetContent, SheetTrigger } from "@/Components/ui/sheet";
import { Button } from "@/Components/ui/button";
import { FolderX, Menu, ShoppingBag } from "lucide-react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import { useLanguage } from "@/Contexts/LanguageContext";
import LanguageSwitcher from "@/Components/LanguageSwitcher";
import { EmptyState } from "@/Components/ui/empty-state";
import { App } from "@/types";

interface MobileNavProps {
    brands: App.Models.Brand[];
    categories: App.Models.Category[];
}

export default function MobileNav({ brands, categories }: MobileNavProps) {
    const { direction, t, getLocalizedField } = useLanguage();
    const isRtl = direction === "rtl";

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    aria-label="Menu"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent
                side={isRtl ? "left" : "right"}
                className="w-[300px] sm:w-[400px]"
            >
                <div className="flex flex-col gap-6 py-6">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center">
                            <ApplicationLogo className="h-8 w-auto" />
                        </Link>
                        <div className="flex items-center">
                            <LanguageSwitcher className="hover:bg-muted hover:text-primary" />
                            <span className="ml-2 text-sm font-medium">
                                {t("switch_language", "Switch Language")}
                            </span>
                        </div>
                    </div>

                    <nav className="flex flex-col space-y-4">
                        <Link href="/" className="text-lg font-medium">
                            {t("home", "Home")}
                        </Link>

                        {/* Brands Section */}
                        <div className="space-y-2">
                            <h3 className="font-medium text-muted-foreground">
                                {t("brands", "Brands")}
                            </h3>
                            {brands && brands.length > 0 ? (
                                <div className="ltr:ml-4 rtl:mr-4 flex flex-col space-y-2">
                                    {brands.map((brand) => (
                                        <Link
                                            key={brand.id}
                                            href={`/brands/${brand.slug}`}
                                            className="text-sm hover:text-primary"
                                        >
                                            {getLocalizedField(brand, "name")}
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="ltr:ml-4 rtl:mr-4">
                                    <EmptyState
                                        icon={ShoppingBag}
                                        title={t(
                                            "no_brands_available",
                                            "No brands available"
                                        )}
                                        iconSize={24}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Categories Section */}
                        <div className="space-y-2">
                            <h3 className="font-medium text-muted-foreground">
                                {t("categories", "Categories")}
                            </h3>
                            {categories && categories.length > 0 ? (
                                <div className="ltr:ml-4 rtl:mr-4 flex flex-col space-y-2">
                                    {categories.map((category) => (
                                        <Link
                                            key={category.id}
                                            href={`/categories/${category.slug}`}
                                            className="text-sm hover:text-primary"
                                        >
                                            {getLocalizedField(
                                                category,
                                                "name"
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="ltr:ml-4 rtl:mr-4">
                                    <EmptyState
                                        icon={FolderX}
                                        title={t(
                                            "no_categories_available",
                                            "No categories available"
                                        )}
                                        iconSize={24}
                                    />
                                </div>
                            )}
                        </div>

                        <Link
                            href="/best-sellers"
                            className="text-lg font-medium"
                        >
                            {t("best_sellers", "Best Sellers")}
                        </Link>
                        <Link href="/contact" className="text-lg font-medium">
                            {t("contact", "Contact")}
                        </Link>
                    </nav>
                </div>
            </SheetContent>
        </Sheet>
    );
}
