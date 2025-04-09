import EmptyState from "@/Components/EmptyState";
import { Card, CardFooter } from "@/Components/ui/card";
import { Image } from "@/Components/ui/Image";
import { useLanguage } from "@/Contexts/LanguageContext";
import { FolderX } from "lucide-react";
import { App } from "@/types";
import { Link } from "@inertiajs/react";

interface CategoryGridProps {
    categories: App.Models.Category[];
    title?: string;
}

export default function CategoryGrid({ categories, title }: CategoryGridProps) {
    const { t, getLocalizedField } = useLanguage();

    return (
        <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between pb-8">
                    <h2 className="text-2xl md:text-3xl font-bold">
                        {title || t("Shop by Category")}
                    </h2>
                    <Link
                        href="/categories"
                        className="text-primary hover:underline font-medium"
                    >
                        {t("view_all", "View All")}
                    </Link>
                </div>

                {categories && categories.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                        {categories.map((category) => (
                            <Card
                                key={category.id}
                                className="transition-all duration-200 hover:shadow-md h-full"
                            >
                                <Link
                                    href={`/categories/${category.slug}`}
                                    className="flex flex-col h-full"
                                >
                                    <div className="aspect-square relative bg-muted">
                                        {category.image ? (
                                            <Image
                                                src={category.image}
                                                alt={getLocalizedField(
                                                    category,
                                                    "name"
                                                )}
                                                className="object-cover w-full h-full"
                                                fallback={
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                        <span>
                                                            {t(
                                                                "no_image",
                                                                "No Image"
                                                            )}
                                                        </span>
                                                    </div>
                                                }
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                <span>
                                                    {t("no_image", "No Image")}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <CardFooter className="p-3 md:p-4">
                                        <h3 className="font-medium truncate text-center w-full">
                                            {getLocalizedField(
                                                category,
                                                "name"
                                            )}
                                        </h3>
                                    </CardFooter>
                                </Link>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        message={t("No categories available")}
                        icon={
                            <FolderX className="h-8 w-8 text-muted-foreground" />
                        }
                    />
                )}
            </div>
        </section>
    );
}
