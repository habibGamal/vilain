import { Badge } from "@/Components/ui/badge";
import { useI18n } from "@/hooks/use-i18n";
import { Link } from "@inertiajs/react";
import { AlertCircle, Check } from "lucide-react";
import { App } from "@/types";

interface ProductInfoProps {
    product: App.Models.Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
    const { getLocalizedField, t } = useI18n();
    const isInStock = product.isInStock;
    console.log(product)
    return (
        <div className="flex flex-col">
            {/* Brand */}
            {product.brand && (
                <Badge variant="outline" className="w-fit mb-3">
                    {getLocalizedField(product.brand, "name")}
                </Badge>
            )}

            {/* Product Name */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {getLocalizedField(product, "name")}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
                {product.sale_price ? (
                    <>
                        <span className="text-2xl md:text-3xl font-bold">
                            {product.sale_price} EGP
                        </span>
                        <span className="text-xl text-muted-foreground line-through">
                            {product.price} EGP
                        </span>
                        <Badge variant="destructive" className="ml-2">
                            {Math.round(
                                ((product.price - product.sale_price) /
                                    product.price) *
                                    100
                            )}
                            % {t("off", "OFF")}
                        </Badge>
                    </>
                ) : (
                    <span className="text-2xl md:text-3xl font-bold">
                        {product.price} EGP
                    </span>
                )}
            </div>
            <div className="flex justify-between">
                {product.category && (
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-muted-foreground">
                            {t("category", "Category")}:
                        </span>
                        <Link
                            href={`/search?categories[]=${product.category.id}`}
                            className="text-primary hover:underline"
                        >
                            {getLocalizedField(product.category, "name")}
                        </Link>
                    </div>
                )}

                {/* Availability */}
                <div className="mb-6">
                    <Badge
                        variant={isInStock ? "outline" : "destructive"}
                        className="inline-flex items-center gap-1.5 py-1 px-3"
                    >
                        {isInStock ? (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                            <AlertCircle className="h-3.5 w-3.5" />
                        )}
                        <span className="font-medium">
                            {isInStock
                                ? `${t("in_stock", "In Stock")} · ${
                                      product.totalQuantity
                                  } ${t("available", "available")}`
                                : t("out_of_stock", "Out of Stock")}
                        </span>
                    </Badge>
                </div>
            </div>
        </div>
    );
}
