<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Shipment;
use App\Services\NotificationService;
use App\Traits\LogsActivity;
use App\Models\DocumentRequest;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ExportStaffController extends Controller
{
    use LogsActivity;

    public function updateShipmentDetails(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'port_loading' => 'nullable|string|max:255',
            'port_discharge' => 'nullable|string|max:255',
            'hs_code' => 'nullable|string|max:255',
        ]);

        $shipment->update([
            'port_loading' => $validated['port_loading'],
            'port_discharge' => $validated['port_discharge'],
        ]);

        if (!empty($validated['hs_code'])) {
            $item = $shipment->shipmentItems()->first();
            if ($item) {
                $item->update(['hs_code' => $validated['hs_code']]);
            }
        }

        if ($shipment->status === 'SENT_TO_EXPORT') {
            $shipment->update(['status' => 'IN_PROGRESS']);
            $this->logStatusChange($shipment->id, 'IN_PROGRESS', 'Export staff started processing details.');
        }

        $this->logAudit('UPDATE_SHIPMENT_DETAILS', 'Shipment', $shipment->id, [
            'po_number' => $shipment->po_number,
            'detail' => 'Detail pengapalan PO ' . $shipment->po_number . ' diperbarui oleh Export Staff.',
        ]);

        return redirect()->back()->with('success', 'Shipment details updated successfully.');
    }

    public function uploadDocument(Request $request, Shipment $shipment)
    {
        $request->validate([
            'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:25600', // 25MB = 25600KB
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
            'status' => 'DRAFT',
            'uploaded_by' => auth()->id(),
        ]);

        $this->logAudit('UPLOAD_DOCUMENT', 'Document', $doc->id, [
            'shipment_id' => $shipment->id,
            'po_number' => $shipment->po_number,
            'type' => $doc->type,
            'version' => $doc->version,
            'detail' => $doc->type . ' v' . $doc->version . ' diunggah untuk PO ' . $shipment->po_number,
        ]);

        return redirect()->back()->with('success', 'Document uploaded successfully.');
    }

    public function submitForReview(Shipment $shipment)
    {
        $hasInvoice = $shipment->documents()->where('type', 'Commercial Invoice')->exists();
        $hasPackingList = $shipment->documents()->where('type', 'Packing List')->exists();

        if (!$hasInvoice || !$hasPackingList) {
            return redirect()->back()->withErrors(['documents' => 'Dokumen wajib (Commercial Invoice dan Packing List) harus diunggah terlebih dahulu.']);
        }

        $shipment->update(['status' => 'IN_REVIEW']);
        $shipment->documents()->where('status', 'DRAFT')->update(['status' => 'IN_REVIEW']);

        $this->logStatusChange($shipment->id, 'IN_REVIEW', 'Sent to manager for approval.');
        $this->logAudit('SUBMIT_FOR_REVIEW', 'Shipment', $shipment->id, [
            'po_number' => $shipment->po_number,
            'detail' => 'Mengajukan approval dokumen untuk PO ' . $shipment->po_number . ' ke Export Manager.',
        ]);

        NotificationService::notifyRole(
            'export_manager',
            'REVIEW_REQUESTED',
            'Review Dokumen Baru',
            'Dokumen untuk PO ' . $shipment->po_number . ' telah dikirim untuk direview.',
            $shipment->id
        );

        return redirect()->back()->with('success', 'Shipment documents submitted for manager review.');
    }

    public function sendToForwarder(Shipment $shipment)
    {
        $docs = $shipment->documents;
        if ($docs->isEmpty()) {
            return redirect()->back()->withErrors(['error' => 'Belum ada dokumen ekspor yang diunggah.']);
        }

        $unapprovedDocs = $docs->where('status', '!=', 'APPROVED');
        if ($unapprovedDocs->isNotEmpty()) {
            return redirect()->back()->withErrors(['error' => 'Semua dokumen ekspor wajib berstatus APPROVED sebelum dikirim ke forwarder.']);
        }

        $payments = $shipment->payments;
        if ($payments->isEmpty()) {
            return redirect()->back()->withErrors(['error' => 'Tagihan vendor pembayaran belum diinput oleh Finance.']);
        }

        $unpaidPayments = $payments->where('status', '!=', 'PAID');
        if ($unpaidPayments->isNotEmpty()) {
            return redirect()->back()->withErrors(['error' => 'Ada tagihan vendor yang belum lunas (PAID).']);
        }

        $shipment->update(['status' => 'SENT_TO_FORWARDER']);

        $this->logStatusChange($shipment->id, 'SENT_TO_FORWARDER', 'Sent to internal forwarder.');
        $this->logAudit('SENT_TO_FORWARDER', 'Shipment', $shipment->id, [
            'po_number' => $shipment->po_number,
            'detail' => 'Shipment PO ' . $shipment->po_number . ' diserahkan ke Forwarder.',
        ]);

        NotificationService::notifyRole(
            'forwarder',
            'SHIPMENT_ASSIGNED',
            'Penugasan Pengiriman Baru',
            'Shipment PO ' . $shipment->po_number . ' siap untuk diproses bea cukai dan pengapalan.',
            $shipment->id
        );

        return redirect()->back()->with('success', 'Shipment successfully sent to forwarder.');
    }

    public function requestDocumentFromSales(Request $request, Shipment $shipment)
    {
        $request->validate([
            'document_type' => 'required|string|max:255',
            'message'       => 'nullable|string|max:1000',
        ]);

        $docRequest = DocumentRequest::create([
            'shipment_id'  => $shipment->id,
            'requested_by' => auth()->id(),
            'sales_id'     => $shipment->sales_id,
            'document_type'=> $request->document_type,
            'message'      => $request->message,
            'status'       => 'PENDING',
        ]);

        $this->logAudit('REQUEST_DOCUMENT_FROM_SALES', 'DocumentRequest', $docRequest->id, [
            'shipment_id'   => $shipment->id,
            'po_number'     => $shipment->po_number,
            'document_type' => $request->document_type,
            'detail'        => 'Staff Export meminta dokumen "' . $request->document_type . '" kepada Sales untuk PO ' . $shipment->po_number,
        ]);

        NotificationService::notify(
            $shipment->sales_id,
            'DOCUMENT_REQUESTED',
            'Dokumen Diminta oleh Export Staff',
            'Staff Export meminta dokumen "' . $request->document_type . '" untuk PO ' . $shipment->po_number . ($request->message ? ': ' . $request->message : '.'),
            $shipment->id
        );

        return redirect()->back()->with('success', 'Permintaan dokumen berhasil dikirim ke Sales.');
    }

    public function generateDocument(Request $request, Shipment $shipment)
    {
        $request->validate([
            'type' => 'required|string|in:Commercial Invoice,Packing List',
        ]);

        $type = $request->type;

        $shipment->load(['customer', 'shipmentItems', 'sales']);

        $templateMap = [
            'Commercial Invoice' => 'documents.commercial_invoice',
            'Packing List'       => 'documents.packing_list',
        ];

        $pdf = Pdf::loadView($templateMap[$type], ['shipment' => $shipment])
            ->setPaper('a4', 'portrait');

        $latestVersion = Document::where('shipment_id', $shipment->id)
            ->where('type', $type)
            ->max('version') ?? 0;

        $version = $latestVersion + 1;

        $slug = str_replace(' ', '_', strtolower($type));
        $fileName = $slug . '_' . $shipment->po_number . '_v' . $version . '.pdf';
        $storagePath = 'documents/' . $fileName;

        Storage::disk('public')->put($storagePath, $pdf->output());

        $doc = Document::create([
            'shipment_id' => $shipment->id,
            'type'        => $type,
            'version'     => $version,
            'file_name'   => $fileName,
            'file_path'   => $storagePath,
            'status'      => 'DRAFT',
            'uploaded_by' => auth()->id(),
        ]);

        $this->logAudit('GENERATE_DOCUMENT', 'Document', $doc->id, [
            'shipment_id' => $shipment->id,
            'po_number'   => $shipment->po_number,
            'type'        => $type,
            'version'     => $version,
            'detail'      => $type . ' v' . $version . ' dibuat otomatis dari data sistem untuk PO ' . $shipment->po_number,
        ]);

        return redirect()->back()->with('success', $type . ' v' . $version . ' berhasil dibuat dan disimpan sebagai draft.');
    }

    public function archive(Shipment $shipment)
    {
        if ($shipment->status !== 'DELIVERED') {
            return redirect()->back()->withErrors(['error' => 'Hanya shipment berstatus DELIVERED yang dapat diarsipkan.']);
        }

        $shipment->update(['status' => 'ARCHIVED']);

        $this->logStatusChange($shipment->id, 'ARCHIVED', 'Shipment archived.');
        $this->logAudit('ARCHIVE_SHIPMENT', 'Shipment', $shipment->id, [
            'po_number' => $shipment->po_number,
            'detail' => 'Shipment PO ' . $shipment->po_number . ' telah diarsipkan.',
        ]);

        return redirect()->back()->with('success', 'Shipment archived successfully.');
    }

    public function requestDocument(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'document_type' => 'required|string',
            'note' => 'nullable|string',
        ]);

        $message = "Staff Export meminta dokumen '" . $validated['document_type'] . "' untuk PO " . $shipment->po_number;
        if (!empty($validated['note'])) {
            $message .= ". Catatan: " . $validated['note'];
        }

        NotificationService::notify(
            $shipment->sales_id,
            'DOCUMENT_REQUESTED',
            'Permintaan Dokumen Ekspor',
            $message,
            $shipment->id
        );

        $this->logAudit('REQUEST_DOCUMENT', 'Shipment', $shipment->id, [
            'po_number' => $shipment->po_number,
            'document_type' => $validated['document_type'],
            'detail' => 'Staff Export meminta dokumen ' . $validated['document_type'] . ' ke Sales untuk PO ' . $shipment->po_number,
        ]);

        return redirect()->back()->with('success', 'Request dokumen berhasil dikirim ke Sales.');
    }
}
