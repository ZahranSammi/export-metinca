# Product Requirements Document (PRD)
## Sistem Manajemen Dokumen Export Berbasis Web

| Field | Value |
|---|---|
| **Versi** | 1.2 (Draft) |
| **Tanggal** | 3 Juni 2026 |
| **Status** | Draft for Review |
| **Penulis** | Zahran |
| **Stack** | Laravel 12 + React + MySQL (Cloud) |

> **Changelog v1.0 → v1.1:** Disinkronkan dengan *Use Case Diagram Usulan – Sistem Ekspor*. Perubahan utama: (a) klarifikasi makna "Membuat Dokumen Ekspor" agar tidak bentrok dengan batasan no-auto-generate (§2.3); (b) penambahan FR untuk *Verifikasi Kelengkapan Dokumen* dan pemisahan *Upload Dokumen Pendukung* di modul Staff Export (§3.3); (c) penambahan Lampiran B — Traceability Matrix (Use Case → FR).
>
> **Changelog v1.1 → v1.2:** Auto-generate dokumen dari template **dipromosikan menjadi in-scope v1.0** sesuai keputusan stakeholder. Perubahan utama: (a) revisi makna "Membuat Dokumen Ekspor" (§2.3) — kini mencakup generate otomatis **dan** upload manual; (b) penambahan FR-STA-12 (generate dokumen dari template); (c) butir auto-generate dihapus dari Out of Scope (§7).

---

## 1. Pendahuluan

### 1.1 Latar Belakang
Proses ekspor melibatkan banyak pihak (sales, staff operasional, manajemen, finance, forwarder) dan banyak dokumen (Commercial Invoice, Packing List, B/L, COO, PEB, dll). Saat ini proses umumnya berjalan terpisah via email, WhatsApp, dan folder lokal — menyebabkan dokumen tercecer, status pesanan tidak terlacak, dan koordinasi lintas divisi lambat.

### 1.2 Tujuan Produk
Membangun sistem terpusat berbasis web untuk:
- Menstandarisasi alur pengelolaan dokumen ekspor end-to-end (dari PO sampai pengiriman).
- Memberikan visibilitas status real-time ke semua aktor.
- Mendigitalisasi arsip dokumen agar mudah dicari dan diaudit.

### 1.3 Ruang Lingkup
**In-scope (v1.0):** manajemen user multi-role, upload & versioning dokumen, approval workflow, tracking status, arsip, notifikasi, reporting dasar.
**Out-of-scope (v1.0):** lihat Bagian 7.

### 1.4 Definisi & Istilah
- **PO**: Purchasing Order dari customer.
- **PEB**: Pemberitahuan Ekspor Barang.
- **COO/SKA**: Certificate of Origin / Surat Keterangan Asal.
- **B/L**: Bill of Lading (laut) / AWB: Air Waybill (udara).
- **Forwarder**: tim internal perusahaan yang mengurus pengiriman & kepabeanan.

---

## 2. Gambaran Umum Produk

### 2.1 Deskripsi
Aplikasi web multi-role yang mengelola siklus hidup dokumen ekspor: penerimaan PO → pembuatan dokumen → approval → pengiriman ke forwarder → pengurusan kepabeanan → arsip. Setiap aktor punya dashboard dan hak akses berbeda sesuai role.

### 2.2 Karakteristik Pengguna (Aktor)

| Aktor | Tanggung Jawab Utama | Frekuensi Akses |
|---|---|---|
| **Sales** | Input PO & data customer, monitor status | Harian |
| **Staff Export** | Olah dokumen export, koordinasi ke forwarder, arsip | Harian (heavy) |
| **Manager Export** | Approval/revisi dokumen, monitor & laporan | Harian |
| **Finance** | Validasi pembayaran ke vendor/forwarder, rekap | Harian |
| **Forwarder** | Eksekusi pengiriman, dokumen bea cukai, update status | Harian |

> **Catatan:** Forwarder = karyawan internal. Bukan pihak ketiga. Akses tetap dibatasi by-role.

