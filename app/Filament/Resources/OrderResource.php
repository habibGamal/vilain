<?php

namespace App\Filament\Resources;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Filament\Resources\OrderResource\Pages;
use App\Filament\Resources\OrderResource\RelationManagers\OrderItemsRelationManager;
use App\Models\Order;
use Filament\Forms;
use Filament\Forms\Components\Section as FormSection;
use Filament\Forms\Form;
use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;

    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';

    protected static ?string $recordTitleAttribute = 'id';

    protected static ?string $label = 'الطلب';
    protected static ?string $pluralLabel = 'الطلبات';

    public static function getGlobalSearchResultTitle(Model $record): string
    {
        /** @var Order $record */
        return 'طلب #' . $record->id;
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['id', 'user.name', 'user.email'];
    }

    public static function getGlobalSearchResultDetails(Model $record): array
    {
        /** @var Order $record */
        return [
            'Status' => $record->order_status->value,
            'Total' => number_format($record->total, 2),
        ];
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                FormSection::make('معلومات الطلب')
                    ->schema([
                        Forms\Components\TextInput::make('id')
                            ->label('رقم الطلب')
                            ->disabled(),
                        Forms\Components\Select::make('order_status')
                            ->label('حالة الطلب')
                            ->options(OrderStatus::class)
                            ->disabled(),
                        Forms\Components\Select::make('payment_status')
                            ->label('حالة الدفع')
                            ->options(PaymentStatus::class)
                            ->disabled(),
                        Forms\Components\TextInput::make('payment_method')
                            ->label('طريقة الدفع')
                            ->disabled(),
                        Forms\Components\TextInput::make('created_at')
                            ->label('تاريخ الإنشاء')
                            ->formatStateUsing(fn ($state) => $state?->format('Y-m-d H:i:s'))
                            ->disabled(),
                    ])->columns(2),

                FormSection::make('معلومات العميل')
                    ->schema([
                        Forms\Components\TextInput::make('user.name')
                            ->label('اسم العميل')
                            ->disabled(),
                        Forms\Components\TextInput::make('user.email')
                            ->label('البريد الإلكتروني')
                            ->disabled(),
                        Forms\Components\TextInput::make('shippingAddress.content')
                            ->label('عنوان الشحن')
                            ->disabled(),
                        Forms\Components\TextInput::make('shippingAddress.area.name_en')
                            ->label('المنطقة')
                            ->disabled(),
                    ])->columns(2),

                FormSection::make('ملخص الطلب')
                    ->schema([
                        Forms\Components\TextInput::make('subtotal')
                            ->label('المجموع الفرعي')
                            ->prefix('$')
                            ->disabled(),
                        Forms\Components\TextInput::make('shipping_cost')
                            ->label('الشحن')
                            ->prefix('$')
                            ->disabled(),
                        Forms\Components\TextInput::make('discount')
                            ->label('الخصم')
                            ->prefix('$')
                            ->disabled(),
                        Forms\Components\TextInput::make('total')
                            ->label('الإجمالي')
                            ->prefix('$')
                            ->disabled(),
                        Forms\Components\TextInput::make('coupon_code')
                            ->label('كوبون')
                            ->disabled(),
                        Forms\Components\Textarea::make('notes')
                            ->label('ملاحظات')
                            ->disabled()
                            ->columnSpanFull(),
                    ])->columns(2),
            ]);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Section::make('معلومات الطلب')
                    ->schema([
                        TextEntry::make('id')
                            ->label('رقم الطلب'),
                        TextEntry::make('order_status')
                            ->label('حالة الطلب')
                            ->badge(),
                        TextEntry::make('payment_status')
                            ->label('حالة الدفع')
                            ->badge(),
                        TextEntry::make('payment_method')
                            ->label('طريقة الدفع'),
                        TextEntry::make('created_at')
                            ->label('تاريخ الإنشاء')
                            ->dateTime(),
                    ])->columns(2),

                Section::make('معلومات العميل')
                    ->schema([
                        TextEntry::make('user.name')
                            ->label('اسم العميل'),
                        TextEntry::make('user.email')
                            ->label('البريد الإلكتروني'),
                        TextEntry::make('shippingAddress.content')
                            ->label('عنوان الشحن'),
                        TextEntry::make('shippingAddress.area.name_en')
                            ->label('المنطقة'),
                    ])->columns(2),

                Section::make('ملخص الطلب')
                    ->schema([
                        TextEntry::make('subtotal')
                            ->label('المجموع الفرعي')
                            ->money(),
                        TextEntry::make('shipping_cost')
                            ->label('الشحن')
                            ->money(),
                        TextEntry::make('discount')
                            ->label('الخصم')
                            ->money(),
                        TextEntry::make('total')
                            ->label('الإجمالي')
                            ->money()
                            ->weight('bold'),
                        TextEntry::make('coupon_code')
                            ->label('كوبون')
                            ->placeholder('-'),
                        TextEntry::make('notes')
                            ->label('ملاحظات')
                            ->placeholder('-')
                            ->columnSpanFull(),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('رقم الطلب')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('user.name')
                    ->label('العميل')
                    ->sortable()
                    ->searchable(),
                Tables\Columns\TextColumn::make('order_status')
                    ->label('حالة الطلب')
                    ->badge()
                    ->sortable(),
                Tables\Columns\TextColumn::make('payment_status')
                    ->label('حالة الدفع')
                    ->badge()
                    ->sortable(),
                Tables\Columns\TextColumn::make('payment_method')
                    ->label('طريقة الدفع')
                    ->searchable(),
                Tables\Columns\TextColumn::make('total')
                    ->label('الإجمالي')
                    ->money()
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('التاريخ')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('order_status')
                    ->label('حالة الطلب')
                    ->options(OrderStatus::class),
                Tables\Filters\SelectFilter::make('payment_status')
                    ->label('حالة الدفع')
                    ->options(PaymentStatus::class),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    //
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            OrderItemsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOrders::route('/'),
            'view' => Pages\ViewOrder::route('/{record}'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->with(['user', 'shippingAddress', 'shippingAddress.area']);
    }
}
