import { Link } from "@inertiajs/react";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/Components/ui/navigation-menu";
import { FolderX, ShoppingBag } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";
import { App } from "@/types";
import EmptyState from "./ui/empty-state";

interface DesktopNavProps {
    brands: App.Models.Brand[];
    categories: App.Models.Category[];
}

export default function DesktopNav({ brands, categories }: DesktopNavProps) {
    const { t, getLocalizedField, direction } = useI18n();

    return (
        <div className="hidden flex-1 lg:flex">
            <NavigationMenu>
                <NavigationMenuList dir={direction}>
                    <NavigationMenuItem>
                        <Link href="/" className={navigationMenuTriggerStyle()}>
                            {t("home", "Home")}
                        </Link>
                    </NavigationMenuItem>

                    {/* Brands Dropdown */}
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>
                            {t("brands", "Brands")}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            {brands && brands.length > 0 ? (
                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                    {brands.map((brand) => (
                                        <li key={brand.id}>
                                            <NavigationMenuLink asChild>
                                                <Link
                                                    href={`/search?brands[]=${brand.id}`}
                                                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                                >
                                                    <div className="text-sm font-medium leading-none">
                                                        {getLocalizedField(
                                                            brand,
                                                            "name"
                                                        )}
                                                    </div>
                                                    {/* Description is not available in the updated model */}
                                                </Link>
                                            </NavigationMenuLink>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="w-[300px] p-6">
                                    <EmptyState
                                        icon={<ShoppingBag />}
                                        title={t(
                                            "no_brands_available",
                                            "No brands available"
                                        )}
                                    />
                                </div>
                            )}
                        </NavigationMenuContent>
                    </NavigationMenuItem>

                    {/* Categories Dropdown */}
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>
                            {t("categories", "Categories")}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            {categories && categories.length > 0 ? (
                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                    {categories.map((category) => (
                                        <li key={category.id}>
                                            <NavigationMenuLink asChild>
                                                <Link
                                                    href={`/search?categories[]=${category.id}`}
                                                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                                >
                                                    <div className="text-sm font-medium leading-none">
                                                        {getLocalizedField(
                                                            category,
                                                            "name"
                                                        )}
                                                    </div>
                                                </Link>
                                            </NavigationMenuLink>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="w-[300px] p-6">
                                    <EmptyState
                                        icon={<FolderX size={32} />}
                                        title={t(
                                            "no_categories_available",
                                            "No categories available"
                                        )}
                                    />
                                </div>
                            )}
                        </NavigationMenuContent>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                        <Link
                            href="/best-sellers"
                            className={navigationMenuTriggerStyle()}
                        >
                            {t("best_sellers", "Best Sellers")}
                        </Link>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                        <Link
                            href="/contact"
                            className={navigationMenuTriggerStyle()}
                        >
                            {t("contact", "Contact")}
                        </Link>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    );
}