### 2.3 Asumsi & Batasan
- Semua user adalah karyawan internal perusahaan.
- Setiap PO menghasilkan **1 transaksi ekspor (Shipment)** sebagai unit tracking utama.
- **Makna "Membuat Dokumen Ekspor" (revisi v1.2):** aktivitas "membuat dokumen ekspor" oleh Staff Export mencakup **dua jalur**: (a) **generate otomatis** dokumen baku (Commercial Invoice, Packing List) dari template berbasis data shipment, dan (b) **menyiapkan, melengkapi metadata, dan meng-upload** dokumen yang dibuat di luar sistem. Hasil generate disimpan sebagai dokumen `DRAFT` yang mengikuti alur approval & versioning yang sama dengan dokumen upload (lihat FR-STA-12).
- Bahasa UI: Bahasa Indonesia.
- Browser support: Chrome, Edge, Firefox (versi 2 tahun terakhir).

---

## 3. Functional Requirements

### 3.1 Modul Autentikasi & Manajemen Akses (Admin)
- **FR-AUTH-01** Login dengan email + password, session-based (Laravel Sanctum).
- **FR-AUTH-02** Role-Based Access Control (RBAC) untuk 5 role di atas.
- **FR-AUTH-03** Reset password via email.
- **FR-AUTH-04** Admin dapat CRUD user, assign role, aktif/nonaktifkan akun.
- **FR-AUTH-05** Audit log untuk setiap login, perubahan data kritis, dan approval.

### 3.2 Modul Sales
- **FR-SAL-01** Upload file PO dari customer (PDF/image). *(UC: Menerima PO Customer)*
- **FR-SAL-02** Input/edit data customer (nama, alamat, negara tujuan, kontak, NPWP/Tax ID). *(UC: Input Data Customer)*
- **FR-SAL-03** Input data pesanan ekspor (nomor PO, tanggal, daftar barang, qty, harga, mata uang, Incoterms, ETD/ETA). *(UC: Input Data Pesanan Ekspor)*
- **FR-SAL-04** Submit pesanan → status berubah menjadi `SENT_TO_EXPORT`, notifikasi otomatis ke Staff Export. *(UC: Kirim Data Pesanan ke Staff Export)*
- **FR-SAL-05** Dashboard monitoring status semua pesanan/dokumen milik Sales tersebut. *(UC: Monitoring Status Dokumen)*
- **FR-SAL-06** Upload dokumen pendukung tambahan jika diminta Staff Export (lihat FR-STA-04).

