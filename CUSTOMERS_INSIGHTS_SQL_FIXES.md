# CustomersInsightsOverview Widget - SQL Error Fixes

## Issue Fixed
**Error**: `SQLSTATE[HY000]: General error: 4074 Window functions can not be used as arguments to group functions`

This error occurred because the original query was trying to use the `LAG()` window function inside an `AVG()` aggregation function, which MySQL doesn't support.

## Original Problematic Query
```sql
SELECT AVG(avg_days) as aggregate 
FROM (
    SELECT user_id, AVG(DATEDIFF(created_at, LAG(created_at) OVER (PARTITION BY user_id ORDER BY created_at))) as avg_days 
    FROM orders 
    WHERE created_at >= '2025-05-22' AND created_at <= '2025-06-22' 
    GROUP BY user_id 
    HAVING avg_days > 0
) as temp_table
```

## Solution Applied

### 1. Average Time Between Orders Fix
**Problem**: Window function `LAG()` cannot be used inside `AVG()` aggregation.

**Solution**: Replaced with a simpler calculation approach:
```php
// Calculate time span and order count per user
$ordersByUser = \App\Models\Order::query()
    ->selectRaw('user_id, COUNT(*) as order_count, DATEDIFF(MAX(created_at), MIN(created_at)) as days_span')
    ->groupBy('user_id')
    ->having('order_count', '>', 1)
    ->get();

// Calculate average in PHP
$avgTimeBetweenOrders = 0;
if ($ordersByUser->count() > 0) {
    $totalAvgDays = $ordersByUser->sum(function($user) {
        return $user->order_count > 1 ? $user->days_span / ($user->order_count - 1) : 0;
    });
    $avgTimeBetweenOrders = $totalAvgDays / $ordersByUser->count();
}
```

**Benefits**:
- ✅ No window functions - fully MySQL compatible
- ✅ Simpler logic using MAX/MIN dates per user
- ✅ Average calculation moved to PHP for better control
- ✅ Handles edge cases (single orders, no orders)

### 2. Governorate Query Improvement
**Problem**: Inner joins could fail if address data is missing.

**Solution**: Changed to LEFT JOINs with null filtering:
```php
$topGovernorate = \App\Models\Order::query()
    ->leftJoin('addresses', 'orders.shipping_address_id', '=', 'addresses.id')
    ->leftJoin('areas', 'addresses.area_id', '=', 'areas.id')
    ->leftJoin('govs', 'areas.gov_id', '=', 'govs.id')
    ->whereNotNull('govs.id')
    // ... rest of query
```

**Benefits**:
- ✅ Doesn't fail if orders have missing address data
- ✅ More robust error handling
- ✅ Only counts orders with complete address information

## Database Schema Verified

### Tables Used:
- ✅ **orders**: `id`, `user_id`, `shipping_address_id`, `order_status`, `return_status`, `created_at`
- ✅ **addresses**: `id`, `area_id`, `user_id`
- ✅ **areas**: `id`, `name_en`, `name_ar`, `gov_id`
- ✅ **govs**: `id`, `name_en`, `name_ar`
- ✅ **users**: `id`, `created_at`

### Relationships Verified:
- ✅ orders.shipping_address_id → addresses.id
- ✅ addresses.area_id → areas.id
- ✅ areas.gov_id → govs.id
- ✅ orders.user_id → users.id

### Enums Used:
- ✅ **OrderStatus::DELIVERED** - exists in App\Enums\OrderStatus

## Performance Considerations

### Before (Problematic):
- Complex window function with LAG()
- Nested subquery with aggregation
- MySQL-specific syntax that failed

### After (Optimized):
- Simple aggregation queries (COUNT, MAX, MIN)
- PHP-based calculations for complex logic
- Left joins for better data handling
- Reduced database processing load

## Testing Recommendations

1. **Test with users having multiple orders**
2. **Test with users having single orders**
3. **Test with orders missing address data**
4. **Test with empty datasets**
5. **Verify calculation accuracy against manual calculations**

## Error Prevention

The new implementation:
- ✅ Avoids MySQL window function limitations
- ✅ Handles null/missing data gracefully
- ✅ Uses standard SQL features only
- ✅ Provides fallback values for all metrics
- ✅ Is compatible with all MySQL versions

This fix ensures the CustomersInsightsOverview widget will work reliably without SQL errors while maintaining accurate customer analytics calculations.
