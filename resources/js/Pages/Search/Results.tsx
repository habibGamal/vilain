import { Head } from "@inertiajs/react";
import { useLanguage } from "@/Contexts/LanguageContext";
import ProductGrid from "@/Components/ProductGrid";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Grid, Search } from "lucide-react";
import { useState } from "react";
import { router } from "@inertiajs/react";
import { FilterModal } from "@/Components/FilterModal";
import { SortSelector } from "@/Components/SortSelector";

interface SearchResultsProps {
    query: string;
    filters?: App.Types.SearchFilters;
}

export default function Results({
    query,
    filters = {
        brands: [],
        categories: [],
        priceRange: { min: 0, max: 1000 },
        selectedBrands: [],
        selectedCategories: [],
        minPrice: null,
        maxPrice: null,
        sortBy: "newest",
    },
}: SearchResultsProps) {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState(query || "");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get("/search", {
                q: searchQuery.trim(),
                brands: filters.selectedBrands,
                categories: filters.selectedCategories,
                min_price: filters.minPrice,
                max_price: filters.maxPrice,
                sort_by: filters.sortBy,
            });
        }
    };

    return (
        <>
            <Head title={t("search_results", "Search Results")} />

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                        {t("search_results", "Search Results")}
                    </h1>
                    {query && (
                        <p className="text-muted-foreground">
                            {t("results_for", "Results For", { query })}
                        </p>
                    )}
                </div>
                <div className="w-full md:w-auto">
                    <form
                        onSubmit={handleSearch}
                        className="flex w-full md:w-80"
                    >
                        <div className="relative flex-1">
                            <Input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t(
                                    "search_placeholder",
                                    "Search products..."
                                )}
                                className="w-full pr-8"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                variant="ghost"
                                className="absolute ltr:right-0 rtl:left-0 top-0 h-full"
                            >
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <FilterModal
                        brands={filters.brands}
                        categories={filters.categories}
                        priceRange={filters.priceRange}
                        selectedBrands={filters.selectedBrands}
                        selectedCategories={filters.selectedCategories}
                        minPrice={filters.minPrice}
                        maxPrice={filters.maxPrice}
                        query={query}
                        sortBy={filters.sortBy}
                    />
                    <div className="text-sm text-muted-foreground">
                        {(filters.selectedBrands.length > 0 ||
                            filters.selectedCategories.length > 0 ||
                            filters.minPrice !== null ||
                            filters.maxPrice !== null) && (
                            <span>
                                {t("filters_applied", "Filters applied")}
                            </span>
                        )}
                    </div>
                </div>
                <SortSelector
                    sortBy={filters.sortBy}
                    query={query}
                    selectedBrands={filters.selectedBrands}
                    selectedCategories={filters.selectedCategories}
                    minPrice={filters.minPrice}
                    maxPrice={filters.maxPrice}
                />
            </div>
            <ProductGrid
                sectionId="search_results_products"
                emptyMessage={t(
                    "try_different_keywords",
                    "Try different keywords or filters"
                )}
                className="pt-0"
                viewType="grid"
            />
        </>
    );
}