### 3.3 Modul Staff Export
- **FR-STA-01** Inbox/menerima data ekspor (pesanan masuk) dari Sales. *(UC: Menerima Data Ekspor)*
- **FR-STA-02** Input/lengkapi data customer ekspor (HS Code, deskripsi barang, port of loading/discharge). *(UC: Input Data Customer Ekspor)*
- **FR-STA-03** Membuat/menyiapkan dokumen ekspor: meng-upload dokumen utama (Commercial Invoice, Packing List, COO, PEB, Phytosanitary, Fumigation Cert, B/L, dll) dan mengisi metadata-nya. Mendukung multi-file per shipment. *(UC: Membuat Dokumen Ekspor — lihat §2.3)*
- **FR-STA-12** Generate dokumen ekspor baku (Commercial Invoice, Packing List) otomatis dari template PDF berbasis data shipment (customer, item, HS Code, port, Incoterms). Hasil generate tersimpan sebagai dokumen `DRAFT` dengan versioning otomatis dan mengikuti alur approval yang sama. *(UC: Membuat Dokumen Ekspor — §2.3 jalur a)*
- **FR-STA-04** Upload dokumen pendukung tambahan. Termasuk mekanisme **request dokumen ke Sales** (Staff Export menandai dokumen yang dibutuhkan → notifikasi ke Sales → Sales upload via FR-SAL-06). *(UC: Upload Dokumen Pendukung)*
- **FR-STA-05** **Verifikasi kelengkapan dokumen** sebelum diajukan: sistem menyediakan checklist *required document type* per shipment; tombol "Ajukan Approval" disabled jika dokumen wajib belum lengkap. Verifikasi final tetap di tangan Staff Export. *(UC: Verifikasi Kelengkapan Dokumen)*
- **FR-STA-06** Setiap dokumen punya metadata: nama, jenis, versi, tanggal upload, uploader, status (`DRAFT/IN_REVIEW/APPROVED/REVISED`).
- **FR-STA-07** Ajukan dokumen untuk approval → notifikasi ke Manager Export. *(UC: Ajukan Approval Dokumen)*
- **FR-STA-08** Terima feedback revisi dari Manager → revisi → re-submit (versioning otomatis: v1, v2, …).
- **FR-STA-09** Monitoring status dokumen/shipment via dashboard (jumlah shipment per status, deadline mendekat). *(UC: Monitoring Status Dokumen)*
- **FR-STA-10** Kirim dokumen ke Forwarder **hanya jika** dokumen `APPROVED` **dan** pembayaran ke vendor/forwarder sudah `PAID` (Finance validated). Tombol "Kirim ke Forwarder" disabled jika gate belum terpenuhi. *(UC: Kirim Dokumen ke Forwarder)*
- **FR-STA-11** Arsipkan dokumen yang shipment-nya `COMPLETED` (read-only, searchable). *(UC: Mengarsipkan Dokumen Ekspor)*

### 3.4 Modul Manager Export
- **FR-MGR-01** Inbox dokumen yang menunggu review. *(UC: Memeriksa Dokumen Ekspor)*
- **FR-MGR-02** Preview dokumen di browser (PDF/image viewer).
- **FR-MGR-03** Approve dokumen → status `APPROVED`. *(UC: Menyetujui Dokumen Ekspor)*
- **FR-MGR-04** Reject dengan catatan revisi (mandatory comment) → status `REVISED` → kembali ke Staff Export. *(UC: Memberikan Revisi Dokumen)*
- **FR-MGR-05** Monitor semua shipment aktif (filter by status, customer, periode). *(UC: Monitoring Proses Ekspor)*
- **FR-MGR-06** Lihat laporan ekspor (volume per periode, per customer, per negara tujuan, leadtime rata-rata). *(UC: Melihat Laporan Ekspor)*

### 3.5 Modul Finance
> **Posisi di workflow:** Finance berjalan **sebelum** pengiriman dokumen ke Forwarder. Pembayaran ke vendor/forwarder adalah **prasyarat** sebelum Staff Export bisa kirim dokumen.

- **FR-FIN-01** Inbox tagihan/invoice vendor & forwarder per shipment (muncul otomatis setelah dokumen `APPROVED`). *(UC: Memeriksa Invoice dan Pembayaran)*
- **FR-FIN-02** Input/upload invoice vendor/forwarder (jika belum ada di sistem).
- **FR-FIN-03** Upload bukti pembayaran (transfer slip, PDF e-banking). *(UC: Upload Bukti Pembayaran)*
- **FR-FIN-04** Validasi pembayaran (status: `UNPAID/PARTIAL/PAID/HOLD`). *(UC: Validasi Pembayaran Ekspor)*
- **FR-FIN-05** Aksi `HOLD` dengan catatan wajib → notifikasi balik ke Staff Export.
- **FR-FIN-06** Rekap pembayaran (per periode, per vendor, per shipment). *(UC: Membuat Rekap Pembayaran)*
- **FR-FIN-07** Export data pembayaran ke Excel/CSV. *(UC: Export Data Pembayaran)*

