<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class KashierPaymentService
{
    protected OrderService $orderService;

    /**
     * Create a new service instance.
     *
     * @param OrderService $orderService
     */
    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    /**
     * Get the Kashier merchant ID from config
     */
    public function getMerchantId(): string
    {
        return config('services.kashier.merchant_id');
    }

    /**
     * Get the Kashier API key from config
     */
    public function getApiKey(): string
    {
        return config('services.kashier.api_key');
    }

    /**
     * Get the current mode (test/live) from config
     */
    public function getMode(): string
    {
        return config('services.kashier.mode', 'test');
    }

    /**
     * Generate payment parameters for an order that hasn't been created yet
     *
     * @param int $addressId The shipping address ID
     * @param string|null $couponCode Optional coupon code
     * @param string|null $customerReference Optional customer reference for saving cards
     * @return array The payment parameters
     */
    public function generatePreOrderPaymentParams(
        int $addressId,
        ?string $couponCode = null,
        ?string $customerReference = null
    ): array {
        // Calculate order totals using OrderService
        $orderData = $this->orderService->calculateOrderTotal($addressId, $couponCode);

        // Generate a unique reference for this payment attempt
        $uniqueRef = Str::uuid()->toString();

        // Format amount with 2 decimal places
        $amount = number_format($orderData['total'], 2, '.', '');

        // Generate the hash
        $merchantId = $this->getMerchantId();
        $currency = 'EGP'; // Default currency, can be made configurable
        $secret = $this->getApiKey();

        // Create the path string as per Kashier's documentation
        $path = "/?payment={$merchantId}.{$uniqueRef}.{$amount}.{$currency}";

        // Add customer reference if provided
        if ($customerReference) {
            $path .= ".{$customerReference}";
        }

        // Generate the hash using HMAC SHA256
        $hash = hash_hmac('sha256', $path, $secret);

        return [
            'merchantId' => $merchantId,
            'orderId' => $uniqueRef,
            'amount' => $amount,
            'currency' => $currency,
            'hash' => $hash,
            'mode' => $this->getMode(),
            'uniqueRef' => $uniqueRef,
            'orderData' => $orderData, // Include order calculation data for later use
            'addressId' => $addressId,
            'couponCode' => $couponCode
        ];
    }

    /**
     * Process successful payment and update order status
     *
     * @param array $paymentData
     * @return array
     */
    public function processPaymentData(array $paymentData): array
    {
        // Extract relevant payment information
        return [
            'payment_id' => $paymentData['paymentId'] ?? null,
            'transaction_id' => $paymentData['transactionId'] ?? null,
            'card_info' => [
                'masked_card' => $paymentData['cardDataToken']['maskedCard'] ?? null,
                'card_brand' => $paymentData['cardBrand'] ?? null,
            ],
            'status' => $paymentData['status'] ?? null,
            'amount' => $paymentData['amount'] ?? null,
            'currency' => $paymentData['currency'] ?? null,
            'response_code' => $paymentData['responseCode'] ?? null,
            'response_message' => $paymentData['responseMessage'] ?? null,
            'timestamp' => $paymentData['timestamp'] ?? now()->timestamp,
        ];
    }

    /**
     * Validate the Kashier payment response signature
     *
     * @param array $params The response parameters from Kashier
     * @return bool Whether the signature is valid
     */
    public function validateSignature(array $params): bool
    {
        $secret = $this->getApiKey();
        $receivedSignature = $params['signature'];
        $queryString = "";
        foreach ($params as $key => $value) {
            if ($key === "signature" || $key === "mode") {
                continue;
            }
            $queryString .= "&{$key}={$value}";
        }

        $queryString = ltrim($queryString, '&');
        // Generate the expected signature
        $expectedSignature = hash_hmac('sha256', $queryString, $secret);

        // Compare the signatures (use timing-safe comparison)
        return hash_equals($expectedSignature, $receivedSignature);
    }

    /**
     * Get the redirect URL for successful payments
     *
     * @param Order $order
     * @return string
     */
    public function getSuccessRedirectUrl(Order $order): string
    {
        return route('kashier.payment.success', ['order' => $order->id]);
    }

    /**
     * Get the redirect URL for failed payments
     *
     * @param Order $order
     * @return string
     */
    public function getFailureRedirectUrl(Order $order): string
    {
        return route('kashier.payment.failure', ['order' => $order->id]);
    }

    /**
     * Get the webhook URL for server notifications from Kashier
     *
     * @return string
     */
    public function getWebhookUrl(): string
    {
        return route('kashier.payment.webhook');
    }

    /**
     * Process a successful payment for an order
     *
     * @param Order $order The order to update
     * @param array $paymentData The payment data from Kashier
     * @return Order The updated order
     */
    public function processSuccessfulPayment(Order $order, array $paymentData): Order
    {
        // Update the order payment status to paid
        $order->payment_status = \App\Enums\PaymentStatus::PAID;
        $order->payment_details = json_encode($paymentData);
        $order->payment_id = $paymentData['paymentId'] ?? null;
        $order->save();

        return $order;
    }
}
