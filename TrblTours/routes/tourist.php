<?php

use App\Http\Controllers\Tourist\BookingController;
use App\Http\Controllers\Tourist\FavoriteController;
use App\Http\Controllers\Tourist\MessageController;
use App\Http\Controllers\Tourist\AccountController;
use App\Http\Controllers\Tourist\TourListingFeedController;
use App\Http\Controllers\Tourist\TourRequestController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:tourist'])->prefix('tourist')->as('tourist.')->group(function () {
    Route::get('account/profile', [AccountController::class, 'show'])->name('account.profile');
    Route::patch('account/profile', [AccountController::class, 'updateProfile'])->name('account.profile.update');
    Route::patch('account/password', [AccountController::class, 'updatePassword'])->name('account.password.update');
    Route::patch('account/preferences', [AccountController::class, 'updatePreferences'])->name('account.preferences.update');
    Route::patch('account/settings', [AccountController::class, 'updateSettings'])->name('account.settings.update');
    Route::get('tours/feed', [TourListingFeedController::class, 'index'])->name('tours.feed');
    Route::get('tours/feed/{tourListing}', [TourListingFeedController::class, 'show'])->name('tours.feed.show');

    Route::get('favorites/mine', [FavoriteController::class, 'mine'])->name('favorites.mine');
    Route::post('favorites/toggle', [FavoriteController::class, 'toggle'])->name('favorites.toggle');

    Route::get('bookings/mine', [BookingController::class, 'mine'])->name('bookings.mine');
    Route::patch('bookings/{booking}/transition', [BookingController::class, 'transition'])->name('bookings.transition');

    Route::get('messages/threads', [MessageController::class, 'threads'])->name('messages.threads');
    Route::get('messages/threads/{conversation}', [MessageController::class, 'thread'])->name('messages.thread');
    Route::post('messages/threads/{conversation}', [MessageController::class, 'sendToThread'])->name('messages.thread.send');
    Route::post('messages/start', [MessageController::class, 'start'])->name('messages.start');

    Route::post('requests/{tourRequest}/comment', [TourRequestController::class, 'addComment'])->name('requests.comment');
    Route::post('requests/{tourRequest}/select-guide', [TourRequestController::class, 'selectGuide'])->name('requests.select-guide');
    Route::get('requests/mine', [TourRequestController::class, 'mine'])->name('requests.mine');
    Route::resource('requests', TourRequestController::class)
        ->parameters(['requests' => 'tourRequest']);
    Route::resource('bookings', BookingController::class);
    Route::resource('favorites', FavoriteController::class);
    Route::resource('messages', MessageController::class);
});