### 3.6 Modul Forwarder
- **FR-FWD-01** Inbox dokumen pengiriman dari Staff Export. *(UC: Menerima Dokumen Pengiriman)*
- **FR-FWD-02** Update status pengiriman: `RECEIVED → IN_CUSTOMS → SHIPPED → DELIVERED`. *(UC: Update Status Pengiriman)*
- **FR-FWD-03** Mengurus pengiriman & kepabeanan, termasuk upload dokumen bea cukai (PEB final, NPE, dokumen pabean lainnya). *(UC: Mengurus Pengiriman dan Kepabeanan; Upload Dokumen Bea Cukai)*
- **FR-FWD-04** Konfirmasi pengiriman barang (timestamp + catatan). *(UC: Konfirmasi Pengiriman Barang)*
- **FR-FWD-05** Notifikasi ke Staff Export & Sales setiap update status.

### 3.7 Modul Notifikasi
- **FR-NOT-01** Notifikasi in-app (bell icon) untuk event penting (submit, approve, revise, status change).
- **FR-NOT-02** Notifikasi email opsional (toggle per user).
- **FR-NOT-03** Riwayat notifikasi (read/unread).

### 3.8 Modul Dashboard & Reporting
- **FR-DSH-01** Dashboard ringkasan per role (KPI sederhana, list pending action).
- **FR-DSH-02** Search & filter shipment (by nomor PO, customer, status, tanggal).
- **FR-DSH-03** Export laporan ke Excel/PDF (Manager & Finance).

---

## 4. Workflow / Alur Bisnis

### 4.1 Alur Utama (Happy Path)
```
[Sales]                    [Staff Export]              [Manager Export]
Upload PO     ─────►   Inbox pesanan       ─────►   Review dokumen
Input data            Input data lengkap          ├─► Approve ──┐
                      Upload dokumen              └─► Revisi ──►(balik ke Staff)
                      Verifikasi kelengkapan                      │
                                                                  ▼
                                                          [Finance]
                                                  Proses pembayaran vendor/forwarder
                                                  Upload bukti bayar → status PAID
                                                                  │
[Forwarder]                                                       │
Update status  ◄─────  Kirim ke Forwarder  ◄──────────────────────┘
Upload bea cukai
Konfirmasi delivery ───►  Staff Export arsipkan dokumen
```

> **Catatan:** Dokumen baru bisa dikirim ke Forwarder setelah pembayaran ke vendor/forwarder tervalidasi oleh Finance. Ini menjadi **gate** wajib di workflow.

### 4.2 Alur Revisi Dokumen
1. Manager klik **Revise** + isi catatan (wajib).
2. Status dokumen → `REVISED`. Versi dokumen tetap (belum ada v2).
3. Staff Export terima notifikasi → upload versi baru → versi auto-increment (v2, v3, …).
4. Re-submit → status kembali ke `IN_REVIEW`.
5. Siklus berulang sampai `APPROVED`.

### 4.3 Alur Pembayaran (Pre-Shipment)
1. Setelah dokumen `APPROVED` oleh Manager, sistem trigger task pembayaran ke Finance.
2. Finance terima notifikasi → input/verifikasi invoice vendor/forwarder.
3. Finance proses pembayaran → upload bukti bayar → status `PAID`.
4. Sistem auto-trigger: shipment status berubah ke `PAYMENT_VERIFIED`.
5. Staff Export baru bisa eksekusi **Kirim ke Forwarder** setelah gate ini terpenuhi.
6. Jika pembayaran ditolak/hold oleh Finance → status `PAYMENT_HOLD` + catatan, balik ke Staff Export untuk follow-up.

### 4.4 State Machine Shipment
```
DRAFT → SENT_TO_EXPORT → IN_PROGRESS → IN_REVIEW
   → APPROVED → PAYMENT_VERIFIED → SENT_TO_FORWARDER → IN_CUSTOMS
   → SHIPPED → DELIVERED → ARCHIVED
```

**Gate kritis:** transisi `APPROVED → SENT_TO_FORWARDER` hanya boleh terjadi jika status pembayaran terkait sudah `PAID` (divalidasi Finance).

---

## 5. Non-Functional Requirements

