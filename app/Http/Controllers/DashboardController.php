<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Customer;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $role = $user->role;

        // Query base for shipments
        $shipmentsQuery = Shipment::with([
            'customer',
            'sales',
            'shipmentItems',
            'documents.uploader',
            'documents.reviews.reviewer',
            'payments.validator',
            'statusLogs.user',
            'documentRequests.requester',
        ]);

        switch ($role) {
            case 'sales':
                $shipmentsQuery->where('sales_id', $user->id);
                break;
            case 'export_staff':
                // export staff sees shipments in progress, sent to export, review, approved, etc.
                $shipmentsQuery->whereIn('status', ['SENT_TO_EXPORT', 'IN_PROGRESS', 'IN_REVIEW', 'APPROVED', 'PAYMENT_VERIFIED', 'SENT_TO_FORWARDER', 'IN_CUSTOMS', 'SHIPPED', 'DELIVERED', 'ARCHIVED']);
                break;
            case 'export_manager':
                // Manager sees shipments that are in review or approved or forwarded
                $shipmentsQuery->whereIn('status', ['IN_REVIEW', 'APPROVED', 'PAYMENT_VERIFIED', 'SENT_TO_FORWARDER', 'IN_CUSTOMS', 'SHIPPED', 'DELIVERED', 'ARCHIVED']);
                break;
            case 'finance':
                // Finance sees shipments that are approved, payment verified, forwarder-related
                $shipmentsQuery->whereIn('status', ['APPROVED', 'PAYMENT_VERIFIED', 'SENT_TO_FORWARDER', 'IN_CUSTOMS', 'SHIPPED', 'DELIVERED', 'ARCHIVED']);
                break;
            case 'forwarder':
                // Forwarder sees shipments handed over to forwarders and onwards
                $shipmentsQuery->whereIn('status', ['SENT_TO_FORWARDER', 'IN_CUSTOMS', 'SHIPPED', 'DELIVERED', 'ARCHIVED']);
                break;
            case 'admin':
            default:
                // Admin sees all
                break;
        }

        $shipments = $shipmentsQuery->latest()->get();
        $customers = Customer::all();
        $auditLogs = AuditLog::with('user')->latest()->take(50)->get();

        // Extra details for admin
        $users = [];
        if ($role === 'admin') {
            $users = User::all();
        }

        return Inertia::render('Dashboard', [
            'shipments' => $shipments,
            'customers' => $customers,
            'auditLogs' => $auditLogs,
            'users' => $users,
        ]);
    }
}
