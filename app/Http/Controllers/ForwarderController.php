<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Shipment;
use App\Services\NotificationService;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;

class ForwarderController extends Controller
{
    use LogsActivity;

    public function updateStatus(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:IN_CUSTOMS,SHIPPED,DELIVERED',
            'notes' => 'nullable|string',
        ]);

        $currentStatus = $shipment->status;
        $newStatus = $validated['status'];

        // Enforce sequence:
        // SENT_TO_FORWARDER -> IN_CUSTOMS -> SHIPPED -> DELIVERED
        $validMap = [
            'SENT_TO_FORWARDER' => 'IN_CUSTOMS',
            'IN_CUSTOMS' => 'SHIPPED',
            'SHIPPED' => 'DELIVERED',
        ];

        if (!isset($validMap[$currentStatus]) || $validMap[$currentStatus] !== $newStatus) {
            return redirect()->back()->withErrors([
                'status' => 'Transisi status tidak valid. Status saat ini "' . $currentStatus . '" hanya bisa diubah ke "' . ($validMap[$currentStatus] ?? 'None') . '".'
            ]);
        }

        $shipment->update(['status' => $newStatus]);
        $this->logStatusChange($shipment->id, $newStatus, $validated['notes'] ?? 'Updated by Forwarder.');
        $this->logAudit('UPDATE_SHIPMENT_STATUS', 'Shipment', $shipment->id, [
            'po_number' => $shipment->po_number,
            'old_status' => $currentStatus,
            'new_status' => $newStatus,
            'detail' => 'Status pengapalan PO ' . $shipment->po_number . ' diubah dari ' . $currentStatus . ' ke ' . $newStatus,
        ]);

        // Notifications
        NotificationService::notifyRole(
            'export_staff',
            'SHIPMENT_STATUS_UPDATED',
            'Status Shipment Diperbarui',
            'Status PO ' . $shipment->po_number . ' diperbarui oleh forwarder ke ' . $newStatus,
            $shipment->id
        );
        NotificationService::notify(
            $shipment->sales_id,
            'SHIPMENT_STATUS_UPDATED',
            'Status Shipment Anda Diperbarui',
            'Status PO ' . $shipment->po_number . ' telah diperbarui ke ' . $newStatus,
            $shipment->id
        );

        return redirect()->back()->with('success', 'Status updated successfully.');
    }

    public function uploadCustomsDoc(Request $request, Shipment $shipment)
    {
        $request->validate([
            'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:25600',
            'type' => 'required|string',
        ]);

        $file = $request->file('document');
        $fileName = $file->getClientOriginalName();
        $path = $file->store('documents', 'public');

        // versioning
        $latestVersion = Document::where('shipment_id', $shipment->id)
            ->where('type', $request->type)
            ->max('version') ?? 0;

        $version = $latestVersion + 1;

        $doc = Document::create([
            'shipment_id' => $shipment->id,
            'type' => $request->type,
            'version' => $version,
            'file_name' => $fileName,
            'file_path' => $path,
            'status' => 'APPROVED', // Customs docs are auto-approved since they are final/regulatory from forwarder
            'uploaded_by' => auth()->id(),
        ]);

        $this->logAudit('UPLOAD_CUSTOMS_DOCUMENT', 'Document', $doc->id, [
            'shipment_id' => $shipment->id,
            'po_number' => $shipment->po_number,
            'type' => $doc->type,
            'version' => $doc->version,
            'detail' => 'Dokumen bea cukai ' . $doc->type . ' v' . $doc->version . ' diunggah untuk PO ' . $shipment->po_number,
        ]);

        NotificationService::notifyRole(
            'export_staff',
            'CUSTOMS_DOCUMENT_UPLOADED',
            'Dokumen Bea Cukai Baru',
            'Dokumen ' . $doc->type . ' diunggah oleh Forwarder untuk PO ' . $shipment->po_number,
            $shipment->id
        );

        return redirect()->back()->with('success', 'Customs document uploaded successfully.');
    }

    public function confirmDelivery(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        if ($shipment->status !== 'SHIPPED') {
            return redirect()->back()->withErrors(['status' => 'Barang harus dikirim (SHIPPED) terlebih dahulu sebelum konfirmasi tiba.']);
        }

        $shipment->update(['status' => 'DELIVERED']);
        $this->logStatusChange($shipment->id, 'DELIVERED', $validated['notes'] ?? 'Delivered and confirmed by Forwarder.');
        
        $this->logAudit('CONFIRM_DELIVERY', 'Shipment', $shipment->id, [
            'po_number' => $shipment->po_number,
            'detail' => 'Konfirmasi kedatangan barang untuk PO ' . $shipment->po_number . ' disimpan.',
        ]);

        NotificationService::notifyRole(
            'export_staff',
            'SHIPMENT_DELIVERED',
            'Barang Tiba di Tujuan',
            'Forwarder mengonfirmasi barang untuk PO ' . $shipment->po_number . ' telah tiba di pelabuhan tujuan.',
            $shipment->id
        );
        NotificationService::notify(
            $shipment->sales_id,
            'SHIPMENT_DELIVERED',
            'Barang Tiba di Tujuan',
            'Barang untuk PO ' . $shipment->po_number . ' telah tiba di pelabuhan tujuan.',
            $shipment->id
        );

        return redirect()->back()->with('success', 'Delivery confirmed successfully.');
    }
}
