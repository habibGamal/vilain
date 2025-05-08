<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Address;
use App\Models\ShippingCost;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class OrderService
{
    protected CartService $cartService;

    /**
     * Create a new service instance.
     *
     * @param CartService $cartService
     */
    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    /**
     * Place a new order from the user's cart
     *
     * @param int $addressId The shipping address ID
     * @param string $paymentMethod The payment method used
     * @param string|null $couponCode Optional coupon code
     * @param string|null $notes Optional order notes
     * @param string|null $paymentId Optional payment ID from payment gateway
     * @param array|null $paymentDetails Optional payment details from payment gateway
     * @param PaymentStatus|null $paymentStatus Optional payment status, defaults to PENDING
     *
     * @return Order The created order
     * @throws ModelNotFoundException If the address doesn't exist
     * @throws \Exception If there was an error processing the order
     */
    public function placeOrderFromCart(
        int $addressId,
        string $paymentMethod,
        ?string $couponCode = null,
        ?string $notes = null,
        ?string $paymentId = null,
        ?array $paymentDetails = null,
        ?PaymentStatus $paymentStatus = null
    ): Order
    {
        // Get the user and validate they exist
        $user = Auth::user();
        if (!$user) {
            throw new \Exception('User must be authenticated to place an order');
        }

        // Calculate order totals and get address
        $orderData = $this->calculateOrderTotal($addressId, $couponCode);
        $address = $orderData['address'];

        // Get the cart with all its items
        $cart = $this->cartService->getCart();

        // Check if cart is empty
        if ($cart->items->isEmpty()) {
            throw new \Exception('Cannot place an order with an empty cart');
        }

        // Set default payment status if not provided
        if ($paymentStatus === null) {
            $paymentStatus = PaymentStatus::PENDING;
        }

        // Begin a transaction to ensure data consistency
        return DB::transaction(function () use (
            $user,
            $address,
            $cart,
            $orderData,
            $paymentMethod,
            $couponCode,
            $notes,
            $paymentId,
            $paymentDetails,
            $paymentStatus
        ) {

            // Create the order
            $order = Order::create([
                'user_id' => $user->id,
                'order_status' => OrderStatus::PROCESSING,
                'payment_status' => $paymentStatus,
                'payment_method' => PaymentMethod::from($paymentMethod),
                'subtotal' => $orderData['subtotal'],
                'shipping_cost' => $orderData['shippingCost'],
                'discount' => $orderData['discount'],
                'total' => $orderData['total'],
                'coupon_code' => $couponCode,
                'shipping_address_id' => $address->id,
                'notes' => $notes,
                'payment_id' => $paymentId,
                'payment_details' => $paymentDetails ? json_encode($paymentDetails) : null,
            ]);

            // Create the order items from cart items
            foreach ($cart->items as $cartItem) {
                $product = $cartItem->product;
                $variant = $cartItem->variant;

                // Determine the actual price (use variant price if available, otherwise product price)
                $unitPrice = $variant && $variant->price ? $variant->price : $product->price;

                // Check for sale price
                if ($variant && $variant->sale_price) {
                    $unitPrice = $variant->sale_price;
                } elseif ($product->sale_price) {
                    $unitPrice = $product->sale_price;
                }

                // Create order item
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'variant_id' => $cartItem->product_variant_id,
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $unitPrice * $cartItem->quantity,
                ]);

                // Update product inventory (if needed)
                if ($variant) {
                    $variant->quantity -= $cartItem->quantity;
                    $variant->save();
                }
            }
            // Clear the cart after successful order creation
            $this->cartService->clearCart();

            // Return the created order with all its related items
            return $order->load('items.product', 'items.variant', 'shippingAddress');
        });
    }

    /**
     * Calculate the total for an order based on address and optional coupon
     *
     * @param int $addressId The shipping address ID
     * @param string|null $couponCode Optional coupon code
     * @return array Order calculation result with subtotal, shipping, discount and total
     * @throws ModelNotFoundException If the address doesn't exist
     * @throws \Exception If there was an error calculating the order
     */
    public function calculateOrderTotal(
        int $addressId,
        ?string $couponCode = null
    ): array
    {
        // Get the user and validate they exist
        $user = Auth::user();
        if (!$user) {
            throw new \Exception('User must be authenticated to calculate an order');
        }

        // Get the shipping address and validate it exists
        $address = Address::where('user_id', $user->id)
                         ->findOrFail($addressId);

        // Get the cart with all its items
        $cart = $this->cartService->getCart();

        // Check if cart is empty
        if ($cart->items->isEmpty()) {
            throw new \Exception('Cannot calculate order with an empty cart');
        }

        // Calculate shipping cost based on the address area
        $shippingCost = ShippingCost::where('area_id', $address->area_id)
                                   ->first();

        if (!$shippingCost) {
            throw new \Exception('No shipping cost found for the provided area');
        }

        // Get the cart totals
        $cartSummary = $this->cartService->getCartSummary();
        $subtotal = $cartSummary['totalPrice'];

        // For now, we'll use 0 for discount, but this could be calculated based on coupon code
        $discount = 0;
        if ($couponCode) {
            // Here you would verify and apply the coupon code
            // This is a placeholder for future coupon implementation
        }

        // Calculate the total price
        $total = $subtotal + $shippingCost->value - $discount;

        return [
            'subtotal' => $subtotal,
            'shippingCost' => $shippingCost->value,
            'discount' => $discount,
            'total' => $total,
            'address' => $address,
        ];
    }

    /**
     * Get an order by its ID
     *
     * @param int $orderId
     * @return Order
     * @throws ModelNotFoundException If the order doesn't exist
     */
    public function getOrderById(int $orderId): Order
    {
        $user = Auth::user();

        return Order::where('user_id', $user->id)
                   ->with(['items.product', 'items.variant', 'shippingAddress.area.gov'])
                   ->findOrFail($orderId);
    }

    /**
     * Get all orders for the current user
     *
     * @param int|null $limit Optional limit for pagination
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getUserOrders(?int $limit = 10)
    {
        $user = Auth::user();

        return Order::where('user_id', $user->id)
                   ->with(['items'])
                   ->orderBy('created_at', 'desc')
                   ->paginate($limit);
    }

    /**
     * Cancel an order
     *
     * @param int $orderId
     * @return Order
     * @throws ModelNotFoundException If the order doesn't exist
     * @throws \Exception If the order cannot be cancelled
     */
    public function cancelOrder(int $orderId): Order
    {
        $user = Auth::user();

        $order = Order::where('user_id', $user->id)->findOrFail($orderId);

        // Check if the order can be cancelled
        if ($order->order_status !== OrderStatus::PROCESSING) {
            throw new \Exception('Only orders in processing status can be cancelled');
        }

        // Update order status
        $order->order_status = OrderStatus::CANCELLED;
        $order->save();

        // Return inventory to stock
        foreach ($order->items as $item) {
            if ($item->variant_id) {
                $variant = $item->variant;
                $variant->quantity += $item->quantity;
                $variant->save();
            }
        }

        return $order->fresh();
    }
}
