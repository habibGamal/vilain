<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum PaymentStatus: string implements HasColor, HasIcon, HasLabel
{
    /**
     * Pending status used for the cash-on-delivery payment method.
     * This status indicates that the payment has not yet been completed.
     * After the order is delivered, the status will be updated to PAID.
     */
    case PENDING = 'pending';
    case PAID = 'paid';

    public function getColor(): ?string
    {
        return match ($this) {
            self::PENDING => 'warning',
            self::PAID => 'success',
        };
    }

    public function getIcon(): ?string
    {
        return match ($this) {
            self::PENDING => 'heroicon-o-clock',
            self::PAID => 'heroicon-o-check-circle',
        };
    }

    public function getLabel(): ?string
    {
        return match ($this) {
            self::PENDING => 'قيد الانتظار',
            self::PAID => 'تم الدفع',
        };
    }

    public static function toSelectArray(): array
    {
        return [
            self::PENDING->value => self::PENDING->getLabel(),
            self::PAID->value => self::PAID->getLabel(),
        ];
    }
}
