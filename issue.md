# 📋 Issue Planning — Sistem Ekspor PT Metinca

> **Dokumen ini** berisi daftar perbaikan dan pengembangan yang perlu dilakukan agar codebase sesuai dengan **Use Case Diagram Usulan — Sistem Ekspor**.
>
> **Konteks project:** Laravel 12 + React (Inertia.js) + MySQL.
> Semua migration sudah ada, tapi **belum ada Model, Controller, maupun API route** selain auth default. Seluruh logic frontend saat ini berjalan di satu file `Dashboard.jsx` (~1400 baris) dengan **mock data & localStorage** — belum terhubung ke backend sama sekali.

---

## Legenda Prioritas

| Label | Arti |
|-------|------|
| 🔴 P0 | Blocker — harus selesai paling awal, jadi fondasi issue lain |
| 🟠 P1 | Penting — fitur inti dari use case |
| 🟡 P2 | Pendukung — melengkapi user experience |
| 🟢 P3 | Nice-to-have — bisa dikerjakan belakangan |

---

## FASE 1 — Fondasi Backend (🔴 P0)

> Semua issue di fase ini **wajib selesai duluan** karena menjadi fondasi bagi fitur-fitur di fase berikutnya. Tanpa ini, frontend tidak bisa terhubung ke data nyata.

---

### ISSUE-001: Buat Eloquent Model + Relasi untuk Semua Entitas

**Status:** Belum dikerjakan
**Prioritas:** 🔴 P0
**Estimasi:** 2-3 jam

**Konteks:**
Migration sudah ada di `database/migrations/`, tapi satu-satunya Model yang ada baru `app/Models/User.php` dan belum punya relasi. Kita butuh Model untuk semua tabel agar Controller bisa query data.

**Yang harus dikerjakan:**
1. Buat file-file Model baru di `app/Models/`:
   - `Customer.php` → relasi: `hasMany(Shipment::class)`
   - `Shipment.php` → relasi: `belongsTo(Customer)`, `belongsTo(User, 'sales_id')`, `hasMany(ShipmentItem)`, `hasMany(Document)`, `hasMany(Payment)`, `hasMany(ShipmentStatusLog)`
   - `ShipmentItem.php` → relasi: `belongsTo(Shipment)`
   - `Document.php` → relasi: `belongsTo(Shipment)`, `belongsTo(User, 'uploaded_by')`, `hasMany(DocumentReview)`
   - `DocumentReview.php` → relasi: `belongsTo(Document)`, `belongsTo(User, 'reviewer_id')`
   - `Payment.php` → relasi: `belongsTo(Shipment)`, `belongsTo(User, 'validated_by')`
   - `ShipmentStatusLog.php` → relasi: `belongsTo(Shipment)`, `belongsTo(User, 'changed_by')`
   - `AuditLog.php` → relasi: `belongsTo(User)`

2. Tambahkan relasi ke `User.php` yang sudah ada:
   - `hasMany(Shipment::class, 'sales_id')`
   - `hasMany(Document::class, 'uploaded_by')`
   - `hasMany(DocumentReview::class, 'reviewer_id')`

3. Setiap Model wajib punya `$fillable` yang sesuai kolom di migration.

**Referensi file migration:**
- `database/migrations/2026_06_03_000001_create_customers_table.php`
- `database/migrations/2026_06_03_000002_create_shipments_table.php`
- `database/migrations/2026_06_03_000003_create_shipment_items_table.php`
- `database/migrations/2026_06_03_000004_create_documents_table.php`
- `database/migrations/2026_06_03_000005_create_document_reviews_table.php`
- `database/migrations/2026_06_03_000006_create_payments_table.php`
- `database/migrations/2026_06_03_000007_create_shipment_status_logs_table.php`
- `database/migrations/2026_06_03_000008_create_audit_logs_table.php`

**Acceptance Criteria:**
- [ ] Semua 8 Model dibuat dengan `$fillable` lengkap
- [ ] Semua relasi terdefinisi dan bisa dipakai (`$shipment->documents`, `$document->reviews`, dll)
- [ ] `php artisan tinker` bisa `Shipment::with('documents', 'customer')->get()` tanpa error

---

### ISSUE-002: Buat Middleware Role-Based Access Control (RBAC)

**Status:** Belum dikerjakan
**Prioritas:** 🔴 P0
**Estimasi:** 1-2 jam

**Konteks:**
Kolom `role` sudah ada di tabel `users` (lihat migration user baris 20). Tapi belum ada middleware yang membatasi akses berdasarkan role. Saat ini semua user yang login bisa mengakses halaman apa saja.

**Yang harus dikerjakan:**
1. Buat middleware baru `app/Http/Middleware/CheckRole.php`
   - Middleware menerima parameter role, contoh: `role:sales,export_staff`
   - Cek `auth()->user()->role` apakah termasuk dalam daftar role yang diizinkan
   - Jika tidak sesuai → return `403 Forbidden` atau redirect ke dashboard dengan pesan error
