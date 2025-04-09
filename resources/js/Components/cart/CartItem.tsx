import { Button } from "@/Components/ui/button";
import { Card } from "@/Components/ui/card";
import { Image } from "@/Components/ui/Image";
import { useLanguage } from "@/Contexts/LanguageContext";
import { App } from "@/types";
import { Trash2, MinusCircle, PlusCircle } from "lucide-react";

interface CartItemProps {
    item: App.Models.CartItem;
    isLoading: Record<string, boolean>;
    updateCartItemQuantity: (id: number, quantity: number) => void;
    removeCartItem: (id: number) => void;
    calculateItemTotal: (item: App.Models.CartItem) => string;
}

export function CartItem({
    item,
    isLoading,
    updateCartItemQuantity,
    removeCartItem,
    calculateItemTotal,
}: CartItemProps) {
    const { t } = useLanguage();

    return (
        <Card className="overflow-hidden">
            <div className="p-3 sm:p-4">
                <div className="flex flex-row gap-3 sm:gap-4 items-start">
                    {/* Product Image */}
                    <div className="h-14 w-14 sm:h-24 sm:w-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <Image
                            src={item.product.image}
                            alt={item.product.name_en}
                            className="h-full w-full object-cover"
                            fallbackSrc="/placeholder.svg"
                        />
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow space-y-3 sm:space-y-4 w-full">
                        <div className="flex justify-between items-start gap-2">
                            <h4 className="font-medium line-clamp-2 text-sm sm:text-base">
                                {item.product.name_en}
                            </h4>

                            <div className="flex items-center ml-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={isLoading[item.id]}
                                    onClick={() => removeCartItem(item.id)}
                                    className="text-destructive hover:text-destructive/80 h-7 w-7 sm:h-8 sm:w-8"
                                >
                                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Mobile view - price and total in the same row */}
                        <div className="flex flex-col gap-3 sm:hidden">
                            <div className="flex justify-between items-center">
                                {/* Price */}
                                <div>
                                    <div className="text-xs font-medium text-muted-foreground mb-0.5">
                                        {t("price", "Price")}
                                    </div>
                                    <div className="flex flex-col">
                                        {item.product.sale_price && (
                                            <span className="text-primary font-medium text-sm">
                                                $
                                                {Number(
                                                    item.product.sale_price
                                                ).toFixed(2)}
                                            </span>
                                        )}
                                        <span
                                            className={
                                                item.product.sale_price
                                                    ? "text-xs line-through text-muted-foreground"
                                                    : "text-primary font-medium text-sm"
                                            }
                                        >
                                            $
                                            {Number(item.product.price).toFixed(
                                                2
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Quantity for mobile */}
                                <div>
                                    <div className="text-xs font-medium text-muted-foreground mb-0.5">
                                        {t("quantity", "Quantity")}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-7 w-7"
                                            disabled={
                                                isLoading[item.id] ||
                                                item.quantity <= 1
                                            }
                                            onClick={() =>
                                                updateCartItemQuantity(
                                                    item.id,
                                                    item.quantity - 1
                                                )
                                            }
                                        >
                                            <MinusCircle className="h-3.5 w-3.5" />
                                        </Button>
                                        <span className="w-7 text-center text-sm">
                                            {item.quantity}
                                        </span>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-7 w-7"
                                            disabled={isLoading[item.id]}
                                            onClick={() =>
                                                updateCartItemQuantity(
                                                    item.id,
                                                    item.quantity + 1
                                                )
                                            }
                                        >
                                            <PlusCircle className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Total for mobile */}
                            <div className="flex gap-2">
                                <div className="text-xs font-medium text-muted-foreground mb-0.5">
                                    {t("total", "Total")}
                                </div>
                                <div className="font-semibold text-sm">
                                    ${calculateItemTotal(item)}
                                </div>
                            </div>
                        </div>

                        {/* Desktop view */}
                        <div className="hidden sm:flex sm:flex-row sm:items-center justify-between gap-4">
                            {/* Price */}
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">
                                    {t("price", "Price")}
                                </div>
                                <div className="flex flex-col">
                                    {item.product.sale_price && (
                                        <span className="text-primary font-medium">
                                            $
                                            {Number(
                                                item.product.sale_price
                                            ).toFixed(2)}
                                        </span>
                                    )}
                                    <span
                                        className={
                                            item.product.sale_price
                                                ? "text-xs line-through text-muted-foreground"
                                                : "text-primary font-medium"
                                        }
                                    >
                                        ${Number(item.product.price).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Quantity */}
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">
                                    {t("quantity", "Quantity")}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-8 w-8"
                                        disabled={
                                            isLoading[item.id] ||
                                            item.quantity <= 1
                                        }
                                        onClick={() =>
                                            updateCartItemQuantity(
                                                item.id,
                                                item.quantity - 1
                                            )
                                        }
                                    >
                                        <MinusCircle className="h-4 w-4" />
                                    </Button>
                                    <span className="w-8 text-center">
                                        {item.quantity}
                                    </span>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-8 w-8"
                                        disabled={isLoading[item.id]}
                                        onClick={() =>
                                            updateCartItemQuantity(
                                                item.id,
                                                item.quantity + 1
                                            )
                                        }
                                    >
                                        <PlusCircle className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Total */}
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">
                                    {t("total", "Total")}
                                </div>
                                <div className="font-semibold">
                                    ${calculateItemTotal(item)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
