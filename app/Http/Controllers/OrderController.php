<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Services\OrderService;
use App\Services\CartService;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;

class OrderController extends Controller
{
    protected OrderService $orderService;
    protected CartService $cartService;

    /**
     * Create a new controller instance.
     *
     * @param OrderService $orderService
     * @param CartService $cartService
     */
    public function __construct(OrderService $orderService, CartService $cartService)
    {
        $this->orderService = $orderService;
        $this->cartService = $cartService;
        // Note: Middleware is typically applied in routes/web.php for better clarity
    }

    /**
     * Display a listing of the user's orders.
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $query = $this->orderService->getUserOrders($request->input('limit', 10));

        return Inertia::render('Orders/Index', [
            'orders_data' => inertia()->merge(
                $query->items()
            ),
            'orders_pagination' => Arr::except($query->toArray(), ['data']),
        ]);
    }

    /**
     * Display the specified order.
     *
     * @param int $orderId
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function show(int $orderId)
    {
        try {
            $order = $this->orderService->getOrderById($orderId);
            return Inertia::render('Orders/Show', [
                'order' => $order,
            ]);
        } catch (ModelNotFoundException $e) {
            return redirect()->route('orders.index')->with('error', 'Order not found.');
        }
    }

    /**
     * Show the checkout page.
     *
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function checkout()
    {

        $user = Auth::user();
        $addresses = Address::where('user_id', $user->id)->with('area.gov')->get();

        return Inertia::render('Checkout/Index', [
            'addresses' => $addresses,
            'orderSummary' => function () {
                $selectedAddressId = request()->input('address_id');
                if (!$selectedAddressId) {
                    return null;
                }
                return $this->orderService->calculateOrderTotal($selectedAddressId);
            },
            'cartSummary' => $this->cartService->getCartSummary(),
            // Pass allowed payment methods
            'paymentMethods' => ['cash_on_delivery', 'kashier'],
        ]);
    }


    /**
     * Handle order submission from checkout
     *
     * @param StoreOrderRequest $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(StoreOrderRequest $request)
    {
        try {
            // If payment method is Kashier, redirect to initiate payment first
            if ($request->validated('payment_method') === 'kashier') {
                // Create request to pass to initiatePayment
                return redirect()->route('kashier.payment.initiate', [
                    'address_id' => $request->validated('address_id'),
                    'coupon_code' => $request->validated('coupon_code'),
                    'notes' => $request->validated('notes')
                ]);
            }

            // For cash on delivery, create the order immediately
            $order = $this->orderService->placeOrderFromCart(
                $request->validated('address_id'),
                $request->validated('payment_method'),
                $request->validated('coupon_code'),
                $request->validated('notes')
            );

            // Redirect to the order details page after successful creation
            return redirect()->route('orders.show', $order->id)
                ->with('success', 'Order placed successfully!');

        } catch (ModelNotFoundException $e) {
            Log::warning('Order placement failed: Address not found.', ['address_id' => $request->validated('address_id'), 'user_id' => Auth::id()]);
            return back()->with('error', 'Selected address not found. Please select a valid address.')->withInput();
        } catch (Exception $e) {
            dd($e);
            Log::error('Order placement failed: ' . $e->getMessage(), ['exception' => $e, 'user_id' => Auth::id(), 'request_data' => $request->except(['_token'])]);
            return back()->with('error', 'Failed to place order. Please try again later or contact support.')->withInput();
        }
    }

    /**
     * Cancel the specified order.
     *
     * @param int $orderId
     * @return \Illuminate\Http\RedirectResponse
     */
    public function cancel(int $orderId)
    {
        try {
            $this->orderService->cancelOrder($orderId);
            return redirect()->route('orders.index')->with('success', 'Order cancelled successfully.');
        } catch (ModelNotFoundException $e) {
            Log::warning('Order cancellation failed: Order not found.', ['order_id' => $orderId, 'user_id' => Auth::id()]);
            return redirect()->route('orders.index')->with('error', 'Order not found.');
        } catch (Exception $e) {
            Log::error('Order cancellation failed: ' . $e->getMessage(), ['exception' => $e, 'order_id' => $orderId, 'user_id' => Auth::id()]);
            return back()->with('error', 'Failed to cancel order: ' . $e->getMessage());
        }
    }
}