2. Daftarkan middleware di `bootstrap/app.php` (Laravel 12 style) dengan alias `role`
3. Contoh penggunaan nanti di route:
   ```php
   Route::middleware(['auth', 'role:sales'])->group(function () {
       // route khusus sales
   });
   ```

**Acceptance Criteria:**
- [ ] User dengan role `sales` tidak bisa mengakses route yang di-protect untuk `finance`
- [ ] Middleware bisa menerima multiple role: `role:export_staff,export_manager`
- [ ] User yang tidak punya akses mendapat response 403

---

### ISSUE-003: Jalankan Migration + Perbaiki Seeder dengan Data Lengkap

**Status:** Sebagian ada (seeder user saja)
**Prioritas:** 🔴 P0
**Estimasi:** 2-3 jam

**Konteks:**
Seeder di `database/seeders/DatabaseSeeder.php` saat ini hanya membuat 6 user. Kita perlu menambahkan seeder untuk customers, shipments beserta items, documents, payments, dan status logs agar developer bisa langsung test tanpa input data manual.

**Yang harus dikerjakan:**
1. Buat `database/seeders/CustomerSeeder.php` — minimal 3 customer (Singapore, Japan, Australia)
2. Buat `database/seeders/ShipmentSeeder.php` — minimal 4 shipment dengan status berbeda:
   - 1 shipment status `ARCHIVED` (flow sudah selesai lengkap)
   - 1 shipment status `IN_CUSTOMS` (sedang diproses forwarder)
   - 1 shipment status `APPROVED` + payment `UNPAID` (menunggu finance)
   - 1 shipment status `IN_REVIEW` (menunggu approval manager)
3. Setiap shipment harus punya: items, documents, dan payments (jika applicable)
4. Panggil semua seeder dari `DatabaseSeeder.php`
5. Pastikan `php artisan migrate:fresh --seed` berjalan tanpa error

**Data mock bisa direferensikan dari:** `resources/js/Pages/Dashboard.jsx` baris 5-111 (konstanta `INITIAL_CUSTOMERS`, `INITIAL_SHIPMENTS`, `INITIAL_AUDIT_LOGS`).

**Acceptance Criteria:**
- [ ] `php artisan migrate:fresh --seed` sukses tanpa error
- [ ] Tabel customers terisi minimal 3 data
- [ ] Tabel shipments terisi minimal 4 data dengan variasi status
- [ ] Relasi antar tabel (FK) konsisten dan valid

---

## FASE 2 — Controller & API per Modul Aktor (🟠 P1)

> Setiap issue di fase ini membuat **1 Controller** dengan method CRUD/action sesuai use case aktor. Semua Controller menggunakan Inertia.js (return `Inertia::render(...)` untuk halaman, atau `redirect()->back()` untuk action).

---

### ISSUE-004: Controller & Route — Modul Sales

**Status:** Belum dikerjakan
**Prioritas:** 🟠 P1
**Estimasi:** 3-4 jam
**Depends on:** ISSUE-001, ISSUE-002

**Konteks (Use Case Sales):**
Sales melakukan 5 hal: Menerima PO, Input Data Customer, Input Data Pesanan Ekspor, Kirim ke Staff Export, dan Monitoring Status.

**Yang harus dikerjakan:**
1. Buat `app/Http/Controllers/ShipmentController.php` dengan method:
   - `index()` — tampilkan daftar shipment milik sales yang login (`where('sales_id', auth()->id())`). Return `Inertia::render('Dashboard', [...data])`
   - `store(Request $request)` — validasi dan simpan shipment baru + items ke database. Status awal = `DRAFT`
   - `update(Request $request, Shipment $shipment)` — update data shipment (PO number, customer, items, incoterms, ETD/ETA)
   - `submitToExport(Shipment $shipment)` — ubah status dari `DRAFT` → `SENT_TO_EXPORT`. Validasi: status harus `DRAFT`. Catat ke `shipment_status_logs` dan `audit_logs`

2. Buat `app/Http/Controllers/CustomerController.php` dengan method:
   - `store(Request $request)` — simpan customer baru
   - `update(Request $request, Customer $customer)` — edit data customer

3. Tambahkan route di `routes/web.php`:
   ```php
   Route::middleware(['auth', 'role:sales'])->prefix('sales')->group(function () {
       Route::post('/shipments', [ShipmentController::class, 'store']);
       Route::put('/shipments/{shipment}', [ShipmentController::class, 'update']);
       Route::post('/shipments/{shipment}/submit', [ShipmentController::class, 'submitToExport']);
       Route::post('/customers', [CustomerController::class, 'store']);
       Route::put('/customers/{customer}', [CustomerController::class, 'update']);
   });
   ```

4. Setiap action yang mengubah status wajib:
   - Insert row ke tabel `shipment_status_logs`
   - Insert row ke tabel `audit_logs`

