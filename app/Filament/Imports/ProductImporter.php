<?php

namespace App\Filament\Imports;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Filament\Actions\Imports\ImportColumn;
use Filament\Actions\Imports\Importer;
use Filament\Actions\Imports\Models\Import;
use Illuminate\Support\Str;

class ProductImporter extends Importer
{
    protected static ?string $model = Product::class;

    protected static ?string $label = 'استيراد المنتجات';

    // Store temporary data for variant creation
    protected $variantData = [];

    public static function getColumns(): array
    {
        return [
            ImportColumn::make('id')
                ->label('المعرف'),

            ImportColumn::make('sku')
                ->label('الرمز التسلسلي'),

            ImportColumn::make('name')
                ->label('الاسم')
                ->requiredMapping()
                ->rules(['string', 'max:255']),

            ImportColumn::make('description')
                ->label('الوصف'),

            ImportColumn::make('price')
                ->label('سعر الوحدة قبل الخصم')
                ->requiredMapping()
                ->numeric()
                ->rules(['numeric', 'min:0'])
                ->guess(["Unit price before sale"]),

            ImportColumn::make('sale_price')
                ->label('سعر الوحدة بعد الخصم')
                ->numeric()
                ->rules(['numeric', 'min:0'])
                ->guess(["unit price after sale"]),

            ImportColumn::make('category')
                ->label('الفئة')
                ->requiredMapping()
                ->fillRecordUsing(function (Product $record, string $state) {
                    $category = Category::where('name_en', $state)
                        ->orWhere('name_ar', $state)
                        ->first();

                    if (!$category) {
                        // Create the category if it doesn't exist
                        $category = Category::create([
                            'name_en' => $state,
                            'name_ar' => $state,
                            'slug' => Str::slug($state),
                            'is_active' => true,
                        ]);
                    }

                    $record->category_id = $category->id;
                }),

            ImportColumn::make('brand')
                ->label('العلامة التجارية')
                ->requiredMapping()
                ->fillRecordUsing(function (Product $record, string $state) {
                    $brand = Brand::where('name_en', $state)
                        ->orWhere('name_ar', $state)
                        ->first();

                    if (!$brand) {
                        // Create the brand if it doesn't exist
                        $brand = Brand::create([
                            'name_en' => $state,
                            'name_ar' => $state,
                            'slug' => Str::slug($state),
                            'is_active' => true,
                        ]);
                    }

                    $record->brand_id = $brand->id;
                }),

            ImportColumn::make('quantity')
                ->label('الكمية في المخزون')
                ->numeric()
                ->guess(["Quantity in stock"]),

            ImportColumn::make('images')
                ->label('رابط الصورة')
                ->array(',')
                ->guess(["photo link"]),

            ImportColumn::make('color')
                ->label('اللون')
                ->guess(["color"]),

            ImportColumn::make('size')
                ->label('الحجم')
                ->guess(["size"]),

            ImportColumn::make('capacity')
                ->label('السعة')
                ->guess(["capacity"]),

            ImportColumn::make('is_featured')
                ->label('مميز')
                ->boolean(),
        ];
    }
    public static function getCompletedNotificationBody(Import $import): string
    {
        $body = 'تم استيراد ' . number_format($import->successful_rows) . ' منتج بنجاح.';

        if ($failedRowsCount = $import->getFailedRowsCount()) {
            $body .= ' ' . number_format($failedRowsCount) . ' منتج فشل في الاستيراد.';
        }

        return $body;
    }

    private function resolveData()
    {
        // name
        $this->data['name_en'] = $this->data['name'];
        $this->data['name_ar'] = $this->data['name'];
        $this->data['slug'] = Str::slug($this->data['name']);

        // description
        $this->data['description_en'] = $this->data['description'];
        $this->data['description_ar'] = $this->data['description'];

        $this->data['is_active'] = $this->data['is_active'] ?? true;
        $this->data['is_featured'] = $this->data['is_featured'] ?? false;

        // varient
        $this->variantData = [
            'sku' => $this->data['sku'] ?? null,
            'quantity' => $this->data['quantity'] ?? 0,
            'color' => $this->data['color'] ?? null,
            'size' => $this->data['size'] ?? null,
            'capacity' => $this->data['capacity'] ?? null,
            'images' => !empty($this->data['images']) ? $this->data['images'] : [],
        ];

        // clean up data
        unset($this->data['name'],
        $this->data['description'],
        $this->data['sku'],
        $this->data['quantity'],
        $this->data['color'],
        $this->data['size'],
        $this->data['capacity'],
        $this->data['images'],);
    }

    public function resolveRecord(): ?Product
    {
        $this->resolveData();

        return Product::where(
            ['id'=>$this->data['id'] ?? null]
        )->orWhere(
            ['slug' => $this->data['slug']]
        )->first() ?? new Product;
    }


    protected function beforeFill(): void
    {
        $this->record->fill([
            'name_en' => $this->data['name_en'] ?? null,
            'name_ar' => $this->data['name_ar'] ?? null,
            'slug' => $this->data['slug'] ?? null,
            'description_en' => $this->data['description_en'] ?? null,
            'description_ar' => $this->data['description_ar'] ?? null,
            'is_active' => $this->data['is_active'] ?? true,
            'is_featured' => $this->data['is_featured'] ?? false,
        ]);
    }


    protected function afterCreate(): void
    {
        $this->createOrUpdateVariant($this->record);
    }

    protected function afterSave(): void
    {
        $this->createOrUpdateVariant($this->record);
    }

    protected function createOrUpdateVariant(Product $record): void
    {
        if (!empty($this->variantData)) {
            // Check if a variant with this SKU already exists
            $variant = null;

            if (!empty($this->variantData['sku'])) {
                $variant = ProductVariant::where('product_id', $record->id)
                    ->where('sku', $this->variantData['sku'])
                    ->first();
            }

            // If no variant exists with this SKU, check by color, size, and capacity
            if (!$variant && !empty($this->variantData['color']) && !empty($this->variantData['size'])) {
                $variant = ProductVariant::where('product_id', $record->id)
                    ->where('color', $this->variantData['color'])
                    ->where('size', $this->variantData['size'])
                    ->where('capacity', $this->variantData['capacity'])
                    ->first();
            }

            // If no existing variant found, create a new one
            if (!$variant) {
                $record->variants()->create($this->variantData);
            } else {
                // Update existing variant
                $variant->update($this->variantData);
            }
        }
    }

    public static function beforeImport(): void
    {
        // Optionally add any preparation logic before import starts
    }

    public static function afterImport(Import $import): void
    {
        // Set default variants for products that don't have one
        $productsWithNoDefaultVariant = Product::whereDoesntHave('variants', function ($query) {
            $query->where('is_default', true);
        })->has('variants')->get();

        foreach ($productsWithNoDefaultVariant as $product) {
            $firstVariant = $product->variants()->first();
            if ($firstVariant) {
                $firstVariant->update(['is_default' => true]);
            }
        }
    }
}
