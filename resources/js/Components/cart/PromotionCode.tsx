import React, { useState } from 'react';
import { useLanguage } from "@/Contexts/LanguageContext";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Label } from "@/Components/ui/label";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import axios from 'axios';

interface PromotionCodeProps {
  onPromotionApplied: (promotionData: {
    discount: number;
    promotion: {
      id: number;
      name: string;
      code: string;
      type: string;
    };
  }) => void;
  onPromotionRemoved: () => void;
}

export function PromotionCode({ onPromotionApplied, onPromotionRemoved }: PromotionCodeProps) {
  const { t } = useLanguage();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [appliedPromotion, setAppliedPromotion] = useState<any>(null);

  const handleApplyPromotion = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await axios.post(route('promotions.apply'), { code });

      setSuccessMessage(response.data.message);
      setAppliedPromotion(response.data.promotion);

      onPromotionApplied({
        discount: response.data.discount,
        promotion: response.data.promotion
      });
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message ||
        t('promotion_code_error', 'There was an error applying the promotion code')
      );
      setSuccessMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePromotion = async () => {
    setIsLoading(true);

    try {
      const response = await axios.delete(route('promotions.remove'));
      setCode('');
      setAppliedPromotion(null);
      setSuccessMessage(response.data.message);
      setErrorMessage(null);
      onPromotionRemoved();
    } catch (error) {
      setErrorMessage(t('promotion_remove_error', 'Error removing promotion code'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 mb-4 space-y-2">
      <Label htmlFor="promotion-code">{t('promotion_code', 'Promotion Code')}</Label>

      {!appliedPromotion ? (
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Input
            id="promotion-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t('enter_promotion_code', 'Enter promotion code')}
            disabled={isLoading}
          />
          <Button
            onClick={handleApplyPromotion}
            disabled={!code.trim() || isLoading}
            variant="outline"
          >
            {isLoading ? t('applying', 'Applying...') : t('apply', 'Apply')}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-2 border rounded-md bg-muted/30">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <CheckCircledIcon className="text-green-600 h-5 w-5" />
            <span className="font-medium">{appliedPromotion.code}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemovePromotion}
            disabled={isLoading}
          >
            {t('remove', 'Remove')}
          </Button>
        </div>
      )}

      {errorMessage && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription className="flex items-center gap-2">
            <CrossCircledIcon /> {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {successMessage && !errorMessage && (
        <Alert variant="success" className="mt-2 bg-green-50 text-green-800 border-green-200">
          <AlertDescription className="flex items-center gap-2">
            <CheckCircledIcon /> {successMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