**Acceptance Criteria:**
- [ ] Sales bisa membuat shipment baru (tersimpan di DB, bukan localStorage)
- [ ] Sales bisa submit shipment ke export (status berubah di DB)
- [ ] Sales hanya bisa melihat shipment miliknya sendiri
- [ ] Audit log tercatat untuk setiap aksi

---

### ISSUE-005: Controller & Route — Modul Staff Export

**Status:** Belum dikerjakan
**Prioritas:** 🟠 P1
**Estimasi:** 4-5 jam
**Depends on:** ISSUE-001, ISSUE-002

**Konteks (Use Case Staff Export):**
Staff Export adalah aktor paling sibuk: menerima data ekspor, input data customer ekspor, membuat dokumen, upload dokumen pendukung, verifikasi kelengkapan, ajukan approval, monitoring, kirim ke forwarder, dan arsipkan.

**Yang harus dikerjakan:**
1. Buat `app/Http/Controllers/ExportStaffController.php` dengan method:
   - `inbox()` — tampilkan shipment dengan status `SENT_TO_EXPORT` atau `IN_PROGRESS` atau `REVISED` (butuh tindakan staff)
   - `updateShipmentDetails(Request $request, Shipment $shipment)` — update HS Code, port_loading, port_discharge. Ubah status ke `IN_PROGRESS` jika masih `SENT_TO_EXPORT`
   - `uploadDocument(Request $request, Shipment $shipment)` — upload file dokumen (gunakan `$request->file('document')->store('documents', 'public')`) + simpan ke tabel `documents`. Auto-versioning: cek dokumen dengan type yang sama, version = max(version) + 1
   - `submitForReview(Shipment $shipment)` — ubah status shipment ke `IN_REVIEW`, ubah semua dokumen `DRAFT` jadi `IN_REVIEW`. Validasi: minimal 1 dokumen harus ada
   - `sendToForwarder(Shipment $shipment)` — **GATE LOGIC**: cek semua dokumen `APPROVED` DAN semua payment `PAID`. Jika terpenuhi → status `SENT_TO_FORWARDER`. Jika tidak → return error 422 dengan pesan jelas
   - `archive(Shipment $shipment)` — ubah status ke `ARCHIVED`. Validasi: status harus `DELIVERED`

2. Tambahkan route di `routes/web.php`:
   ```php
   Route::middleware(['auth', 'role:export_staff'])->prefix('export')->group(function () {
       Route::put('/shipments/{shipment}/details', [ExportStaffController::class, 'updateShipmentDetails']);
       Route::post('/shipments/{shipment}/documents', [ExportStaffController::class, 'uploadDocument']);
       Route::post('/shipments/{shipment}/submit-review', [ExportStaffController::class, 'submitForReview']);
       Route::post('/shipments/{shipment}/send-forwarder', [ExportStaffController::class, 'sendToForwarder']);
       Route::post('/shipments/{shipment}/archive', [ExportStaffController::class, 'archive']);
   });
   ```

3. **Upload file penting:**
   - Gunakan `Storage::disk('public')` untuk saat ini (nanti bisa diganti S3)
   - Validasi file: hanya `pdf, jpg, jpeg, png` — max `25MB`
   - Simpan `file_path` (path relatif di storage) dan `file_name` (nama asli file) ke tabel `documents`

**Acceptance Criteria:**
- [ ] Staff bisa upload file dokumen nyata (bukan text input), tersimpan di `storage/app/public/documents/`
- [ ] Versioning otomatis berjalan (upload Commercial Invoice kedua kali → v2)
- [ ] Tombol "Kirim ke Forwarder" hanya berhasil jika semua dokumen approved DAN semua payment PAID
- [ ] Status dan audit log selalu tercatat

---

### ISSUE-006: Controller & Route — Modul Manager Export

**Status:** Belum dikerjakan
**Prioritas:** 🟠 P1
**Estimasi:** 3-4 jam
**Depends on:** ISSUE-001, ISSUE-002

**Konteks (Use Case Manager Export):**
Manager memeriksa dan menyetujui/revisi dokumen, monitoring proses, dan melihat laporan.

**Yang harus dikerjakan:**
1. Buat `app/Http/Controllers/ExportManagerController.php` dengan method:
   - `reviewInbox()` — tampilkan semua shipment yang punya dokumen berstatus `IN_REVIEW`
   - `approveDocument(Document $document)` — ubah status dokumen → `APPROVED`. Insert ke `document_reviews`. Cek apakah **semua** dokumen di shipment tsb sudah `APPROVED` → jika ya, ubah status shipment jadi `APPROVED`
   - `reviseDocument(Request $request, Document $document)` — ubah status dokumen → `REVISED`. **Comment wajib diisi** (`required` validation). Insert ke `document_reviews`. Status shipment kembali ke `IN_PROGRESS`
   - `report(Request $request)` — query shipment dengan filter: periode (tanggal awal-akhir), customer, negara tujuan, status. Return data + summary (jumlah per status, total nilai)

