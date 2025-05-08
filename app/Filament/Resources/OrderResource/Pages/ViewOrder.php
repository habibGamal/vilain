<?php

namespace App\Filament\Resources\OrderResource\Pages;

use App\Enums\OrderStatus;
use App\Filament\Resources\OrderResource;
use Filament\Actions\Action;
use Filament\Infolists\Infolist;
use Filament\Resources\Pages\ViewRecord;
use Filament\Notifications\Notification;

class ViewOrder extends ViewRecord
{
    protected static string $resource = OrderResource::class;


    protected function getHeaderActions(): array
    {
        return [
            Action::make('deliver')
                ->label('تحديد كمسلم')
                ->icon('heroicon-o-truck')
                ->color('success')
                ->visible(fn($record) => $record->order_status === OrderStatus::SHIPPED)
                ->action(function () {
                    $this->record->order_status = OrderStatus::DELIVERED;
                    $this->record->save();

                    Notification::make()
                        ->title('تم تحديد الطلب كمسلم')
                        ->success()
                        ->send();
                }),
            Action::make('ship')
                ->label('تحديد كمشحون')
                ->icon('heroicon-o-paper-airplane')
                ->color('info')
                ->visible(fn($record) => $record->order_status === OrderStatus::PROCESSING)
                ->action(function () {
                    $this->record->order_status = OrderStatus::SHIPPED;
                    $this->record->save();

                    Notification::make()
                        ->title('تم تحديد الطلب كمشحون')
                        ->success()
                        ->send();
                }),
            Action::make('cancel')
                ->label('إلغاء الطلب')
                ->icon('heroicon-o-x-circle')
                ->color('danger')
                ->visible(fn($record) => $record->order_status !== OrderStatus::CANCELLED && $record->order_status !== OrderStatus::DELIVERED)
                ->requiresConfirmation()
                ->action(function () {
                    $this->record->order_status = OrderStatus::CANCELLED;
                    $this->record->save();

                    Notification::make()
                        ->title('تم إلغاء الطلب')
                        ->warning()
                        ->send();
                }),
        ];
    }
}
