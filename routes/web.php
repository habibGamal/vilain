<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\WishlistController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\User;
use App\Notifications\Notify;

Route::get('/', App\Http\Controllers\HomeController::class)->name('home');

// Product routes
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');

// Brand routes
Route::get('/brands', [BrandController::class, 'index'])->name('brands.index');
Route::get('/brands/{brand}', [BrandController::class, 'show'])->name('brands.show');

// Category routes
Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
Route::get('/categories/{category}', [CategoryController::class, 'show'])->name('categories.show');

// Search routes
Route::get('/search', [SearchController::class, 'results'])->name('search.results');
Route::get('/search/suggestions', [SearchController::class, 'suggestions'])->name('search.suggestions');

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
    Route::patch('/cart/{id}', [CartController::class, 'updateItem'])->name('cart.update');
    Route::delete('/cart/{id}', [CartController::class, 'removeItem'])->name('cart.remove');
    Route::delete('/cart', [CartController::class, 'clearCart'])->name('cart.clear');
    Route::get('/cart/summary', [CartController::class, 'getSummary'])->name('cart.summary');

    // Wishlist routes
    Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('/wishlist/add', [WishlistController::class, 'addItem'])->name('wishlist.add');
    Route::delete('/wishlist/remove', [WishlistController::class, 'removeItem'])->name('wishlist.remove');
    Route::delete('/wishlist', [WishlistController::class, 'clearList'])->name('wishlist.clear');
    Route::get('/wishlist/summary', [WishlistController::class, 'getSummary'])->name('wishlist.summary');
});

require __DIR__.'/auth.php';