2. Tambahkan route di `routes/web.php`:
   ```php
   Route::middleware(['auth', 'role:export_manager'])->prefix('manager')->group(function () {
       Route::post('/documents/{document}/approve', [ExportManagerController::class, 'approveDocument']);
       Route::post('/documents/{document}/revise', [ExportManagerController::class, 'reviseDocument']);
       Route::get('/reports', [ExportManagerController::class, 'report']);
   });
   ```

**Acceptance Criteria:**
- [ ] Manager bisa approve dokumen — status dokumen & shipment berubah sesuai aturan
- [ ] Manager bisa revisi dokumen — comment wajib diisi, status kembali ke staff
- [ ] Riwayat review tersimpan di tabel `document_reviews`
- [ ] Halaman laporan bisa filter berdasarkan periode dan customer

---

### ISSUE-007: Controller & Route — Modul Finance

**Status:** Belum dikerjakan
**Prioritas:** 🟠 P1
**Estimasi:** 3-4 jam
**Depends on:** ISSUE-001, ISSUE-002

**Konteks (Use Case Finance):**
Finance memeriksa invoice, validasi pembayaran, upload bukti bayar, membuat rekap, dan export data.

**Yang harus dikerjakan:**
1. Buat `app/Http/Controllers/FinanceController.php` dengan method:
   - `inbox()` — tampilkan shipment yang status-nya `APPROVED` (menunggu pembayaran). Include data payments
   - `storeInvoice(Request $request, Shipment $shipment)` — input tagihan vendor baru. Simpan ke tabel `payments` dengan status `UNPAID`
   - `uploadProof(Request $request, Payment $payment)` — upload bukti bayar (file PDF/image). Simpan path ke kolom `proof_path`
   - `validatePayment(Payment $payment, string $status)` — ubah status payment ke `PAID` atau `HOLD`. Jika `HOLD` → comment wajib diisi. Jika semua payment di shipment jadi `PAID` → ubah status shipment ke `PAYMENT_VERIFIED`. Set `validated_by` = user yang login
   - `recap(Request $request)` — rekap pembayaran dengan filter per periode, per vendor, per shipment
   - `exportExcel(Request $request)` — export data rekap ke file CSV/Excel (bisa pakai package `maatwebsite/excel` atau generate CSV manual)

2. Tambahkan route di `routes/web.php`:
   ```php
   Route::middleware(['auth', 'role:finance'])->prefix('finance')->group(function () {
       Route::post('/shipments/{shipment}/invoices', [FinanceController::class, 'storeInvoice']);
       Route::post('/payments/{payment}/upload-proof', [FinanceController::class, 'uploadProof']);
       Route::post('/payments/{payment}/validate/{status}', [FinanceController::class, 'validatePayment']);
       Route::get('/recap', [FinanceController::class, 'recap']);
       Route::get('/export', [FinanceController::class, 'exportExcel']);
   });
   ```

**Gate logic penting:**
Ketika **semua** payment di suatu shipment berstatus `PAID`, maka status shipment otomatis berubah ke `PAYMENT_VERIFIED`. Ini yang membuka gate agar Staff Export bisa klik "Kirim ke Forwarder".

**Acceptance Criteria:**
- [ ] Finance bisa menambah tagihan vendor per shipment
- [ ] Finance bisa upload bukti pembayaran (file tersimpan di storage)
- [ ] Validasi PAID otomatis mengubah status shipment ke `PAYMENT_VERIFIED`
- [ ] Validasi HOLD mengirim catatan kembali ke Staff Export
- [ ] Export data pembayaran ke CSV berfungsi

---

### ISSUE-008: Controller & Route — Modul Forwarder

**Status:** Belum dikerjakan
**Prioritas:** 🟠 P1
**Estimasi:** 2-3 jam
**Depends on:** ISSUE-001, ISSUE-002

**Konteks (Use Case Forwarder):**
Forwarder (karyawan internal) menerima dokumen, mengurus pengiriman & bea cukai, update status, upload dokumen bea cukai, dan konfirmasi pengiriman.

**Yang harus dikerjakan:**
1. Buat `app/Http/Controllers/ForwarderController.php` dengan method:
   - `inbox()` — tampilkan shipment dengan status `SENT_TO_FORWARDER`, `IN_CUSTOMS`, `SHIPPED`
   - `updateStatus(Request $request, Shipment $shipment)` — update status pengiriman. Hanya boleh maju sesuai urutan:
     - `SENT_TO_FORWARDER` → `IN_CUSTOMS`
     - `IN_CUSTOMS` → `SHIPPED`
     - `SHIPPED` → `DELIVERED`
   - Validasi: status baru harus tepat satu langkah setelah status sekarang. Tolak jika loncat.
   - `uploadCustomsDoc(Request $request, Shipment $shipment)` — upload dokumen bea cukai (PEB final, NPE, dll). Simpan ke tabel `documents` dengan `uploaded_by` = forwarder yang login
   - `confirmDelivery(Request $request, Shipment $shipment)` — konfirmasi barang tiba. Wajib isi timestamp dan catatan. Status → `DELIVERED`

