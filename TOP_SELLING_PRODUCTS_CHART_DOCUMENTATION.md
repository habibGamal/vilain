# TopSellingProductsChart Widget Documentation

## Overview
The `TopSellingProductsChart` widget displays the top 10 best-selling products in a horizontal bar chart format, showing quantity sold for each product during the selected time period.

## Features

### Visual Display
- **Chart Type**: Horizontal Bar Chart
- **Color Scheme**: 10 distinct colors for visual appeal
- **Layout**: Horizontal bars for better product name readability
- **Responsive**: Adapts to different screen sizes

### Data Analysis
- **Top 10 Products**: Shows the highest selling products by quantity
- **Quantity Tracking**: Displays total quantity sold for each product
- **Revenue Calculation**: Calculates total revenue (quantity × unit_price)
- **Time Period Filtering**: Respects date range filters from the report page

### Filtering Support
- **Date Range**: Filters data based on startDate and endDate
- **Category Filter**: Can filter products by category selection
- **Real-time Updates**: Automatically updates when filters change

## Technical Implementation

### Database Query
```php
$topProducts = \App\Models\OrderItem::query()
    ->with('product')
    ->whereHas('order', function($query) use ($startDate, $endDate) {
        $query->whereBetween('created_at', [$startDate, $endDate]);
    })
    ->when(!empty($category), function($query) use ($category) {
        $query->whereHas('product', function($productQuery) use ($category) {
            $productQuery->whereIn('category_id', $category);
        });
    })
    ->selectRaw('product_id, SUM(quantity) as total_sold, SUM(quantity * unit_price) as total_revenue')
    ->groupBy('product_id')
    ->orderByDesc('total_sold')
    ->limit(10)
    ->get();
```

### Data Fields Used
- **OrderItems Table**: `product_id`, `quantity`, `unit_price`
- **Orders Table**: `created_at` (for date filtering)
- **Products Table**: `name_en`, `name_ar`, `category_id`

### Chart Configuration
- **Chart Type**: `bar` with `indexAxis: 'y'` for horizontal layout
- **Colors**: 10 predefined RGB colors cycling for visual distinction
- **Tooltips**: Shows "Quantity Sold: [number]" on hover
- **Axes**:
  - X-axis: Quantity values with "Quantity Sold" label
  - Y-axis: Product names with "Products" label

## Bilingual Support

### Current Implementation
- **Headers**: Arabic titles (`أفضل المنتجات مبيعاً`)
- **Product Names**: Uses English names (`name_en`) as primary to avoid UTF-8 encoding issues
- **Fallback Logic**: `name_en` → `name_ar` → "Unknown Product"

### UTF-8 Encoding Considerations
- Uses English labels in chart options to prevent `json_encode()` errors
- Product names prioritize `name_en` to ensure proper JSON serialization
- All Arabic text in headers is properly UTF-8 encoded

## Integration

### Used In
- **ProductsReport Page**: Main analytics dashboard for products
- **Widget Order**: Listed as 5th widget in the products report layout

### Dependencies
- **Models**: OrderItem, Product, Order
- **Relationships**:
  - OrderItem → Product (belongsTo)
  - OrderItem → Order (belongsTo)
- **Filters**: Inherits from ProductsReport page filters

## Performance Optimizations

### Query Efficiency
- Uses `selectRaw()` with aggregation functions (SUM)
- Groups by `product_id` to avoid N+1 queries
- Limits results to top 10 for faster rendering
- Eager loads product relationship with `with('product')`

### Data Processing
- Truncates long product names to 25 characters for better display
- Casts quantity to integer for proper chart rendering
- Uses color cycling to avoid array index errors

## Error Handling

### Fallback Values
- **Product Names**: Multiple fallbacks to ensure display
- **Empty Data**: Chart gracefully handles empty datasets
- **Missing Relationships**: Safe navigation with null coalescing

### UTF-8 Safety
- Avoids Arabic text in JSON-serialized data
- Uses numeric values for chart data
- Properly encodes all string values

## Customization Options

### Easy Modifications
1. **Change Limit**: Modify `->limit(10)` to show more/fewer products
2. **Add Revenue Display**: Uncomment revenue data in chart datasets
3. **Color Scheme**: Update the `$colors` array for different styling
4. **Chart Type**: Change from horizontal to vertical bars

### Filter Extensions
- Can easily add product status filtering
- Supports brand filtering with minor modifications
- Compatible with price range filters

## Testing Recommendations

### Data Validation
- Test with empty product catalog
- Verify with products having no sales
- Check behavior with single product
- Test date range edge cases

### UI/UX Testing
- Verify chart responsiveness on mobile
- Test with very long product names
- Check tooltip functionality
- Validate color scheme accessibility

This widget provides comprehensive insights into product performance and integrates seamlessly with the overall analytics dashboard.
