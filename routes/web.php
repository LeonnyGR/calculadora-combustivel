<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\RouteCalculatorController;

Route::inertia('/', 'calculator')->name('calculator');

// API Routes
Route::prefix('api')->group(function () {
    // Location routes
    Route::get('/states', [RouteCalculatorController::class, 'getStates']);
    Route::get('/cities/{stateCode}', [RouteCalculatorController::class, 'getCities']);
    Route::post('/coordinates', [RouteCalculatorController::class, 'getCoordinates']);
    
    // Vehicle routes
    Route::get('/vehicles/brands', [VehicleController::class, 'getBrands']);
    Route::get('/vehicles/brands/{brandSlug}', [VehicleController::class, 'getModels']);
    Route::get('/vehicles/brands/{brandSlug}/{modelSlug}', [VehicleController::class, 'getYears']);
    Route::get('/vehicles/brands/{brandSlug}/{modelSlug}/{year}', [VehicleController::class, 'getVersions']);
    
    // Route calculation
    Route::post('/calculate-route', [RouteCalculatorController::class, 'calculateRoute']);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