2. Tambahkan route di `routes/web.php`:
   ```php
   Route::middleware(['auth', 'role:forwarder'])->prefix('forwarder')->group(function () {
       Route::post('/shipments/{shipment}/update-status', [ForwarderController::class, 'updateStatus']);
       Route::post('/shipments/{shipment}/customs-doc', [ForwarderController::class, 'uploadCustomsDoc']);
       Route::post('/shipments/{shipment}/confirm-delivery', [ForwarderController::class, 'confirmDelivery']);
   });
   ```

**Acceptance Criteria:**
- [ ] Forwarder hanya bisa update status maju satu langkah (tidak bisa loncat)
- [ ] Forwarder bisa upload dokumen bea cukai
- [ ] Konfirmasi delivery menyimpan timestamp + catatan
- [ ] Setiap perubahan status tercatat di `shipment_status_logs`

---

### ISSUE-009: Controller & Route — Modul Admin (User Management)

**Status:** Belum dikerjakan
**Prioritas:** 🟠 P1
**Estimasi:** 2-3 jam
**Depends on:** ISSUE-001, ISSUE-002

**Konteks:**
Use case diagram tidak menampilkan Admin, tapi PRD section 3.1 (FR-AUTH-04) mewajibkan Admin bisa CRUD user dan assign role. Ini penting untuk manajemen akses.

**Yang harus dikerjakan:**
1. Buat `app/Http/Controllers/AdminController.php` dengan method:
   - `userIndex()` — tampilkan semua user dengan role masing-masing
   - `userStore(Request $request)` — buat user baru. Validasi: email unik, role harus salah satu dari `['admin','sales','export_staff','export_manager','finance','forwarder']`
   - `userUpdate(Request $request, User $user)` — edit nama, email, role, is_active
   - `userToggleActive(User $user)` — aktif/nonaktifkan akun (toggle `is_active`)
   - `auditLogs(Request $request)` — tampilkan audit log global dengan filter per user, per action, per periode

2. Tambahkan route di `routes/web.php`:
   ```php
   Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
       Route::get('/users', [AdminController::class, 'userIndex']);
       Route::post('/users', [AdminController::class, 'userStore']);
       Route::put('/users/{user}', [AdminController::class, 'userUpdate']);
       Route::post('/users/{user}/toggle-active', [AdminController::class, 'userToggleActive']);
       Route::get('/audit-logs', [AdminController::class, 'auditLogs']);
   });
   ```

**Acceptance Criteria:**
- [ ] Admin bisa membuat user baru dengan role tertentu
- [ ] Admin bisa menonaktifkan user (user nonaktif tidak bisa login)
- [ ] Admin bisa melihat audit log global
- [ ] Role selain admin tidak bisa mengakses route `/admin/*`

---

## FASE 3 — Integrasi Frontend ke Backend (🟠 P1)

> Fase ini menghubungkan UI React yang sudah ada agar menggunakan data dari backend, bukan localStorage/mock.

---

### ISSUE-010: Hubungkan Dashboard.jsx ke Data Backend via Inertia Props

**Status:** Belum dikerjakan
**Prioritas:** 🟠 P1
**Estimasi:** 4-6 jam
**Depends on:** ISSUE-004 s.d. ISSUE-009

**Konteks:**
Saat ini `Dashboard.jsx` menggunakan data mock dari konstanta `INITIAL_SHIPMENTS`, `INITIAL_CUSTOMERS`, `INITIAL_AUDIT_LOGS` dan menyimpannya di localStorage. Ini harus diganti agar membaca dari props Inertia yang dikirim oleh controller.

**Yang harus dikerjakan:**
1. **Update route `GET /dashboard`** di `routes/web.php`:
   - Pindahkan dari closure ke `DashboardController@index`
   - Controller query data sesuai role user yang login:
     - `sales` → shipment miliknya saja
     - `export_staff` → semua shipment yang relevan (SENT_TO_EXPORT, IN_PROGRESS, dll)
     - `export_manager` → semua shipment yang ada dokumen IN_REVIEW
     - `finance` → shipment dengan status APPROVED & payment-nya
     - `forwarder` → shipment SENT_TO_FORWARDER, IN_CUSTOMS, SHIPPED
     - `admin` → semua data + user list
   - Pass data sebagai props: `Inertia::render('Dashboard', ['shipments' => ..., 'customers' => ..., 'auditLogs' => ...])`

