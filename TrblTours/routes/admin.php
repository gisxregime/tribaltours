<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\GuideVerificationController;
use App\Http\Controllers\Admin\ReportModerationController;
use App\Http\Controllers\Admin\UserManagementController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->as('admin.')->group(function () {
    Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::resource('guide-verifications', GuideVerificationController::class);
    Route::resource('reports', ReportModerationController::class);
    Route::resource('users', UserManagementController::class);
});
