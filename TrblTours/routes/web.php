<?php

use App\Events\TestRealtimeEvent;
use App\Http\Controllers\Auth\MultiStepRegistrationController;
use App\Http\Controllers\Auth\OtpVerificationController;
use App\Http\Controllers\Auth\LegacyRegistrationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\GuideController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TourController;
use App\Http\Controllers\Tourist\TourListingFeedController as TouristTourListingFeedController;
use App\Http\Controllers\TouristController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', [TouristController::class, 'index'])->name('home');

Route::middleware('guest')->prefix('auth')->name('auth.page.')->group(function () {
    Route::get('login', [AuthController::class, 'login'])->name('login');
    Route::get('register', [AuthController::class, 'register'])->name('register');
    Route::get('forgot-password', [AuthController::class, 'forgotPassword'])->name('forgot-password');
});

Route::middleware('guest')->group(function () {
    Route::get('/sign-in', [AuthController::class, 'signIn'])->name('sign-in');
    Route::get('/get-started', [AuthController::class, 'getStarted'])->name('get-started');
});

Route::middleware(['auth', 'verified', 'role:tourist'])->group(function () {
    Route::get('/tourist', [TouristController::class, 'portal'])->name('tourist.portal');
    Route::get('/explore', [TourController::class, 'explore'])->name('explore');
    Route::get('/likes', [TouristController::class, 'likes'])->name('likes');
    Route::get('/my-posts', [TouristController::class, 'myPosts'])->name('my-posts');
    Route::get('/my-bookings', [BookingController::class, 'myBookings'])->name('my-bookings');
    Route::get('/messages', [MessageController::class, 'tourist'])->name('messages');
    Route::get('/messages/{guideId}', [MessageController::class, 'tourist'])
        ->whereNumber('guideId')
        ->name('messages.guide');
    Route::get('/profile', [ProfileController::class, 'tourist'])->name('profile');
    Route::get('/settings', [ProfileController::class, 'settings'])->name('settings');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/tour-preview', [TourController::class, 'preview'])->name('tour-preview');
    Route::get('/catalog/tours/feed', [TouristTourListingFeedController::class, 'index'])->name('catalog.tours.feed');
    Route::get('/catalog/tours/feed/{tourListing}', [TouristTourListingFeedController::class, 'show'])->name('catalog.tours.feed.show');
});

Route::middleware(['auth', 'verified'])->prefix('notifications')->name('notifications.')->group(function () {
    Route::get('/', [NotificationController::class, 'index'])->name('index');
    Route::patch('{notificationId}/read', [NotificationController::class, 'markRead'])->name('read');
    Route::patch('mark-all-read', [NotificationController::class, 'markAllRead'])->name('mark-all-read');
    Route::post('read-all', [NotificationController::class, 'markAllRead'])->name('read-all');
    Route::delete('clear-all', [NotificationController::class, 'clearAll'])->name('clear-all');
    Route::delete('{notificationId}', [NotificationController::class, 'destroy'])->name('destroy');
});

Route::middleware(['auth', 'verified', 'role:tourist'])->prefix('booking')->name('booking.')->group(function () {
    Route::get('details', [BookingController::class, 'details'])->name('details');
    Route::get('confirmation', [PaymentController::class, 'confirmation'])->name('confirmation');
    Route::get('payment-method', [PaymentController::class, 'method'])->name('payment-method');
    Route::get('payment-processing', [PaymentController::class, 'processing'])->name('payment-processing');
});

Route::middleware(['auth', 'verified', 'role:guide'])->prefix('guide')->name('guide.')->group(function () {
    Route::get('request-post-feed', [GuideController::class, 'requestPostFeed'])->name('request-feed.page');
    Route::get('messages', [MessageController::class, 'guide'])->name('messages');
    Route::get('profile', [GuideController::class, 'profile'])->name('profile');
    Route::get('settings', [GuideController::class, 'settings'])->name('settings');
    Route::get('availability', [GuideController::class, 'availability'])->name('availability');
});

Route::middleware(['auth', 'verified', 'role:tourist'])->prefix('api')->name('api.')->group(function () {
    Route::post('payment/success', [\App\Http\Controllers\Tourist\BookingController::class, 'paymentSuccess'])->name('payment.success');
    Route::post('booking/set-date', [\App\Http\Controllers\Tourist\BookingController::class, 'setDate'])->name('booking.set-date');
    Route::get('my-bookings', [\App\Http\Controllers\Tourist\BookingController::class, 'mine'])->name('my-bookings');
    Route::patch('booking/{booking}/complete', [\App\Http\Controllers\Tourist\BookingController::class, 'complete'])->name('booking.complete');
});

Route::get('/register/step/{step?}', [MultiStepRegistrationController::class, 'showStep'])
    ->whereNumber('step')
    ->name('auth.register.step');
Route::post('/register/step/{step}', [MultiStepRegistrationController::class, 'storeStep'])
    ->whereNumber('step')
    ->name('auth.register.step.store');
Route::delete('/register/draft', [MultiStepRegistrationController::class, 'clearDraft'])
    ->name('auth.register.step.clear');

Route::post('/otp/issue', [OtpVerificationController::class, 'issue'])->name('auth.otp.issue');
Route::post('/otp/verify', [OtpVerificationController::class, 'verify'])->name('auth.otp.verify');
Route::post('/register/legacy', [LegacyRegistrationController::class, 'store'])->name('auth.register.legacy');

Route::get('/dashboard', function (Request $request) {
    $user = $request->user();
    if (!$user) {
        return redirect()->route('sign-in');
    }
    if ($user->role === 'admin') {
        return redirect()->route('admin.dashboard');
    }
    if ($user->role === 'guide') {
        return redirect()->route('guide.dashboard');
    }
    return redirect()->route('explore');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/test-broadcast', function () {
    event(new TestRealtimeEvent());

    return response()->json([
        'ok' => true,
        'channel' => 'test-channel',
        'event' => 'TestRealtimeEvent',
        'message' => 'Broadcast dispatched.',
    ]);
})->name('test.broadcast');

Route::middleware('auth')->group(function () {
    Route::get('/account/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/account/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/account/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/tourist.php';
require __DIR__.'/guide.php';
require __DIR__.'/admin.php';

require __DIR__.'/auth.php';