2. **Update `Dashboard.jsx`:**
   - Hapus semua konstanta `INITIAL_*` dan `localStorage` logic (baris 5-126)
   - Ambil data dari `props` parameter: `export default function Dashboard({ auth, shipments, customers, auditLogs })`
   - Ganti semua `setShipments(...)` handler menjadi `router.post(...)` atau `router.put(...)` (Inertia form submission ke backend)
   - Role diambil dari `auth.user.role` (sudah ada di baris 114, tapi perlu pastikan backend mengirimnya)

3. **Hapus role switcher** yang saat ini ada di frontend (state `role` di baris 114). Role harus berasal dari `auth.user.role` yang dikirim backend.

**Acceptance Criteria:**
- [ ] Dashboard menampilkan data dari database, bukan mock/localStorage
- [ ] Setiap action (create, submit, approve, dll) mengirim request ke backend
- [ ] Setelah action berhasil, halaman refresh otomatis (Inertia auto-reload)
- [ ] Role user berasal dari session backend, bukan state frontend

---

### ISSUE-011: Implementasi Upload File Nyata di Frontend

**Status:** Belum dikerjakan
**Prioritas:** 🟠 P1
**Estimasi:** 2-3 jam
**Depends on:** ISSUE-005, ISSUE-010

**Konteks:**
Saat ini form upload dokumen (baris 1225-1280 di Dashboard.jsx) hanya menggunakan text input untuk "nama file" — bukan file input yang sesungguhnya. Begitu juga untuk upload bukti bayar di Finance.

**Yang harus dikerjakan:**
1. Ubah modal "Unggah Dokumen" (baris 1250-1260):
   - Ganti `<input type="text">` menjadi `<input type="file" accept=".pdf,.jpg,.jpeg,.png">`
   - Gunakan `useForm` dari `@inertiajs/react` untuk mengirim `FormData` dengan file ke backend
   - Contoh:
     ```jsx
     const { data, setData, post, processing } = useForm({
       document: null,
       type: 'Commercial Invoice',
     });
     // submit: post(`/export/shipments/${shipment.id}/documents`)
     ```

2. Ubah modal Finance (baris 1340-1392):
   - Tambahkan field upload invoice file dan bukti bayar
   - Gunakan approach yang sama dengan `useForm` + `FormData`

3. Tambahkan progress bar / loading indicator saat upload sedang berjalan (`processing` state dari `useForm`)

**Acceptance Criteria:**
- [ ] User bisa memilih file dari perangkat (bukan ketik nama file)
- [ ] File terupload ke `storage/app/public/documents/`
- [ ] Ada indikator loading saat proses upload
- [ ] Validasi di frontend: hanya terima PDF dan gambar, max 25MB

---

## FASE 4 — Fitur Pendukung Use Case (🟡 P2)

---

### ISSUE-012: Sistem Notifikasi In-App (Bell Icon)

**Status:** Mock (hardcoded array di frontend)
**Prioritas:** 🟡 P2
**Estimasi:** 3-4 jam
**Depends on:** ISSUE-001

**Konteks:**
Notifikasi saat ini hanya array statis di frontend (baris 127-130 Dashboard.jsx). Seharusnya notifikasi dibuat oleh backend setiap kali ada event penting, disimpan di tabel `notifications` (belum ada migrationnya), dan ditampilkan per user.

**Yang harus dikerjakan:**
1. Buat migration baru `create_notifications_table`:
   ```
   id, user_id (FK), type, title, message, is_read (default false), shipment_id (nullable FK), created_at
   ```
2. Buat Model `Notification.php`
3. Buat helper/service `NotificationService.php` di `app/Services/`:
   - Method `notify(int $userId, string $type, string $title, string $message, ?int $shipmentId)`
   - Dipanggil dari controller setiap kali ada event: submit, approve, revise, payment validated, status update
4. Buat `NotificationController.php`:
   - `index()` — ambil notifikasi milik user yang login, urutkan terbaru dulu
   - `markRead(Notification $notification)` — tandai sudah dibaca
   - `markAllRead()` — tandai semua sudah dibaca
5. Kirim data notifikasi sebagai **shared Inertia prop** (via `HandleInertiaRequests.php`) agar selalu tersedia di semua halaman:
   ```php
   'unreadNotifications' => fn () => auth()->user()?->notifications()->where('is_read', false)->latest()->take(10)->get()
   ```

**Event yang harus trigger notifikasi:**
| Event | Notifikasi ke |
|---|---|
| Sales submit PO ke export | Staff Export |
| Staff upload & submit review | Manager Export |
| Manager approve dokumen | Staff Export, Finance |
| Manager revisi dokumen | Staff Export |
| Finance validasi PAID | Staff Export |
| Finance status HOLD | Staff Export |
| Staff kirim ke Forwarder | Forwarder |
| Forwarder update status | Staff Export, Sales |

**Acceptance Criteria:**
- [ ] Notifikasi muncul di bell icon berdasarkan data dari database
- [ ] Badge merah muncul jika ada notifikasi belum dibaca
- [ ] Klik "Tandai semua dibaca" benar-benar update di database
- [ ] Setiap event di tabel di atas menghasilkan notifikasi yang benar

