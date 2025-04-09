import { Button } from "@/Components/ui/button";
import { useLanguage } from "@/Contexts/LanguageContext";
import { App } from "@/types";
import { router } from "@inertiajs/react";
import { CartItem } from "./CartItem";

interface CartItemListProps {
  items: App.Models.CartItem[];
  isLoading: Record<string, boolean>;
  updateCartItemQuantity: (id: number, quantity: number) => void;
  removeCartItem: (id: number) => void;
  calculateItemTotal: (item: App.Models.CartItem) => string;
  clearCart: () => void;
}

export function CartItemList({
  items,
  isLoading,
  updateCartItemQuantity,
  removeCartItem,
  calculateItemTotal,
  clearCart
}: CartItemListProps) {
  const { t } = useLanguage();

  return (
    <div className="lg:col-span-2">
      <div className="space-y-4">
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            isLoading={isLoading}
            updateCartItemQuantity={updateCartItemQuantity}
            removeCartItem={removeCartItem}
            calculateItemTotal={calculateItemTotal}
          />
        ))}
      </div>

      <div className="mt-4 flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.visit(route('home'))}
        >
          {t('continue_shopping', 'Continue Shopping')}
        </Button>
        <Button
          variant="ghost"
          className="text-destructive"
          onClick={clearCart}
        >
          {t('clear_cart', 'Clear Cart')}
        </Button>
      </div>
    </div>
  );
}
