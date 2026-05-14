<?php

use App\Http\Controllers\Guide\AvailabilityController;
use App\Http\Controllers\Guide\AccountController;
use App\Http\Controllers\Guide\BookingRequestController;
use App\Http\Controllers\Guide\EarningsController;
use App\Http\Controllers\Guide\GuideDashboardController;
use App\Http\Controllers\Guide\MessageController;
use App\Http\Controllers\Guide\TourRequestFeedController;
use App\Http\Controllers\Guide\TourListingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:guide'])->prefix('guide')->as('guide.')->group(function () {
    Route::get('account/profile', [AccountController::class, 'show'])->name('account.profile');
    Route::patch('account/profile', [AccountController::class, 'updateProfile'])->name('account.profile.update');
    Route::get('dashboard', [GuideDashboardController::class, 'index'])->name('dashboard');
    Route::get('request-feed', [TourRequestFeedController::class, 'index'])->name('request-feed.index');
    Route::post('request-feed/{tourRequest}/comment', [TourRequestFeedController::class, 'comment'])->name('request-feed.comment');
    Route::get('messages/threads', [MessageController::class, 'threads'])->name('messages.threads');
    Route::get('messages/threads/{conversation}', [MessageController::class, 'thread'])->name('messages.thread');
    Route::post('messages/threads/{conversation}', [MessageController::class, 'sendToThread'])->name('messages.thread.send');
    Route::get('earnings', [EarningsController::class, 'index'])->name('earnings.index');
    Route::resource('tours', TourListingController::class);
    Route::resource('booking-requests', BookingRequestController::class)
        ->parameters(['booking-requests' => 'booking']);
    Route::resource('availabilities', AvailabilityController::class);
});
