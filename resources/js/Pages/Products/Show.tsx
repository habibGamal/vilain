import { useState } from "react";
import { Head } from "@inertiajs/react";
import { useLanguage } from "@/Contexts/LanguageContext";
import ProductImageGallery from "@/Components/Products/ProductImageGallery";
import ProductInfo from "@/Components/Products/ProductInfo";
import ProductQuantitySelector from "@/Components/Products/ProductQuantitySelector";
import ProductActions from "@/Components/Products/ProductActions";
import ProductDimensions from "@/Components/Products/ProductDimensions";
import ProductTabs from "@/Components/Products/ProductTabs";
import ProductGrid from "@/Components/ProductGrid";
import ProductDescription from "@/Components/Products/ProductDescription";
import { App } from "@/types";

interface ShowProps {
    product: App.Models.Product;
    relatedProducts: App.Models.Product[];
}

export default function Show({ product, relatedProducts }: ShowProps) {
    const { t, getLocalizedField } = useLanguage();
    const [quantity, setQuantity] = useState(1);

    // Extract images from the product
    const productImages = [product.image, ...(product.gallery || [])].filter(
        Boolean
    ) as string[];

    // If no images, add a placeholder
    if (productImages.length === 0) {
        productImages.push("/placeholder.svg");
    }

    return (
        <>
            <Head title={getLocalizedField(product, "name")} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-4">
                {/* Left column - Product images */}
                <div>
                    <ProductImageGallery
                        images={productImages}
                        productName={getLocalizedField(product, "name")}
                    />
                </div>

                {/* Right column - Product details */}
                <div className="flex flex-col">
                    <ProductInfo product={product} />

                    {product.quantity > 0 && (
                        <div className="space-y-6 mb-6">
                            <ProductQuantitySelector
                                maxQuantity={product.quantity}
                                onChange={setQuantity}
                            />
                            <ProductActions
                                product={product}
                                quantity={quantity}
                            />
                        </div>
                    )}
                    {/* Description - using the separate component */}
                    <div className="mb-8">
                        <ProductDescription product={product} />
                    </div>
                </div>
            </div>
            {/* Tabs section */}
            <ProductTabs product={product} />

            {/* Related products */}
            <ProductGrid
                sectionId="related"
                title="related_products"
                emptyMessage={t(
                    "no_related_products",
                    "No related products found"
                )}
            />
        </>
    );
}
