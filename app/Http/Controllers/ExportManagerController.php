<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Document;
use App\Models\DocumentReview;
use App\Models\Shipment;
use App\Services\NotificationService;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportManagerController extends Controller
{
    use LogsActivity;

    public function approveDocument(Document $document)
    {
        $shipment = $document->shipment;

        $document->update(['status' => 'APPROVED']);

        DocumentReview::create([
            'document_id' => $document->id,
            'reviewer_id' => auth()->id(),
            'action' => 'APPROVED',
            'comment' => 'Approved by manager.',
            'reviewed_at' => now(),
        ]);

        $this->logAudit('APPROVE_DOCUMENT', 'Document', $document->id, [
            'shipment_id' => $shipment->id,
            'po_number' => $shipment->po_number,
            'type' => $document->type,
            'version' => $document->version,
            'detail' => 'Dokumen ' . $document->type . ' disetujui untuk PO ' . $shipment->po_number,
        ]);

        // Check if all docs are approved
        $totalDocs = $shipment->documents()->count();
        $approvedDocs = $shipment->documents()->where('status', 'APPROVED')->count();

        if ($totalDocs > 0 && $totalDocs === $approvedDocs) {
            $shipment->update(['status' => 'APPROVED']);
            $this->logStatusChange($shipment->id, 'APPROVED', 'All documents approved. Waiting for payment.');
            
            NotificationService::notifyRole(
                'finance',
                'SHIPMENT_APPROVED',
                'Shipment Siap Diproses Finance',
                'Shipment PO ' . $shipment->po_number . ' telah disetujui, silakan masukkan detail tagihan.',
                $shipment->id
            );

            NotificationService::notify($shipment->sales_id, 'SHIPMENT_APPROVED', 'Shipment Disetujui', 'Shipment PO ' . $shipment->po_number . ' telah disetujui oleh Manager.', $shipment->id);
        }

        NotificationService::notifyRole(
            'export_staff',
            'DOCUMENT_APPROVED',
            'Dokumen Disetujui',
            'Dokumen ' . $document->type . ' v' . $document->version . ' untuk PO ' . $shipment->po_number . ' disetujui.',
            $shipment->id
        );

        return redirect()->back()->with('success', 'Document approved.');
    }

    public function reviseDocument(Request $request, Document $document)
    {
        $request->validate([
            'comment' => 'required|string|min:3',
        ]);

        $shipment = $document->shipment;

        $document->update(['status' => 'REVISED']);

        DocumentReview::create([
            'document_id' => $document->id,
            'reviewer_id' => auth()->id(),
            'action' => 'REVISED',
            'comment' => $request->comment,
            'reviewed_at' => now(),
        ]);

        // Rollback shipment status to IN_PROGRESS
        if ($shipment->status !== 'IN_PROGRESS') {
            $shipment->update(['status' => 'IN_PROGRESS']);
            $this->logStatusChange($shipment->id, 'IN_PROGRESS', 'Shipment returned to IN_PROGRESS due to document revision.');
        }

        $this->logAudit('REVISE_DOCUMENT', 'Document', $document->id, [
            'shipment_id' => $shipment->id,
            'po_number' => $shipment->po_number,
            'type' => $document->type,
            'version' => $document->version,
            'comment' => $request->comment,
            'detail' => 'Revisi dokumen ' . $document->type . ' diajukan untuk PO ' . $shipment->po_number,
        ]);

        NotificationService::notifyRole(
            'export_staff',
            'DOCUMENT_REVISED',
            'Dokumen Butuh Revisi',
            'Dokumen ' . $document->type . ' v' . $document->version . ' untuk PO ' . $shipment->po_number . ' butuh revisi: ' . $request->comment,
            $shipment->id
        );

        return redirect()->back()->with('success', 'Revision requested.');
    }

    private function buildReportQuery(Request $request)
    {
        $query = Shipment::with(['customer', 'sales', 'shipmentItems', 'statusLogs']);

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('country')) {
            $query->whereHas('customer', function($q) use ($request) {
                $q->where('country', 'like', '%' . $request->country . '%');
            });
        }

        return $query;
    }

    public function report(Request $request)
    {
        $shipments = $this->buildReportQuery($request)->latest()->get();

        // Calculate summary
        $totalShipments = $shipments->count();
        $statusCounts = $shipments->groupBy('status')->map->count();
        
        $totalValue = $shipments->reduce(function($carry, $shipment) {
            $shipmentTotal = $shipment->shipmentItems->sum(function($item) {
                return $item->qty * $item->unit_price;
            });
            return $carry + $shipmentTotal;
        }, 0);

        // Hitung rata-rata leadtime (hari dari DRAFT ke DELIVERED) — FR-MGR-06
        $leadtimes = $shipments
            ->filter(fn($s) => in_array($s->status, ['DELIVERED', 'ARCHIVED']))
            ->map(function($s) {
                $deliveredLog = $s->statusLogs->where('status', 'DELIVERED')->sortByDesc('changed_at')->first();
                if (!$deliveredLog) return null;
                return $s->created_at->diffInDays(\Carbon\Carbon::parse($deliveredLog->changed_at));
            })
            ->filter()
            ->values();

        $avgLeadtime = $leadtimes->count() > 0 ? round($leadtimes->avg(), 1) : null;

        return Inertia::render('Reports', [
            'shipments' => $shipments,
            'customers' => Customer::all(),
            'filters' => $request->only(['start_date', 'end_date', 'customer_id', 'status', 'country']),
            'summary' => [
                'total_shipments' => $totalShipments,
                'status_counts'   => $statusCounts,
                'total_value'     => $totalValue,
                'avg_leadtime'    => $avgLeadtime,
                'delivered_count' => $leadtimes->count(),
            ]
        ]);
    }

    public function exportReport(Request $request)
    {
        $shipments = $this->buildReportQuery($request)->latest()->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Laporan Ekspor');

        $headers = ['PO Number', 'Customer', 'Negara Tujuan', 'Incoterms', 'Sales', 'Status', 'ETD', 'ETA', 'Nilai Kontrak (Est.)', 'Tanggal Dibuat'];
        $sheet->fromArray($headers, null, 'A1');

        $headerStyle = [
            'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E3A5F']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ];
        $sheet->getStyle('A1:J1')->applyFromArray($headerStyle);

        $row = 2;
        foreach ($shipments as $shipment) {
            $value = $shipment->shipmentItems->sum(fn($item) => $item->qty * $item->unit_price);
            $sheet->fromArray([
                $shipment->po_number,
                $shipment->customer->name ?? '-',
                $shipment->customer->country ?? '-',
                $shipment->incoterms,
                $shipment->sales->name ?? '-',
                $shipment->status,
                $shipment->etd ?? '-',
                $shipment->eta ?? '-',
                $value,
                $shipment->created_at->format('Y-m-d H:i:s'),
            ], null, "A{$row}");
            $row++;
        }

        foreach (range('A', 'J') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $filename = 'laporan_ekspor_' . date('Ymd_His') . '.xlsx';

        $callback = function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        };

        return new StreamedResponse($callback, 200, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Pragma'              => 'no-cache',
            'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0',
            'Expires'             => '0',
        ]);
    }
}
