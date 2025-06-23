<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\AddressController;
use App\Http\Controllers\KashierPaymentController;
use App\Http\Controllers\OrderReturnController;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\User;
use App\Notifications\Notify;

Route::get('/', function () {
    return 'HI';
});

Route::get('/', App\Http\Controllers\HomeController::class)->name('home');

// Product routes
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');

// Brand routes
Route::get('/brands', [BrandController::class, 'index'])->name('brands.index');

// Category routes
Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
Route::get('/categories/{category}', [CategoryController::class, 'show'])->name('categories.show');

// Section routes
Route::get('/sections/{section}', [SectionController::class, 'show'])->name('sections.show');

// Search routes
Route::get('/search', [SearchController::class, 'results'])->name('search.results');
Route::get('/search/suggestions', [SearchController::class, 'suggestions'])->name('search.suggestions');

// Pages routes
Route::get('/privacy', [App\Http\Controllers\PagesController::class, 'privacy'])->name('pages.privacy');
Route::get('/returns', [App\Http\Controllers\PagesController::class, 'returns'])->name('pages.returns');
Route::get('/terms', [App\Http\Controllers\PagesController::class, 'terms'])->name('pages.terms');

Route::get('/notify', function () {
    $subscriptions = User::all();
    Notification::send($subscriptions, new Notify());
    return response()->json(['sent' => true]);
});

Route::post('/subscribe', function () {
    $user = auth()->user();

    $user->updatePushSubscription(
        request('endpoint'),
        request('publicKey'),
        request('authToken'),
        'aesgcm'
    );

    return response()->noContent();
})->middleware('auth');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Cart routes
    Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
    Route::post('/cart/add', [CartController::class, 'addItem'])->name('cart.add');
    Route::patch('/cart/{cartItem}', [CartController::class, 'updateItem'])->name('cart.update');
    Route::delete('/cart/{cartItem}', [CartController::class, 'removeItem'])->name('cart.remove');
    Route::delete('/cart', [CartController::class, 'clearCart'])->name('cart.clear');
    Route::get('/cart/summary', [CartController::class, 'getSummary'])->name('cart.summary');

    // Wishlist routes
    Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('/wishlist/add', [WishlistController::class, 'addItem'])->name('wishlist.add');
    Route::delete('/wishlist/remove/{product}', [WishlistController::class, 'removeItem'])->name('wishlist.remove');
    Route::delete('/wishlist', [WishlistController::class, 'clearList'])->name('wishlist.clear');
    Route::get('/wishlist/summary', [WishlistController::class, 'getSummary'])->name('wishlist.summary');

    // Address routes
    Route::post('/addresses', [AddressController::class, 'store'])->name('addresses.store');
    Route::get('/addresses/areas', [AddressController::class, 'getAreas'])->name('addresses.areas');

    // Promotion routes
    Route::post('/promotions/apply', [App\Http\Controllers\PromotionController::class, 'applyPromotion'])->name('promotions.apply');
    Route::delete('/promotions/remove', [App\Http\Controllers\PromotionController::class, 'removePromotion'])->name('promotions.remove');
    Route::get('/promotions/automatic', [App\Http\Controllers\PromotionController::class, 'getAutomaticPromotions'])->name('promotions.automatic');

    // Order routes
    Route::get('/checkout', [OrderController::class, 'checkout'])->name('checkout.index');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show')->where('order', '[0-9]+'); // Ensure order ID is numeric
    Route::patch('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel')->where('order', '[0-9]+'); // Ensure order ID is numeric

    // Order return routes
    Route::post('/orders/{order}/return', [OrderReturnController::class, 'requestReturn'])->name('orders.return.request')->where('order', '[0-9]+');
    Route::get('/orders/returns/history', [OrderReturnController::class, 'history'])->name('orders.returns.history');

    // Kashier payment routes
    Route::get('/payments/kashier/initiate', [KashierPaymentController::class, 'initiatePayment'])->name('kashier.payment.initiate');
    Route::get('/payments/kashier/success', [KashierPaymentController::class, 'handleSuccess'])->name('kashier.payment.success');
    Route::get('/payments/kashier/failure', [KashierPaymentController::class, 'handleFailure'])->name('kashier.payment.failure');

    // Keep the old route for backward compatibility but mark it as deprecated
    Route::get('/payments/kashier/{order}', [KashierPaymentController::class, 'showPayment'])->name('kashier.payment.show');
});

// Kashier webhook - This route is not protected as it's accessed by the Kashier server
Route::post('/webhooks/kashier', [KashierPaymentController::class, 'handleWebhook'])->name('kashier.payment.webhook')
->withoutMiddleware([VerifyCsrfToken::class]);

// API Routes for Settings
Route::prefix('api')->group(function () {
    Route::get('/settings', [App\Http\Controllers\Api\SettingsController::class, 'index']);
    Route::get('/settings/group/{group}', [App\Http\Controllers\Api\SettingsController::class, 'byGroup']);
    Route::get('/settings/{key}', [App\Http\Controllers\Api\SettingsController::class, 'show']);
});

require __DIR__.'/auth.php';
