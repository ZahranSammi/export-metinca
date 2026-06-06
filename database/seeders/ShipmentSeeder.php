<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\Document;
use App\Models\Payment;
use App\Models\Shipment;
use App\Models\ShipmentItem;
use App\Models\ShipmentStatusLog;
use Illuminate\Database\Seeder;

class ShipmentSeeder extends Seeder
{
    public function run(): void
    {
        // 1. PO-2026-001 (ARCHIVED)
        $s1 = Shipment::create([
            'po_number' => 'PO-2026-001',
            'customer_id' => 1,
            'sales_id' => 2,
            'status' => 'ARCHIVED',
            'etd' => '2026-05-10',
            'eta' => '2026-05-15',
            'incoterms' => 'FOB',
            'port_loading' => 'Tanjung Priok, Jakarta',
            'port_discharge' => 'Port of Singapore',
            'created_at' => '2026-05-01 10:00:00',
        ]);

        ShipmentItem::create([
            'shipment_id' => $s1->id,
            'description' => 'Steel Pipe 3-Inch',
            'hs_code' => '7306.30.00',
            'qty' => 500,
            'unit_price' => 120.00,
            'currency' => 'USD',
        ]);

        Document::create([
            'shipment_id' => $s1->id,
            'type' => 'Commercial Invoice',
            'version' => 1,
            'file_name' => 'invoice_po2026001.pdf',
            'file_path' => 'documents/invoice_po2026001.pdf',
            'status' => 'APPROVED',
            'uploaded_by' => 3, // export_staff
            'created_at' => '2026-05-02 11:00:00',
        ]);

        Document::create([
            'shipment_id' => $s1->id,
            'type' => 'Packing List',
            'version' => 1,
            'file_name' => 'packinglist_po2026001.pdf',
            'file_path' => 'documents/packinglist_po2026001.pdf',
            'status' => 'APPROVED',
            'uploaded_by' => 3, // export_staff
            'created_at' => '2026-05-02 11:05:00',
        ]);

        Document::create([
            'shipment_id' => $s1->id,
            'type' => 'Bill of Lading',
            'version' => 1,
            'file_name' => 'bl_po2026001.pdf',
            'file_path' => 'documents/bl_po2026001.pdf',
            'status' => 'APPROVED',
            'uploaded_by' => 3, // export_staff
            'created_at' => '2026-05-06 09:00:00',
        ]);

        Document::create([
            'shipment_id' => $s1->id,
            'type' => 'PEB Final',
            'version' => 1,
            'file_name' => 'peb_po2026001.pdf',
            'file_path' => 'documents/peb_po2026001.pdf',
            'status' => 'APPROVED',
            'uploaded_by' => 6, // forwarder
            'created_at' => '2026-05-07 14:00:00',
        ]);

        Payment::create([
            'shipment_id' => $s1->id,
            'vendor_name' => 'Fast Forwarding Ltd',
            'amount' => 15000000.00,
            'currency' => 'IDR',
            'status' => 'PAID',
            'proof_path' => 'transfer_proof_201.pdf',
            'invoice_path' => 'invoice_forwarder_201.pdf',
            'validated_by' => 5, // finance
        ]);

        // 2. PO-2026-002 (IN_CUSTOMS)
        $s2 = Shipment::create([
            'po_number' => 'PO-2026-002',
            'customer_id' => 2,
            'sales_id' => 2,
            'status' => 'IN_CUSTOMS',
            'etd' => '2026-06-05',
            'eta' => '2026-06-12',
            'incoterms' => 'CIF',
            'port_loading' => 'Tanjung Perak, Surabaya',
            'port_discharge' => 'Port of Tokyo',
            'created_at' => '2026-05-20 08:30:00',
        ]);

        ShipmentItem::create([
            'shipment_id' => $s2->id,
            'description' => 'Aluminium Plate 10mm',
            'hs_code' => '7606.12.00',
            'qty' => 200,
            'unit_price' => 340.00,
            'currency' => 'USD',
        ]);

        Document::create([
            'shipment_id' => $s2->id,
            'type' => 'Commercial Invoice',
            'version' => 2,
            'file_name' => 'invoice_po2026002_v2.pdf',
            'file_path' => 'documents/invoice_po2026002_v2.pdf',
            'status' => 'APPROVED',
            'uploaded_by' => 3,
            'created_at' => '2026-05-25 10:00:00',
        ]);

        Document::create([
            'shipment_id' => $s2->id,
            'type' => 'Packing List',
            'version' => 1,
            'file_name' => 'packinglist_po2026002.pdf',
            'file_path' => 'documents/packinglist_po2026002.pdf',
            'status' => 'APPROVED',
            'uploaded_by' => 3,
            'created_at' => '2026-05-22 10:05:00',
        ]);

        Payment::create([
            'shipment_id' => $s2->id,
            'vendor_name' => 'Tokyo Shipping Agent',
            'amount' => 42000000.00,
            'currency' => 'IDR',
            'status' => 'PAID',
            'proof_path' => 'transfer_proof_202.pdf',
            'invoice_path' => 'invoice_forwarder_202.pdf',
            'validated_by' => 5,
        ]);

        // 3. PO-2026-003 (APPROVED)
        $s3 = Shipment::create([
            'po_number' => 'PO-2026-003',
            'customer_id' => 1,
            'sales_id' => 2,
            'status' => 'APPROVED',
            'etd' => '2026-06-15',
            'eta' => '2026-06-20',
            'incoterms' => 'FOB',
            'port_loading' => 'Tanjung Priok, Jakarta',
            'port_discharge' => 'Port of Singapore',
            'created_at' => '2026-05-25 14:15:00',
        ]);

        ShipmentItem::create([
            'shipment_id' => $s3->id,
            'description' => 'Brass Fitting B-Type',
            'hs_code' => '7412.20.00',
            'qty' => 1000,
            'unit_price' => 15.50,
            'currency' => 'USD',
        ]);

        Document::create([
            'shipment_id' => $s3->id,
            'type' => 'Commercial Invoice',
            'version' => 1,
            'file_name' => 'invoice_po2026003.pdf',
            'file_path' => 'documents/invoice_po2026003.pdf',
            'status' => 'APPROVED',
            'uploaded_by' => 3,
            'created_at' => '2026-05-28 16:00:00',
        ]);

        Document::create([
            'shipment_id' => $s3->id,
            'type' => 'Packing List',
            'version' => 1,
            'file_name' => 'packinglist_po2026003.pdf',
            'file_path' => 'documents/packinglist_po2026003.pdf',
            'status' => 'APPROVED',
            'uploaded_by' => 3,
            'created_at' => '2026-05-28 16:05:00',
        ]);

        Payment::create([
            'shipment_id' => $s3->id,
            'vendor_name' => 'Asia Logistics',
            'amount' => 12500000.00,
            'currency' => 'IDR',
            'status' => 'UNPAID',
            'invoice_path' => 'invoice_forwarder_203.pdf',
        ]);

        // 4. PO-2026-004 (IN_REVIEW)
        $s4 = Shipment::create([
            'po_number' => 'PO-2026-004',
            'customer_id' => 2,
            'sales_id' => 2,
            'status' => 'IN_REVIEW',
            'etd' => '2026-06-25',
            'eta' => '2026-07-02',
            'incoterms' => 'CIF',
            'port_loading' => 'Tanjung Priok, Jakarta',
            'port_discharge' => 'Port of Tokyo',
            'created_at' => '2026-05-28 09:00:00',
        ]);

        ShipmentItem::create([
            'shipment_id' => $s4->id,
            'description' => 'Stainless Steel Flange',
            'hs_code' => '7307.21.00',
            'qty' => 350,
            'unit_price' => 65.00,
            'currency' => 'USD',
        ]);

        Document::create([
            'shipment_id' => $s4->id,
            'type' => 'Commercial Invoice',
            'version' => 1,
            'file_name' => 'invoice_po2026004.pdf',
            'file_path' => 'documents/invoice_po2026004.pdf',
            'status' => 'IN_REVIEW',
            'uploaded_by' => 3,
            'created_at' => '2026-06-01 10:00:00',
        ]);

        Document::create([
            'shipment_id' => $s4->id,
            'type' => 'Packing List',
            'version' => 1,
            'file_name' => 'packinglist_po2026004.pdf',
            'file_path' => 'documents/packinglist_po2026004.pdf',
            'status' => 'IN_REVIEW',
            'uploaded_by' => 3,
            'created_at' => '2026-06-01 10:02:00',
        ]);

        // Audit Logs Seed
        AuditLog::create(['user_id' => 1, 'action' => 'SYSTEM_STARTUP', 'payload' => ['detail' => 'Sistem manajemen dokumen export diinisialisasi.']]);
        AuditLog::create(['user_id' => 2, 'action' => 'CREATE_SHIPMENT', 'payload' => ['detail' => 'Shipment baru dibuat berdasarkan PO-2026-001.']]);
        AuditLog::create(['user_id' => 3, 'action' => 'UPLOAD_DOCUMENT', 'payload' => ['detail' => 'Commercial Invoice v1 diunggah untuk PO-2026-001.']]);
        AuditLog::create(['user_id' => 4, 'action' => 'APPROVE_DOCUMENT', 'payload' => ['detail' => 'Commercial Invoice disetujui untuk PO-2026-001.']]);
        AuditLog::create(['user_id' => 5, 'action' => 'VALIDATE_PAYMENT', 'payload' => ['detail' => 'Pembayaran tagihan Asia Logistics divalidasi lunas.']]);
    }
}