---

### ISSUE-013: Preview Dokumen di Browser (PDF/Image Viewer)

**Status:** Mock text saja (baris 1292-1295 Dashboard.jsx)
**Prioritas:** 🟡 P2
**Estimasi:** 2-3 jam
**Depends on:** ISSUE-005, ISSUE-011

**Konteks:**
Di use case Manager Export ada "Memeriksa Dokumen Ekspor" — manager harus bisa melihat isi dokumen langsung di browser sebelum approve/revisi. Saat ini modal review hanya menampilkan text placeholder "Inline Document Preview (MOCK)".

**Yang harus dikerjakan:**
1. Buat route/endpoint yang melayani file dokumen:
   ```php
   Route::get('/documents/{document}/preview', [DocumentController::class, 'preview'])->middleware('auth');
   ```
   - Untuk PDF: return response file dengan header `Content-Type: application/pdf` + `Content-Disposition: inline`
   - Untuk gambar: return response file dengan content type yang sesuai

2. Di frontend (modal review, baris ~1292):
   - Ganti placeholder dengan `<iframe>` untuk PDF: `<iframe src={`/documents/${doc.id}/preview`} />`
   - Atau gunakan `<img>` untuk file gambar
   - Deteksi tipe file dari ekstensi (`file_name.endsWith('.pdf')` → iframe, else → img)

3. Tambahkan tombol download di sebelah preview

**Acceptance Criteria:**
- [ ] PDF bisa dilihat langsung di modal tanpa download
- [ ] Gambar ditampilkan langsung di modal
- [ ] Ada tombol download terpisah
- [ ] Hanya user yang terautentikasi yang bisa mengakses file

---

### ISSUE-014: Laporan Ekspor & Export Excel/PDF (Manager + Finance)

**Status:** Belum ada
**Prioritas:** 🟡 P2
**Estimasi:** 3-4 jam
**Depends on:** ISSUE-006, ISSUE-007

**Konteks:**
Use case Manager Export: "Melihat Laporan Ekspor". Use case Finance: "Membuat Rekap Pembayaran" & "Export Data Pembayaran". PRD FR-DSH-03 juga menyebut export ke Excel/PDF.

**Yang harus dikerjakan:**
1. **Halaman Laporan Manager** (bisa tab/section baru di dashboard atau halaman terpisah):
   - Filter: periode (tanggal awal-akhir), customer, negara tujuan, status
   - Tabel hasil: nomor PO, customer, negara, nilai total, status, tanggal
   - Summary: jumlah shipment per status, total nilai keseluruhan, rata-rata leadtime
   - Tombol "Export ke Excel"

2. **Halaman Rekap Finance:**
   - Filter: periode, vendor, status pembayaran
   - Tabel: vendor, shipment PO, jumlah tagihan, status, tanggal validasi
   - Summary: total paid, total unpaid, total hold
   - Tombol "Export ke CSV"

3. **Backend export:**
   - Opsi 1 (simpel): Generate CSV secara manual di controller (buat string CSV, return sebagai download response)
   - Opsi 2 (lebih bagus): Install `maatwebsite/excel` via composer dan buat Export class

**Acceptance Criteria:**
- [ ] Manager bisa filter laporan dan melihat summary
- [ ] Finance bisa filter rekap pembayaran
- [ ] Tombol export mengunduh file .csv atau .xlsx yang bisa dibuka di Excel
- [ ] Data di file export sesuai dengan filter yang dipilih

---

## FASE 5 — Refactor & Polish (🟢 P3)

---

### ISSUE-015: Pecah Dashboard.jsx Menjadi Komponen Terpisah

**Status:** Semua di satu file (1396 baris)
**Prioritas:** 🟢 P3
**Estimasi:** 3-4 jam
**Depends on:** ISSUE-010

**Konteks:**
File `Dashboard.jsx` saat ini 1396 baris berisi semua: KPI widget, tabel shipment, detail shipment, modal create, modal upload, modal review, modal payment, audit trail, notifikasi. Ini harus dipecah agar mudah di-maintain.

**Yang harus dikerjakan:**
Pecah menjadi komponen-komponen di `resources/js/Components/`:

