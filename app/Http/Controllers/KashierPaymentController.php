<?php

namespace App\Http\Controllers;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Http\Requests\KashierPaymentRequest;
use App\Models\Order;
use App\Services\KashierPaymentService;
use App\Services\OrderService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class KashierPaymentController extends Controller
{
    protected KashierPaymentService $kashierService;
    protected OrderService $orderService;

    /**
     * Create a new controller instance.
     *
     * @param KashierPaymentService $kashierService
     * @param OrderService $orderService
     */
    public function __construct(KashierPaymentService $kashierService, OrderService $orderService)
    {
        $this->kashierService = $kashierService;
        $this->orderService = $orderService;
    }

    /**
     * Show the payment page before creating the order
     *
     * @param Request $request
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function initiatePayment(Request $request)
    {
        try {
            // Validate input
            $validated = $request->validate([
                'address_id' => 'required|integer|exists:addresses,id',
                'coupon_code' => 'nullable|string',
                'notes' => 'nullable|string',
            ]);

            // Generate payment params before creating the order
            $paymentParams = $this->kashierService->generatePreOrderPaymentParams(
                $validated['address_id'],
                $validated['coupon_code'] ?? null
            );

            // Store payment params in session for later retrieval
            session()->put('kashier_payment_params', $paymentParams);
            session()->put('order_notes', $validated['notes'] ?? null);

            // Generate URLs
            $successUrl = route('kashier.payment.success');
            $failureUrl = route('kashier.payment.failure');
            $webhookUrl = $this->kashierService->getWebhookUrl();

            return Inertia::render('Payments/Kashier', [
                'kashierParams' => [
                    'merchantId' => $paymentParams['merchantId'],
                    'orderId' => $paymentParams['uniqueRef'],
                    'amount' => $paymentParams['amount'],
                    'currency' => $paymentParams['currency'],
                    'hash' => $paymentParams['hash'],
                    'mode' => $paymentParams['mode'],
                    'merchantRedirect' => $successUrl,
                    'failureRedirect' => $failureUrl,
                    'serverWebhook' => $webhookUrl,
                    'allowedMethods' => 'card',
                    'displayMode' => 'ar',
                    'paymentRequestId' => uniqid('pr_'),
                ],
                'orderSummary' => [
                    'subtotal' => $paymentParams['orderData']['subtotal'],
                    'shipping' => $paymentParams['orderData']['shippingCost'],
                    'discount' => $paymentParams['orderData']['discount'],
                    'total' => $paymentParams['orderData']['total'],
                ]
            ]);
        } catch (Exception $e) {
            Log::error('Error initializing Kashier payment: ' . $e->getMessage(), ['exception' => $e]);
            return redirect()->route('checkout.index')
                ->with('error', 'Unable to process payment. Please try again later or contact support.');
        }
    }

    /**
     * Handle the payment success callback from Kashier
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function handleSuccess(Request $request)
    {
        try {
            // Retrieve payment params from session
            $paymentParams = session()->get('kashier_payment_params');
            $notes = session()->get('order_notes');

            if (!$paymentParams) {
                Log::error('Payment params not found in session', [
                    'params' => $request->all()
                ]);
                return redirect()->route('checkout.index')
                    ->with('error', 'Payment information not found. Please try again.');
            }

            // Verify the signature
            if (!$this->kashierService->validateSignature($request->all())) {
                Log::warning('Invalid Kashier signature in success callback', [
                    'params' => $request->all()
                ]);

                return redirect()->route('checkout.index')
                    ->with('error', 'Payment verification failed. Please contact support.');
            }

            // Payment data from Kashier
            $paymentData = $request->all();

            // Create the order with PAID status and payment details
            $order = $this->orderService->placeOrderFromCart(
                $paymentParams['addressId'],
                PaymentMethod::KASHIER->value,
                $paymentParams['couponCode'],
                $notes,
                $paymentData['paymentId'] ?? $paymentParams['uniqueRef'],
                $paymentData,
                PaymentStatus::PAID
            );

            // Clear session payment data
            session()->forget(['kashier_payment_params', 'order_notes']);

            return redirect()->route('orders.show', $order->id)
                ->with('success', 'Payment completed successfully! Your order is being processed.');

        } catch (Exception $e) {
            Log::error('Error handling payment success: ' . $e->getMessage(), [
                'exception' => $e,
                'params' => $request->all()
            ]);

            return redirect()->route('checkout.index')
                ->with('error', 'Error processing your payment. Please try again or contact support.');
        }
    }

    /**
     * Handle the payment failure callback from Kashier
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function handleFailure(Request $request)
    {
        try {
            // Clear session payment data
            session()->forget(['kashier_payment_params', 'order_notes']);

            // Log the failure details
            Log::info('Payment failed', [
                'params' => $request->all()
            ]);

            return redirect()->route('checkout.index')
                ->with('error', 'Payment was not successful. Please try again or use a different payment method.');

        } catch (Exception $e) {
            Log::error('Error handling payment failure: ' . $e->getMessage(), [
                'exception' => $e
            ]);

            return redirect()->route('checkout.index')
                ->with('error', 'Error processing your payment. Please try again or contact support.');
        }
    }

    /**
     * Handle webhooks from Kashier server
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function handleWebhook(Request $request)
    {
        try {
            Log::info('Kashier webhook received', ['payload' => $request->all()]);

            // Verify the signature
            if (!$this->kashierService->validateSignature($request->all())) {
                Log::warning('Invalid Kashier signature in webhook', ['params' => $request->all()]);
                return response()->json(['status' => 'error', 'message' => 'Invalid signature'], 400);
            }

            $paymentRef = $request->input('merchantOrderId');

            // We can't directly process this here because we might not have the session data
            // The user may have already been redirected and payment confirmed
            // Just log the event and return success
            Log::info('Kashier payment confirmed via webhook', [
                'paymentRef' => $paymentRef,
                'paymentId' => $request->input('paymentId'),
                'amount' => $request->input('amount')
            ]);

            return response()->json(['status' => 'success']);

        } catch (Exception $e) {
            Log::error('Error processing Kashier webhook: ' . $e->getMessage(), ['exception' => $e, 'payload' => $request->all()]);
            return response()->json(['status' => 'error', 'message' => 'Internal server error'], 500);
        }
    }

    /**
     * Show the payment iframe page for an order (Legacy method for backward compatibility)
     *
     * @param int $orderId
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function showPayment(int $orderId)
    {
        try {
            $order = $this->orderService->getOrderById($orderId);

            // Check if order is already paid
            if ($order->payment_status === PaymentStatus::PAID) {
                return redirect()->route('orders.show', $order->id)
                    ->with('info', 'This order has already been paid.');
            }

            if ($order->payment_method !== PaymentMethod::KASHIER) {
                return redirect()->route('orders.show', $order->id)
                    ->with('error', 'This order does not use online payment.');
            }

            // Generate payment hash - use order ID directly for this legacy method
            $merchantId = $this->kashierService->getMerchantId();
            $amount = number_format($order->total, 2, '.', '');
            $currency = 'EGP';
            $orderId = $order->id;
            $secret = $this->kashierService->getApiKey();

            // Create the path string
            $path = "/?payment={$merchantId}.{$orderId}.{$amount}.{$currency}";

            // Generate the hash
            $orderHash = hash_hmac('sha256', $path, $secret);

            // Get the required URLs
            $successUrl = route('kashier.payment.success');
            $failureUrl = route('kashier.payment.failure');
            $webhookUrl = $this->kashierService->getWebhookUrl();

            // Store order ID in session for legacy success/failure handler
            session()->put('legacy_order_id', $order->id);

            return Inertia::render('Payments/Kashier', [
                'order' => $order,
                'kashierParams' => [
                    'merchantId' => $merchantId,
                    'orderId' => $order->id,
                    'amount' => $amount,
                    'currency' => $currency,
                    'hash' => $orderHash,
                    'mode' => $this->kashierService->getMode(),
                    'merchantRedirect' => $successUrl,
                    'failureRedirect' => $failureUrl,
                    'serverWebhook' => $webhookUrl,
                    'allowedMethods' => 'card',
                    'displayMode' => 'ar',
                    'paymentRequestId' => uniqid('pr_'),
                ],
            ]);
        } catch (Exception $e) {
            Log::error('Error showing Kashier payment: ' . $e->getMessage(), ['exception' => $e]);
            return redirect()->route('orders.index')
                ->with('error', 'Unable to process payment. Please try again later.');
        }
    }
}
