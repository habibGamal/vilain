import { Button } from "@/Components/ui/button";
import { useLanguage } from "@/Contexts/LanguageContext";
import useCart from "@/Hooks/useCart";
import { App } from "@/types";
import { Heart, ShoppingBag } from "lucide-react";

interface ProductActionsProps {
    product: App.Models.Product;
    quantity: number;
}

export default function ProductActions({
    product,
    quantity,
}: ProductActionsProps) {
    const { t } = useLanguage();
    const { addToCart, addingToCart } = useCart();

    const handleAddToCart = () => {
        if (product.quantity > 0) {
            addToCart(product.id, quantity);
        }
    };

    const isOutOfStock = product.quantity <= 0;

    return (
        <div className="flex gap-3 flex-row">
            <Button
                onClick={handleAddToCart}
                disabled={addingToCart[product.id] || isOutOfStock}
                className="flex-1"
                size="lg"
            >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {addingToCart[product.id]
                    ? t("adding_to_cart", "Adding to Cart...")
                    : isOutOfStock
                    ? t("out_of_stock", "Out of Stock")
                    : t("add_to_cart", "Add to Cart")}
            </Button>

            <Button variant="outline" size="lg" className="flex-shrink-0">
                <Heart className="w-5 h-5" />
                <span className="sr-only">
                    {t("add_to_wishlist", "Add to Wishlist")}
                </span>
            </Button>
        </div>
    );
}