```
Components/
├── Dashboard/
│   ├── KpiWidgets.jsx           ← 4 kartu KPI (baris 633-659)
│   ├── ShipmentTable.jsx        ← tabel daftar shipment (baris 662-734)
│   └── AuditTrailGlobal.jsx     ← audit trail di dashboard (baris 737-750)
├── Shipment/
│   ├── ShipmentDetail.jsx       ← halaman detail (baris 752-1103)
│   ├── ShipmentInfoCard.jsx     ← informasi umum (baris 857-937)
│   ├── ItemsTable.jsx           ← daftar barang (baris 939-968)
│   ├── DocumentList.jsx         ← daftar dokumen (baris 970-1023)
│   ├── PaymentList.jsx          ← daftar pembayaran (baris 1025-1079)
│   └── AuditTimeline.jsx        ← timeline audit per shipment (baris 1082-1101)
├── Modals/
│   ├── CreateShipmentModal.jsx  ← modal buat shipment (baris 1108-1223)
│   ├── UploadDocumentModal.jsx  ← modal upload dokumen (baris 1225-1280)
│   ├── ReviewDocumentModal.jsx  ← modal review manager (baris 1282-1338)
│   └── PaymentModal.jsx         ← modal finance (baris 1340-1392)
└── Layout/
    ├── TopBanner.jsx             ← header atas (baris 461-528)
    ├── Sidebar.jsx               ← navigasi samping (baris 532-618)
    └── NotificationDropdown.jsx  ← dropdown notifikasi (baris 489-525)
```

**Aturan:**
- Setiap komponen menerima data yang dibutuhkan via `props`
- Event handler (create, submit, upload, review) tetap di `Dashboard.jsx` atau dipindah ke custom hook, lalu diteruskan via props
- Jangan lupa pindahkan function helper seperti `getStatusBadge()` ke file utility terpisah

**Acceptance Criteria:**
- [ ] `Dashboard.jsx` menjadi < 200 baris (hanya layout + composing komponen)
- [ ] Semua fungsionalitas tetap sama persis — tidak ada regresi
- [ ] Setiap komponen punya props yang jelas dan terdokumentasi

---

### ISSUE-016: Tambahkan User Non-Aktif Check di Login

**Status:** Belum ada
**Prioritas:** 🟢 P3
**Estimasi:** 30 menit
**Depends on:** ISSUE-002

**Konteks:**
Tabel users punya kolom `is_active` (boolean). Tapi belum ada pengecekan saat login — user nonaktif tetap bisa login.

**Yang harus dikerjakan:**
1. Edit `app/Http/Controllers/Auth/AuthenticatedSessionController.php`:
   - Setelah validasi credentials berhasil, cek `if (!$user->is_active)` → logout dan return error "Akun Anda telah dinonaktifkan. Hubungi admin."

**Acceptance Criteria:**
- [ ] User dengan `is_active = false` tidak bisa login
- [ ] Pesan error yang jelas ditampilkan

---

### ISSUE-017: Audit Log Otomatis untuk Login/Logout

**Status:** Belum ada
**Prioritas:** 🟢 P3
**Estimasi:** 1 jam
**Depends on:** ISSUE-001

**Konteks:**
PRD FR-AUTH-05 menyebutkan audit log untuk setiap login dan perubahan data kritis.

**Yang harus dikerjakan:**
1. Di `AuthenticatedSessionController@store` (setelah login sukses): insert audit log dengan action `LOGIN`
2. Di `AuthenticatedSessionController@destroy` (saat logout): insert audit log dengan action `LOGOUT`
3. Payload berisi: IP address, user agent, timestamp

**Acceptance Criteria:**
- [ ] Setiap login berhasil tercatat di tabel `audit_logs`
- [ ] Setiap logout tercatat
- [ ] Data IP address dan user agent tersimpan di kolom `payload` (JSON)

---

## Urutan Pengerjaan yang Disarankan

```
FASE 1 (Fondasi):
  ISSUE-001 → ISSUE-002 → ISSUE-003
       ↓
FASE 2 (Backend per modul, bisa paralel setelah Fase 1):
  ISSUE-004 ─┐
  ISSUE-005 ─┤
  ISSUE-006 ─┼─→ bisa dikerjakan paralel oleh dev berbeda
  ISSUE-007 ─┤
  ISSUE-008 ─┤
  ISSUE-009 ─┘
       ↓
FASE 3 (Integrasi FE-BE):
  ISSUE-010 → ISSUE-011
       ↓
FASE 4 (Fitur pendukung):
  ISSUE-012 ─┐
  ISSUE-013 ─┼─→ paralel
  ISSUE-014 ─┘
       ↓
FASE 5 (Polish):
  ISSUE-015 → ISSUE-016 → ISSUE-017
```

---

## Catatan untuk Developer

1. **Selalu gunakan `auth()->user()`** untuk mendapatkan user yang login. Jangan hardcode user ID.
2. **Setiap action yang mengubah status** wajib insert ke `shipment_status_logs` DAN `audit_logs`.
3. **Jangan hapus kode frontend yang ada** di `Dashboard.jsx` sampai backend siap. Kerjakan backend dulu, baru integrasikan.
4. **Test dengan seeder data** — jalankan `php artisan migrate:fresh --seed` setiap mulai development.
5. **Gunakan Form Request** (`php artisan make:request StoreShipmentRequest`) untuk validasi yang kompleks agar controller tetap bersih.
6. **File storage:** untuk v1.0 pakai `Storage::disk('public')`. Jangan hardcode path. Nanti tinggal ganti config ke S3.
