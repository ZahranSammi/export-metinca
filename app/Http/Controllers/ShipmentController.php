<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentRequest;
use App\Models\Shipment;
use App\Models\ShipmentItem;
use App\Services\NotificationService;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ShipmentController extends Controller
{
    use LogsActivity;

    public function store(Request $request)
    {
        $validated = $request->validate([
            'po_number' => 'required|string|unique:shipments,po_number',
            'customer_id' => 'required|exists:customers,id',
            'incoterms' => 'nullable|string',
            'etd' => 'nullable|date',
            'eta' => 'nullable|date',
            'po_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:25600',
            'description' => 'required|string',
            'qty' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
            'currency' => 'nullable|string|max:3',
        ]);

        $poFilePath = null;
        if ($request->hasFile('po_file')) {
            $poFilePath = $request->file('po_file')->store('po_files', 'public');
        }

        $shipment = Shipment::create([
            'po_number' => $validated['po_number'],
            'customer_id' => $validated['customer_id'],
            'sales_id' => auth()->id(),
            'status' => 'DRAFT',
            'incoterms' => $validated['incoterms'] ?? 'FOB',
            'etd' => $validated['etd'],
            'eta' => $validated['eta'],
            'po_file_path' => $poFilePath,
        ]);

        ShipmentItem::create([
            'shipment_id' => $shipment->id,
            'description' => $validated['description'],
            'qty' => $validated['qty'],
            'unit_price' => $validated['unit_price'],
            'currency' => $validated['currency'] ?? 'USD',
        ]);

        $this->logStatusChange($shipment->id, 'DRAFT', 'Shipment draft created.');
        $this->logAudit('CREATE_SHIPMENT', 'Shipment', $shipment->id, [
            'po_number' => $shipment->po_number,
            'detail' => 'Shipment baru dibuat berdasarkan PO ' . $shipment->po_number,
        ]);

        return redirect()->back()->with('success', 'Shipment draft created successfully.');
    }

    public function update(Request $request, Shipment $shipment)
    {
        // Guard sales can only update their own draft shipments
        if ($shipment->sales_id !== auth()->id() && auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'po_number' => 'required|string|unique:shipments,po_number,' . $shipment->id,
            'customer_id' => 'required|exists:customers,id',
            'incoterms' => 'nullable|string',
            'etd' => 'nullable|date',
            'eta' => 'nullable|date',
            'description' => 'nullable|string',
            'qty' => 'nullable|integer|min:1',
            'unit_price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:3',
        ]);

        $shipment->update([
            'po_number' => $validated['po_number'],
            'customer_id' => $validated['customer_id'],
            'incoterms' => $validated['incoterms'] ?? $shipment->incoterms,
            'etd' => $validated['etd'] ?? $shipment->etd,
            'eta' => $validated['eta'] ?? $shipment->eta,
        ]);

        if (!empty($validated['description'])) {
            $item = $shipment->shipmentItems()->first();
            if ($item) {
                $item->update([
                    'description' => $validated['description'],
                    'qty' => $validated['qty'] ?? $item->qty,
                    'unit_price' => $validated['unit_price'] ?? $item->unit_price,
                    'currency' => $validated['currency'] ?? $item->currency,
                ]);
            } else {
                ShipmentItem::create([
                    'shipment_id' => $shipment->id,
                    'description' => $validated['description'],
                    'qty' => $validated['qty'] ?? 1,
                    'unit_price' => $validated['unit_price'] ?? 0,
                    'currency' => $validated['currency'] ?? 'USD',
                ]);
            }
        }

        $this->logAudit('UPDATE_SHIPMENT', 'Shipment', $shipment->id, [
            'po_number' => $shipment->po_number,
            'detail' => 'Shipment PO ' . $shipment->po_number . ' diperbarui.',
        ]);

        return redirect()->back()->with('success', 'Shipment updated successfully.');
    }

    public function uploadSupportingDocument(Request $request, Shipment $shipment)
    {
        // Sales hanya bisa upload untuk shipment mereka sendiri
        if ($shipment->sales_id !== auth()->id() && auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        $request->validate([
            'document'      => 'required|file|mimes:pdf,jpg,jpeg,png|max:25600',
            'type'          => 'required|string|max:255',
            'request_id'    => 'nullable|exists:document_requests,id',
        ]);

        $file     = $request->file('document');
        $fileName = $file->getClientOriginalName();
        $path     = $file->store('documents', 'public');

        $latestVersion = Document::where('shipment_id', $shipment->id)
            ->where('type', $request->type)
            ->max('version') ?? 0;

        $doc = Document::create([
            'shipment_id' => $shipment->id,
            'type'        => $request->type,
            'version'     => $latestVersion + 1,
            'file_name'   => $fileName,
            'file_path'   => $path,
            'status'      => 'DRAFT',
            'uploaded_by' => auth()->id(),
        ]);

        // Tandai document request sebagai FULFILLED jika ada
        if ($request->filled('request_id')) {
            $docRequest = DocumentRequest::find($request->request_id);
            if ($docRequest && $docRequest->shipment_id === $shipment->id) {
                $docRequest->update([
                    'status'       => 'FULFILLED',
                    'fulfilled_at' => now(),
                ]);
            }
        }

        $this->logAudit('UPLOAD_SUPPORTING_DOCUMENT', 'Document', $doc->id, [
            'shipment_id' => $shipment->id,
            'po_number'   => $shipment->po_number,
            'type'        => $doc->type,
            'version'     => $doc->version,
            'detail'      => 'Sales mengunggah dokumen pendukung "' . $doc->type . '" v' . $doc->version . ' untuk PO ' . $shipment->po_number,
        ]);

        NotificationService::notifyRole(
            'export_staff',
            'SUPPORTING_DOCUMENT_UPLOADED',
            'Dokumen Pendukung Diunggah oleh Sales',
            'Sales mengunggah dokumen "' . $doc->type . '" untuk PO ' . $shipment->po_number,
            $shipment->id
        );

        return redirect()->back()->with('success', 'Dokumen pendukung berhasil diunggah.');
    }

    public function submitToExport(Shipment $shipment)
    {
        if ($shipment->sales_id !== auth()->id() && auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized.');
        }

        if ($shipment->status !== 'DRAFT') {
            return redirect()->back()->withErrors(['status' => 'Only DRAFT shipments can be submitted.']);
        }

        $shipment->update(['status' => 'SENT_TO_EXPORT']);

        $this->logStatusChange($shipment->id, 'SENT_TO_EXPORT', 'Submitted to export staff.');
        $this->logAudit('SUBMIT_SHIPMENT_TO_EXPORT', 'Shipment', $shipment->id, [
            'po_number' => $shipment->po_number,
            'detail' => 'Shipment PO ' . $shipment->po_number . ' dikirim ke staff ekspor.',
        ]);

        NotificationService::notifyRole(
            'export_staff',
            'SHIPMENT_SUBMITTED',
            'Shipment Baru Menunggu Tindakan',
            'Shipment PO ' . $shipment->po_number . ' telah dikirim ke Export Staff.',
            $shipment->id
        );

        return redirect()->back()->with('success', 'Shipment submitted to export staff.');
    }
}
