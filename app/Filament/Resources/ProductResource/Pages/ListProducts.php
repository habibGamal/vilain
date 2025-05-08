<?php

namespace App\Filament\Resources\ProductResource\Pages;

use App\Filament\Resources\ProductResource;
use App\Filament\Imports\ProductImporter;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListProducts extends ListRecords
{
    protected static string $resource = ProductResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ImportAction::make()
                ->label('استيراد المنتجات')
                ->importer(ProductImporter::class),
            Actions\CreateAction::make(),
        ];
    }
}
