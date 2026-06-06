<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\ExportManagerController;
use App\Http\Controllers\ExportStaffController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\ForwarderController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ShipmentController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Document Preview & Download
    Route::get('/documents/{document}/preview', [DocumentController::class, 'preview'])->name('documents.preview');
    Route::get('/documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download');

    // Notifications
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');

    // Email notification toggle
    Route::post('/profile/toggle-email-notifications', [ProfileController::class, 'toggleEmailNotifications'])->name('profile.toggle-email-notifications');
});

// Shared Customer Routes
Route::middleware(['auth', 'role:sales,export_staff,admin'])->group(function () {
    Route::post('/customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::put('/customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
});

// Modul Sales
Route::middleware(['auth', 'role:sales,admin'])->prefix('sales')->group(function () {
    Route::post('/shipments', [ShipmentController::class, 'store']);
    Route::put('/shipments/{shipment}', [ShipmentController::class, 'update']);
    Route::post('/shipments/{shipment}/submit', [ShipmentController::class, 'submitToExport']);
    Route::post('/shipments/{shipment}/documents', [ShipmentController::class, 'uploadSupportingDocument']); // FR-SAL-06
});

// Modul Staff Export
Route::middleware(['auth', 'role:export_staff,admin'])->prefix('export')->group(function () {
    Route::put('/shipments/{shipment}/details', [ExportStaffController::class, 'updateShipmentDetails']);
    Route::post('/shipments/{shipment}/generate-document', [ExportStaffController::class, 'generateDocument']);
    Route::post('/shipments/{shipment}/request-document', [ExportStaffController::class, 'requestDocumentFromSales']); // FR-STA-04
    Route::post('/shipments/{shipment}/submit-review', [ExportStaffController::class, 'submitForReview']);
    Route::post('/shipments/{shipment}/send-forwarder', [ExportStaffController::class, 'sendToForwarder']);
    Route::post('/shipments/{shipment}/archive', [ExportStaffController::class, 'archive']);
    Route::post('/shipments/{shipment}/request-document', [ExportStaffController::class, 'requestDocument']);
});

// Shared Document Upload for Export Staff and Sales (requested documents)
Route::middleware(['auth', 'role:export_staff,sales,admin'])->prefix('export')->group(function () {
    Route::post('/shipments/{shipment}/documents', [ExportStaffController::class, 'uploadDocument']);
});

// Modul Manager Export
Route::middleware(['auth', 'role:export_manager,admin'])->prefix('manager')->group(function () {
    Route::post('/documents/{document}/approve', [ExportManagerController::class, 'approveDocument']);
    Route::post('/documents/{document}/revise', [ExportManagerController::class, 'reviseDocument']);
});

Route::middleware(['auth', 'role:export_manager,finance,admin'])->prefix('manager')->group(function () {
    Route::get('/reports', [ExportManagerController::class, 'report'])->name('manager.reports');
    Route::get('/reports/export', [ExportManagerController::class, 'exportReport'])->name('manager.reports.export');
});

// Modul Finance
Route::middleware(['auth', 'role:finance,admin'])->prefix('finance')->group(function () {
    Route::post('/shipments/{shipment}/invoices', [FinanceController::class, 'storeInvoice']);
    Route::post('/payments/{payment}/upload-proof', [FinanceController::class, 'uploadProof']);
    Route::post('/payments/{payment}/validate/{status}', [FinanceController::class, 'validatePayment']);
});

Route::middleware(['auth', 'role:finance,export_manager,admin'])->prefix('finance')->group(function () {
    Route::get('/recap', [FinanceController::class, 'recap'])->name('finance.recap');
    Route::get('/export', [FinanceController::class, 'exportExcel'])->name('finance.export');
});

// Modul Forwarder
Route::middleware(['auth', 'role:forwarder,admin'])->prefix('forwarder')->group(function () {
    Route::post('/shipments/{shipment}/update-status', [ForwarderController::class, 'updateStatus']);
    Route::post('/shipments/{shipment}/customs-doc', [ForwarderController::class, 'uploadCustomsDoc']);
    Route::post('/shipments/{shipment}/confirm-delivery', [ForwarderController::class, 'confirmDelivery']);
});

// Modul Admin
Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/users', [AdminController::class, 'userIndex'])->name('admin.users');
    Route::post('/users', [AdminController::class, 'userStore']);
    Route::put('/users/{user}', [AdminController::class, 'userUpdate']);
    Route::post('/users/{user}/toggle-active', [AdminController::class, 'userToggleActive']);
    Route::get('/audit-logs', [AdminController::class, 'auditLogs'])->name('admin.audit-logs');
});

require __DIR__.'/auth.php';
