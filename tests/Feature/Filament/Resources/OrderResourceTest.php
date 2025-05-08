<?php

namespace Tests\Feature\Filament\Resources;

use App\Enums\OrderStatus;
use App\Filament\Resources\OrderResource;
use App\Filament\Resources\OrderResource\Pages\ListOrders;
use App\Filament\Resources\OrderResource\Pages\ViewOrder;
use App\Models\Address;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class OrderResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_view_orders_list()
    {
        $this->actingAs(User::factory()->create());

        $orders = Order::factory(3)->create();

        Livewire::test(ListOrders::class)
            ->assertCanSeeTableRecords($orders);
    }

    public function test_can_view_order_record()
    {
        $this->actingAs(User::factory()->create());

        $order = Order::factory()
            ->has(OrderItem::factory()->count(3))
            ->create([
                'order_status' => OrderStatus::PROCESSING,
                'shipping_address_id' => Address::factory()->create()->id,
            ]);

        Livewire::test(ViewOrder::class, ['record' => $order->getRouteKey()])
            ->assertSuccessful();
    }

    public function test_can_mark_order_as_shipped()
    {
        $this->actingAs(User::factory()->create());

        $order = Order::factory()->create([
            'order_status' => OrderStatus::PROCESSING,
        ]);

        Livewire::test(ViewOrder::class, ['record' => $order->getRouteKey()])
            ->callAction('ship')
            ->assertHasNoActionErrors();

        $this->assertEquals(OrderStatus::SHIPPED, $order->fresh()->order_status);
    }

    public function test_can_mark_order_as_delivered()
    {
        $this->actingAs(User::factory()->create());

        $order = Order::factory()->create([
            'order_status' => OrderStatus::SHIPPED,
        ]);

        Livewire::test(ViewOrder::class, ['record' => $order->getRouteKey()])
            ->callAction('deliver')
            ->assertHasNoActionErrors();

        $this->assertEquals(OrderStatus::DELIVERED, $order->fresh()->order_status);
    }

    public function test_can_cancel_order()
    {
        $this->actingAs(User::factory()->create());

        $order = Order::factory()->create([
            'order_status' => OrderStatus::PROCESSING,
        ]);

        Livewire::test(ViewOrder::class, ['record' => $order->getRouteKey()])
            ->callAction('cancel')
            ->assertHasNoActionErrors();

        $this->assertEquals(OrderStatus::CANCELLED, $order->fresh()->order_status);
    }
}
