<?php

namespace App\Http\Controllers;

use App\Models\Payment;
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

class FinanceController extends Controller
{
    use LogsActivity;

    public function storeInvoice(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'vendor_name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'currency' => 'nullable|string|max:3',
            'invoice' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:25600',
        ]);

        $invoicePath = null;
        if ($request->hasFile('invoice')) {
            $invoicePath = $request->file('invoice')->store('invoices', 'public');
        }

        $payment = Payment::create([
            'shipment_id' => $shipment->id,
            'vendor_name' => $validated['vendor_name'],
            'amount' => $validated['amount'],
            'currency' => $validated['currency'] ?? 'IDR',
            'status' => 'UNPAID',
            'invoice_path' => $invoicePath,
        ]);

        $this->logAudit('CREATE_INVOICE', 'Payment', $payment->id, [
            'shipment_id' => $shipment->id,
            'po_number' => $shipment->po_number,
            'vendor_name' => $payment->vendor_name,
            'amount' => $payment->amount,
            'detail' => 'Tagihan vendor ' . $payment->vendor_name . ' senilai ' . $payment->currency . ' ' . number_format($payment->amount) . ' dibuat untuk PO ' . $shipment->po_number,
        ]);

        NotificationService::notifyRole(
            'export_staff',
            'INVOICE_CREATED',
            'Tagihan Baru Diinput',
            'Tagihan baru untuk vendor ' . $payment->vendor_name . ' telah diinput untuk PO ' . $shipment->po_number,
            $shipment->id
        );

        return redirect()->back()->with('success', 'Invoice stored successfully.');
    }

    public function uploadProof(Request $request, Payment $payment)
    {
        $request->validate([
            'proof' => 'required|file|mimes:pdf,jpg,jpeg,png|max:25600',
        ]);

        $path = $request->file('proof')->store('proofs', 'public');
        $payment->update([
            'proof_path' => $path,
        ]);

        $this->logAudit('UPLOAD_PAYMENT_PROOF', 'Payment', $payment->id, [
            'shipment_id' => $payment->shipment_id,
            'po_number' => $payment->shipment->po_number,
            'vendor_name' => $payment->vendor_name,
            'detail' => 'Bukti pembayaran diunggah untuk ' . $payment->vendor_name . ' (PO ' . $payment->shipment->po_number . ')',
        ]);

        return redirect()->back()->with('success', 'Payment proof uploaded successfully.');
    }

    public function validatePayment(Request $request, Payment $payment, string $status)
    {
        $status = strtoupper($status);
        if (!in_array($status, ['PAID', 'PARTIAL', 'HOLD'])) {
            abort(400, 'Invalid status.');
        }

        if (in_array($status, ['HOLD', 'PARTIAL'])) {
            $request->validate([
                'comment' => 'required|string|min:3',
            ]);
        }

        $shipment = $payment->shipment;

        $payment->update([
            'status' => $status,
            'validated_by' => auth()->id(),
            'comment' => $request->comment ?? $payment->comment,
        ]);

        $this->logAudit('VALIDATE_PAYMENT', 'Payment', $payment->id, [
            'shipment_id' => $shipment->id,
            'po_number' => $shipment->po_number,
            'vendor_name' => $payment->vendor_name,
            'status' => $status,
            'comment' => $request->comment ?? '',
            'detail' => 'Status pembayaran vendor ' . $payment->vendor_name . ' diubah ke ' . $status . ' (PO ' . $shipment->po_number . ')',
        ]);

        if ($status === 'PAID') {
            // Check if all payments for this shipment are paid
            $totalPayments = $shipment->payments()->count();
            $paidPayments = $shipment->payments()->where('status', 'PAID')->count();

            if ($totalPayments > 0 && $totalPayments === $paidPayments) {
                $shipment->update(['status' => 'PAYMENT_VERIFIED']);
                $this->logStatusChange($shipment->id, 'PAYMENT_VERIFIED', 'All payments validated as PAID.');

                NotificationService::notifyRole(
                    'export_staff',
                    'SHIPMENT_PAYMENT_VERIFIED',
                    'Pembayaran Lunas',
                    'Semua tagihan pembayaran untuk PO ' . $shipment->po_number . ' telah lunas/PAID.',
                    $shipment->id
                );
            }

            NotificationService::notifyRole(
                'export_staff',
                'PAYMENT_PAID',
                'Pembayaran Disetujui',
                'Pembayaran untuk tagihan ' . $payment->vendor_name . ' (PO ' . $shipment->po_number . ') telah disetujui PAID.',
                $shipment->id
            );
        } else if ($status === 'HOLD') {
            NotificationService::notifyRole(
                'export_staff',
                'PAYMENT_HOLD',
                'Pembayaran Ditunda (HOLD)',
                'Pembayaran untuk tagihan ' . $payment->vendor_name . ' (PO ' . $shipment->po_number . ') ditunda: ' . $request->comment,
                $shipment->id
            );
        } else if ($status === 'PARTIAL') {
            NotificationService::notifyRole(
                'export_staff',
                'PAYMENT_PARTIAL',
                'Pembayaran Sebagian (PARTIAL)',
                'Pembayaran untuk tagihan ' . $payment->vendor_name . ' (PO ' . $shipment->po_number . ') baru sebagian: ' . $request->comment,
                $shipment->id
            );
        }

        return redirect()->back()->with('success', 'Payment status updated to ' . $status);
    }

    public function recap(Request $request)
    {
        $query = Payment::with(['shipment.customer', 'validator']);

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        if ($request->filled('vendor_name')) {
            $query->where('vendor_name', 'like', '%' . $request->vendor_name . '%');
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $payments = $query->latest()->get();

        if ($request->wantsJson()) {
            return response()->json([
                'payments' => $payments,
                'summary' => [
                    'total_paid' => $payments->where('status', 'PAID')->sum('amount'),
                    'total_unpaid' => $payments->where('status', 'UNPAID')->sum('amount'),
                    'total_hold' => $payments->where('status', 'HOLD')->sum('amount'),
                ]
            ]);
        }

        return Inertia::render('Finance/Recap', [
            'payments' => $payments,
            'filters' => $request->only(['start_date', 'end_date', 'vendor_name', 'status']),
            'summary' => [
                'total_paid' => $payments->where('status', 'PAID')->sum('amount'),
                'total_unpaid' => $payments->where('status', 'UNPAID')->sum('amount'),
                'total_hold' => $payments->where('status', 'HOLD')->sum('amount'),
            ]
        ]);
    }

    public function exportExcel(Request $request)
    {
        $query = Payment::with(['shipment.customer', 'validator']);

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        if ($request->filled('vendor_name')) {
            $query->where('vendor_name', 'like', '%' . $request->vendor_name . '%');
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $payments = $query->latest()->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Rekap Pembayaran');

        $headers = ['ID', 'PO Number', 'Customer', 'Vendor Name', 'Amount', 'Currency', 'Status', 'Validated By', 'Validation Notes', 'Created At'];
        $sheet->fromArray($headers, null, 'A1');

        $headerStyle = [
            'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E3A5F']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
        ];
        $sheet->getStyle('A1:J1')->applyFromArray($headerStyle);

        $row = 2;
        foreach ($payments as $payment) {
            $sheet->fromArray([
                $payment->id,
                $payment->shipment->po_number,
                $payment->shipment->customer->name ?? '-',
                $payment->vendor_name,
                $payment->amount,
                $payment->currency,
                $payment->status,
                $payment->validator->name ?? '-',
                $payment->comment ?? '-',
                $payment->created_at->format('Y-m-d H:i:s'),
            ], null, "A{$row}");
            $row++;
        }

        foreach (range('A', 'J') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $filename = 'rekap_pembayaran_' . date('Ymd_His') . '.xlsx';

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
