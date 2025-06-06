import { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Card } from "@/Components/ui/card";
import { useLanguage } from "@/Contexts/LanguageContext";
import { App } from "@/types";
import { router } from "@inertiajs/react";
import { PromotionCode } from "./PromotionCode";

interface OrderSummaryProps {
  cartSummary: App.Models.CartSummary;
}

export function OrderSummary({ cartSummary }: OrderSummaryProps) {
  const { t } = useLanguage();
  const [discount, setDiscount] = useState(0);
  const [appliedPromotion, setAppliedPromotion] = useState<any>(null);

  const handlePromotionApplied = (promotionData: any) => {
    setDiscount(promotionData.discount);
    setAppliedPromotion(promotionData.promotion);
  };

  const handlePromotionRemoved = () => {
    setDiscount(0);
    setAppliedPromotion(null);
  };

  const totalAfterDiscount = Math.max(0, cartSummary.totalPrice - discount);

  return (
    <div className="lg:col-span-1">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('order_summary', 'Order Summary')}</h3>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('subtotal', 'Subtotal')}</span>
            <span>EGP {cartSummary.totalPrice.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>{t('discount', 'Discount')}</span>
              <span>- EGP {discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('shipping', 'Shipping')}</span>
            <span>{t('calculated_at_checkout', 'Calculated at checkout')}</span>
          </div>

          <PromotionCode
            onPromotionApplied={handlePromotionApplied}
            onPromotionRemoved={handlePromotionRemoved}
          />

          <div className="border-t pt-4 flex justify-between font-semibold">
            <span>{t('total', 'Total')}</span>
            <span>EGP {totalAfterDiscount.toFixed(2)}</span>
          </div>
          <Button onClick={()=>router.get(route('checkout.index'))} className="w-full" size="lg">
            {t('proceed_to_checkout', 'Proceed to Checkout')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