| Kategori | Requirement |
|---|---|
| **Performance** | Response time < 2 detik untuk operasi umum. Upload file sampai 25 MB. |
| **Security** | HTTPS only. Password hashing (bcrypt). RBAC ketat. Rate limiting login. CSRF protection (Laravel default). |
| **Audit** | Setiap perubahan status & approval tercatat (siapa, kapan, aksi apa). |
| **Usability** | UI responsive (desktop primary, tablet secondary). Bahasa Indonesia. |
| **Reliability** | Uptime target 99% (jam kerja). Backup database harian. |
| **Scalability** | Mendukung minimal 50 concurrent users untuk v1.0. |
| **Storage** | File disimpan di cloud storage (S3-compatible) bukan di server aplikasi. |
| **Compliance** | Retensi dokumen ekspor minimal 5 tahun (sesuai regulasi pabean). |

---

## 6. Technical Specifications

### 6.1 Tech Stack
- **Backend:** Laravel 12 (PHP 8.4), Sanctum untuk auth API.
- **Frontend:** React (via Inertia.js atau SPA terpisah dengan REST API — keputusan pending).
- **Database:** MySQL 8.x.
- **Storage:** S3-compatible object storage (untuk file dokumen).
- **Queue:** Laravel Queue (Redis) untuk notifikasi email & processing async.
- **Deployment:** Cloud (AWS / GCP / DigitalOcean — TBD).

### 6.2 High-Level Architecture
```
[React SPA] ──HTTPS──► [Laravel API] ──► [MySQL]
                              │
                              ├──► [S3 Storage] (files)
                              └──► [Redis + Queue Worker] (notifications)
```

### 6.3 Entitas Data Utama (High-Level)
- `users` (id, name, email, password, role_id, is_active)
- `roles` (id, name, permissions)
- `customers` (id, name, country, address, tax_id, contact)
- `shipments` (id, po_number, customer_id, sales_id, status, etd, eta, incoterms, created_at)
- `shipment_items` (id, shipment_id, description, hs_code, qty, unit_price, currency)
- `documents` (id, shipment_id, type, version, file_path, status, uploaded_by, uploaded_at)
- `document_reviews` (id, document_id, reviewer_id, action, comment, reviewed_at)
- `payments` (id, shipment_id, vendor_name, amount, status, proof_path, validated_by)
- `shipment_status_logs` (id, shipment_id, status, changed_by, changed_at, note)
- `notifications` (id, user_id, type, payload, is_read, created_at)
- `audit_logs` (id, user_id, action, entity, entity_id, payload, created_at)

---

## 7. Out of Scope (v1.0)
- Integrasi langsung dengan sistem Bea Cukai (CEISA/INSW).
- E-signature.
- Modul akuntansi penuh (AR/AP).
- Mobile app native.
- Multi-tenant (untuk lebih dari satu perusahaan).
- Integrasi tracking real-time dari shipping line (Maersk, MSC API, dll).

---

## 8. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Scope creep (banyak permintaan fitur tambahan) | Delay rilis | Lock scope v1.0; backlog ditampung untuk v1.1+ |
| Volume upload dokumen besar membebani server | Performance turun | Pakai S3 storage, bukan disk lokal; batasi ukuran file |
| User adopsi rendah (tetap pakai email/WA) | Sistem tidak efektif | Training + dashboard yang clear + notifikasi proaktif |
| Hilangnya dokumen kritis | Risiko legal/audit | Versioning + backup harian + arsip read-only |
| Permission salah konfigurasi (Forwarder lihat data Finance, dll) | Kebocoran data internal | RBAC test case wajib di test plan |

---

## 9. Open Questions
1. Apakah Sales akan menerima notifikasi update status dari Forwarder, atau hanya melalui Staff Export? *(Catatan: FR-FWD-05 saat ini memilih notifikasi ke Sales & Staff Export — perlu konfirmasi final.)*
2. Format penomoran shipment: auto-generate atau manual oleh Sales?
3. Apakah perlu modul **Customer Portal** (customer login lihat status) di roadmap selanjutnya?
4. Multi-currency: berapa kurs disimpan? Manual input atau pakai API kurs (BI/xe.com)?
5. Apakah Manager Export hanya 1 orang (single approver) atau multi-level approval?
6. *Verifikasi Kelengkapan Dokumen* (FR-STA-05): cukup checklist manual oleh Staff, atau perlu validasi sistem yang mem-block submit secara hard?

