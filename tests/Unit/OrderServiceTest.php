<?php

namespace Tests\Unit;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Address;
use App\Models\Area;
use App\Models\Gov;
use App\Models\ShippingCost;
use App\Models\User;
use App\Services\CartService;
use App\Services\OrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Mockery;
use Mockery\MockInterface;
use stdClass;
use Tests\TestCase;

class OrderServiceTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Address $address;
    protected MockInterface $cartServiceMock;
    protected OrderService $orderService;

    /**
     * Setup the test environment.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Create test user
        $this->user = User::factory()->create();

        // Create gov, area, and shipping cost
        $gov = Gov::factory()->create();
        $area = Area::factory()->create(['gov_id' => $gov->id]);
        $shippingCost = ShippingCost::factory()->create([
            'area_id' => $area->id,
            'value' => 10.00,
        ]);

        // Create address for the user
        $this->address = Address::factory()->create([
            'user_id' => $this->user->id,
            'area_id' => $area->id,
        ]);

        // Mock CartService
        $this->cartServiceMock = Mockery::mock(CartService::class);

        // Create OrderService instance with mocked CartService
        $this->orderService = new OrderService($this->cartServiceMock);
    }

    /**
     * Clean up after each test.
     */
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /**
     * Test creating an order from cart.
     */
    public function testCreateOrderFromCart(): void
    {
        // Setup mock cart items
        $cartItems = new Collection();

        $item1 = new stdClass();
        $item1->product_id = 1;
        $item1->variant_id = 1;
        $item1->quantity = 2;
        $item1->unit_price = 15.00;

        $item2 = new stdClass();
        $item2->product_id = 2;
        $item2->variant_id = null;
        $item2->quantity = 1;
        $item2->unit_price = 20.00;

        $cartItems->push($item1, $item2);

        // Configure mock expectations
        $this->cartServiceMock
            ->shouldReceive('getCartItems')
            ->once()
            ->with($this->user->id)
            ->andReturn($cartItems);

        $this->cartServiceMock
            ->shouldReceive('clearCart')
            ->once()
            ->with($this->user->id);

        // Prepare order data
        $orderData = [
            'shipping_address_id' => $this->address->id,
            'payment_method' => 'credit_card',
            'coupon_code' => 'DISCOUNT10',
            'notes' => 'Please deliver after 6pm',
            'paid' => true,
        ];

        // Create order
        $order = $this->orderService->createOrderFromCart($this->user, $orderData);

        // Assert order was created correctly
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'user_id' => $this->user->id,
            'order_status' => OrderStatus::PROCESSING->value,
            'payment_status' => PaymentStatus::PAID->value, // Paid because we set paid=true
            'payment_method' => 'credit_card',
            'shipping_address_id' => $this->address->id,
            'subtotal' => 50.00, // (2 * 15) + (1 * 20)
            'shipping_cost' => 10.00,
            'discount' => 5.00, // 10% of subtotal (50.00 * 0.1)
            'total' => 55.00, // subtotal + shipping - discount
        ]);

        // Assert order items were created
        $this->assertDatabaseCount('order_items', 2);
        $this->assertDatabaseHas('order_items', [
            'order_id' => $order->id,
            'product_id' => 1,
            'variant_id' => 1,
            'quantity' => 2,
            'unit_price' => 15.00,
            'subtotal' => 30.00,
        ]);
        $this->assertDatabaseHas('order_items', [
            'order_id' => $order->id,
            'product_id' => 2,
            'variant_id' => null,
            'quantity' => 1,
            'unit_price' => 20.00,
            'subtotal' => 20.00,
        ]);
    }

    /**
     * Test that order creation fails when cart is empty.
     */
    public function testCreateOrderFailsWhenCartIsEmpty(): void
    {
        // Setup empty cart
        $this->cartServiceMock
            ->shouldReceive('getCartItems')
            ->once()
            ->with($this->user->id)
            ->andReturn(new Collection());

        // Prepare order data
        $orderData = [
            'shipping_address_id' => $this->address->id,
            'payment_method' => 'credit_card',
        ];

        // Expect exception
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Cart is empty. Cannot create an order.');

        // Try to create order
        $this->orderService->createOrderFromCart($this->user, $orderData);
    }

    /**
     * Test that order creation fails when the address doesn't belong to the user.
     */
    public function testCreateOrderFailsWithInvalidAddress(): void
    {
        // Create another user
        $anotherUser = User::factory()->create();

        // Create address for another user
        $anotherAddress = Address::factory()->create([
            'user_id' => $anotherUser->id,
        ]);

        // Prepare order data with address that doesn't belong to our test user
        $orderData = [
            'shipping_address_id' => $anotherAddress->id,
            'payment_method' => 'credit_card',
        ];

        // Expect exception
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('The address does not belong to this user.');

        // Try to create order
        $this->orderService->createOrderFromCart($this->user, $orderData);
    }

    /**
     * Test updating order status.
     */
    public function testUpdateOrderStatus(): void
    {
        // Create an order
        $order = $this->createTestOrder();

        // Update status to SHIPPED
        $updatedOrder = $this->orderService->updateOrderStatus($order->id, OrderStatus::SHIPPED);

        // Assert status was updated
        $this->assertEquals(OrderStatus::SHIPPED, $updatedOrder->order_status);
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'order_status' => OrderStatus::SHIPPED->value,
        ]);
    }

    /**
     * Test updating payment status.
     */
    public function testUpdatePaymentStatus(): void
    {
        // Create an order
        $order = $this->createTestOrder();

        // Update payment status to PAID
        $updatedOrder = $this->orderService->updatePaymentStatus($order->id, PaymentStatus::PAID);

        // Assert status was updated
        $this->assertEquals(PaymentStatus::PAID, $updatedOrder->payment_status);
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'payment_status' => PaymentStatus::PAID->value,
        ]);
    }

    /**
     * Helper method to create a test order directly.
     */
    private function createTestOrder(): mixed
    {
        return Order::create([
            'user_id' => $this->user->id,
            'order_status' => OrderStatus::PROCESSING,
            'payment_status' => PaymentStatus::PENDING,
            'payment_method' => 'cash_on_delivery',
            'subtotal' => 100.00,
            'shipping_cost' => 10.00,
            'discount' => 0.00,
            'total' => 110.00,
            'shipping_address_id' => $this->address->id,
        ]);
    }
}
