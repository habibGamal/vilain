import { useLanguage } from "@/Contexts/LanguageContext";
import { App } from "@/types";
import { Card, CardContent } from "@/Components/ui/card";
import { Ruler, Weight, Package, PackageOpen } from "lucide-react";
import { EmptyState } from "../ui/empty-state";

interface ProductDimensionsProps {
    product: App.Models.Product;
}

export default function ProductDimensions({ product }: ProductDimensionsProps) {
    const { t } = useLanguage();

    // No need to parse dimensions as it's already cast to array in the Product model
    const dimensions = product.dimensions || {};

    // Check if the product has any dimension information
    const hasDimensions = Object.keys(dimensions).length > 0;

    if (!hasDimensions)
        return (
            <EmptyState
                icon={PackageOpen}
                title={t("no_specifications", "No specifications available")}
                description={t(
                    "product_specifications_empty",
                    "This product doesn't have any specifications yet"
                )}
            />
        );

    return (
        <Card className="">
            <CardContent className="p-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(dimensions).map(([key, value]) => {
                        // Choose appropriate icon based on dimension key
                        let Icon = Package;
                        if (key.toLowerCase().includes("weight")) {
                            Icon = Weight;
                        } else if (
                            key.toLowerCase().includes("length") ||
                            key.toLowerCase().includes("width")
                        ) {
                            Icon = Ruler;
                        }

                        // Format display value with appropriate unit if possible
                        let displayValue = value;
                        let unit = "";

                        if (key.toLowerCase().includes("weight")) {
                            unit = " kg";
                        } else if (
                            key.toLowerCase().includes("length") ||
                            key.toLowerCase().includes("width") ||
                            key.toLowerCase().includes("height") ||
                            key.toLowerCase().includes("dimension")
                        ) {
                            unit = " cm";
                        }

                        return (
                            <div key={key} className="flex items-center gap-2">
                                <Icon
                                    className={`h-5 w-5 text-muted-foreground ${
                                        key.toLowerCase().includes("width")
                                            ? "rotate-90"
                                            : ""
                                    }`}
                                />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {t(
                                            key,
                                            key.charAt(0).toUpperCase() +
                                                key.slice(1).replace("_", " ")
                                        )}
                                    </p>
                                    <p className="font-medium">
                                        {displayValue}
                                        {unit}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