---

## 10. Success Metrics
- ≥80% pesanan ekspor diproses lewat sistem dalam 3 bulan pasca-launch.
- Rata-rata leadtime approval dokumen turun ≥30% vs proses manual.
- 0 insiden kehilangan dokumen ekspor.
- User satisfaction score (survey internal) ≥ 4/5.

---

## Lampiran A — Daftar Dokumen Ekspor yang Didukung (Indikatif)
Commercial Invoice, Packing List, Bill of Lading (B/L) / Air Waybill (AWB), Certificate of Origin (COO/SKA), Pemberitahuan Ekspor Barang (PEB), Nota Pelayanan Ekspor (NPE), Phytosanitary Certificate, Fumigation Certificate, Insurance Certificate, Shipping Instruction, Letter of Credit (L/C) documents, Bukti Bayar / Payment Proof.

> **Catatan:** Sistem tidak membatasi jenis dokumen; user dapat menambah `document type` baru melalui master data (Admin).

---

## Lampiran B — Traceability Matrix (Use Case Diagram → FR)
Memastikan setiap use case di *Use Case Diagram Usulan* punya FR pendukung di PRD.

### Sales
| Use Case (Diagram) | FR |
|---|---|
| Menerima PO Customer | FR-SAL-01 |
| Input Data Customer | FR-SAL-02 |
| Input Data Pesanan Ekspor | FR-SAL-03 |
| Kirim Data Pesanan ke Staff Export | FR-SAL-04 |
| Monitoring Status Dokumen | FR-SAL-05 |

### Staff Export
| Use Case (Diagram) | FR |
|---|---|
| Menerima Data Ekspor | FR-STA-01 |
| Input Data Customer Ekspor | FR-STA-02 |
| Membuat Dokumen Ekspor | FR-STA-03 (upload) + FR-STA-12 (generate dari template) |
| Upload Dokumen Pendukung | FR-STA-04 |
| Verifikasi Kelengkapan Dokumen | FR-STA-05 |
| Ajukan Approval Dokumen | FR-STA-07 |
| Monitoring Status Dokumen | FR-STA-09 |
| Kirim Dokumen ke Forwarder | FR-STA-10 |
| Mengarsipkan Dokumen Ekspor | FR-STA-11 |

### Manager Export
| Use Case (Diagram) | FR |
|---|---|
| Memeriksa Dokumen Ekspor | FR-MGR-01 |
| Menyetujui Dokumen Ekspor | FR-MGR-03 |
| Memberikan Revisi Dokumen | FR-MGR-04 |
| Monitoring Proses Ekspor | FR-MGR-05 |
| Melihat Laporan Ekspor | FR-MGR-06 |

### Finance
| Use Case (Diagram) | FR |
|---|---|
| Memeriksa Invoice dan Pembayaran | FR-FIN-01 |
| Validasi Pembayaran Ekspor | FR-FIN-04 |
| Upload Bukti Pembayaran | FR-FIN-03 |
| Membuat Rekap Pembayaran | FR-FIN-06 |
| Export Data Pembayaran | FR-FIN-07 |

### Forwarder
| Use Case (Diagram) | FR |
|---|---|
| Menerima Dokumen Pengiriman | FR-FWD-01 |
| Mengurus Pengiriman dan Kepabeanan | FR-FWD-03 |
| Update Status Pengiriman | FR-FWD-02 |
| Upload Dokumen Bea Cukai | FR-FWD-03 |
| Konfirmasi Pengiriman Barang | FR-FWD-04 |

> **Catatan keselarasan:** Use case **Login [Role]** di tiap paket diagram dipetakan ke modul autentikasi global FR-AUTH-01/02 (bukan FR per-role terpisah).