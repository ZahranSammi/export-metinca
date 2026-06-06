import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import TopBanner from '../../Components/Layout/TopBanner';
import Sidebar from '../../Components/Layout/Sidebar';

export default function Recap({ auth, payments = [], summary = {}, filters = {}, unreadNotifications = [] }) {
  const [startDate, setStartDate] = useState(filters.start_date || '');
  const [endDate, setEndDate] = useState(filters.end_date || '');
  const [vendorName, setVendorName] = useState(filters.vendor_name || '');
  const [status, setStatus] = useState(filters.status || '');

  const handleFilter = (e) => {
    e.preventDefault();
    router.get('/finance/recap', {
      start_date: startDate,
      end_date: endDate,
      vendor_name: vendorName,
      status: status,
    }, { preserveState: true });
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setVendorName('');
    setStatus('');
    router.get('/finance/recap');
  };

  const handleValidate = (paymentId, validationStatus) => {
    if (validationStatus === 'HOLD') {
      const comment = prompt('Masukkan catatan penundaan pembayaran (HOLD):');
      if (!comment) return;
      router.post(`/finance/payments/${paymentId}/validate/HOLD`, { comment });
    } else {
      if (confirm('Apakah Anda yakin ingin memvalidasi pembayaran ini sebagai LUNAS (PAID)?')) {
        router.post(`/finance/payments/${paymentId}/validate/PAID`);
      }
    }
  };

  const handleFileChange = (paymentId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    router.post(`/finance/payments/${paymentId}/upload-proof`, {
      _method: 'POST',
      proof: file
    }, {
      forceFormData: true,
    });
  };

  const role = auth?.user?.role || 'finance';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-main)] text-xs">
      <Head title="Rekap Pembayaran - PT Metinca" />

      <TopBanner auth={auth} unreadNotifications={unreadNotifications} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar role={role} selectedShipment={null} setSelectedShipment={() => {}} />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[var(--text-main)]">Rekapitulasi Pembayaran Ekspor</h2>
              <p className="text-xs text-[var(--text-muted)]">Verifikasi tagihan vendor, unggah bukti bayar, dan rekapitulasi data pembayaran.</p>
            </div>
            
            {/* Export CSV trigger button */}
            <a 
              href={route('finance.export', { start_date: startDate, end_date: endDate, vendor_name: vendorName, status: status })}
              target="_blank"
              rel="noreferrer"
              className="bg-[var(--success-color)] text-white hover:opacity-90 font-bold px-4 py-2 rounded text-center block no-underline border-0 cursor-pointer"
            >
              Export Data Pembayaran XLSX 📊
            </a>
          </div>

          {/* Filter Panel */}
          <form onSubmit={handleFilter} className="bg-[var(--surface-color)] border border-[var(--border-color)] p-4 rounded-md shadow-sm grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Nama Vendor</label>
              <input 
                type="text" 
                placeholder="Cari nama vendor..."
                value={vendorName} 
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-1.5 text-[var(--text-main)]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Status Pembayaran</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-1.5 text-[var(--text-main)]"
              >
                <option value="">Semua Status</option>
                <option value="UNPAID">UNPAID</option>
                <option value="PAID">PAID</option>
                <option value="HOLD">HOLD</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Tanggal Mulai</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-1.5 text-[var(--text-main)]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Tanggal Akhir</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-1.5 text-[var(--text-main)]"
              />
            </div>

            <div className="flex gap-2">
              <button 
                type="submit" 
                className="flex-1 bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] font-bold px-3 py-2 rounded cursor-pointer border-0"
              >
                Filter
              </button>
              <button 
                type="button" 
                onClick={handleReset}
                className="bg-slate-100 text-slate-700 px-3 py-2 rounded hover:bg-slate-200 cursor-pointer border-0"
              >
                Reset
              </button>
            </div>
          </form>

          {/* Summary KPI Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-4 rounded relative overflow-hidden">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Total Lunas (PAID)</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">
                IDR {parseFloat(summary.total_paid || 0).toLocaleString()}
              </div>
              <div className="w-1 h-8 bg-emerald-500 absolute left-0 top-4"></div>
            </div>

            <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-4 rounded relative overflow-hidden">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Total Belum Bayar (UNPAID)</span>
              <div className="text-2xl font-bold text-amber-600 mt-1">
                IDR {parseFloat(summary.total_unpaid || 0).toLocaleString()}
              </div>
              <div className="w-1 h-8 bg-amber-500 absolute left-0 top-4"></div>
            </div>

            <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-4 rounded relative overflow-hidden">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Total Ditunda (HOLD)</span>
              <div className="text-2xl font-bold text-rose-600 mt-1">
                IDR {parseFloat(summary.total_hold || 0).toLocaleString()}
              </div>
              <div className="w-1 h-8 bg-rose-500 absolute left-0 top-4"></div>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-slate-500 text-[10px] uppercase font-mono bg-[var(--surface-elevated)]">
                    <th className="p-3">PO Number</th>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Vendor / Forwarder</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3">Invoice</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Bukti Bayar</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] text-xs">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-4 text-center text-slate-400 italic">Belum ada data pembayaran yang sesuai filter.</td>
                    </tr>
                  ) : (
                    payments.map(p => (
                      <tr key={p.id} className="hover:bg-[var(--surface-elevated)] transition-all">
                        <td className="p-3 font-mono font-bold text-[var(--primary-color)]">
                          {p.shipment?.po_number}
                        </td>
                        <td className="p-3 text-slate-600 whitespace-nowrap">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-[var(--text-main)]">{p.shipment?.customer?.name || '-'}</div>
                          <div className="text-[10px] text-slate-400">{p.shipment?.customer?.country || '-'}</div>
                        </td>
                        <td className="p-3 font-bold text-[var(--text-main)]">
                          {p.vendor_name}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-[var(--primary-color)]">
                          {p.currency} {parseFloat(p.amount).toLocaleString()}
                        </td>
                        <td className="p-3">
                          {p.invoice_path ? (
                            <a 
                              href={`/storage/${p.invoice_path}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-[var(--primary-color)] hover:underline font-medium inline-flex items-center gap-1"
                            >
                              📄 Invoice
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">Tidak ada</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            {p.status === 'PAID' && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-emerald-100 text-emerald-800">PAID</span>}
                            {p.status === 'HOLD' && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-rose-100 text-rose-800">HOLD</span>}
                            {p.status === 'UNPAID' && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-amber-100 text-amber-800">UNPAID</span>}
                            {p.comment && (
                              <div className="text-[9px] text-rose-600 bg-rose-50 border border-rose-100 p-1 rounded max-w-xs font-mono">
                                Catatan: {p.comment}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            {p.proof_path ? (
                              <a 
                                href={`/storage/${p.proof_path}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-emerald-600 hover:underline font-medium inline-flex items-center gap-1"
                              >
                                🧾 Bukti Bayar
                              </a>
                            ) : (
                              role === 'finance' && (
                                <div className="flex flex-col gap-1">
                                  <input 
                                    type="file" 
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileChange(p.id, e)}
                                    className="text-[9px] w-40 text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                  />
                                </div>
                              )
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          {role === 'finance' && p.status !== 'PAID' ? (
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() => handleValidate(p.id, 'PAID')}
                                className="bg-[var(--success-color)] text-white font-bold text-[10px] px-2 py-1 rounded font-mono hover:opacity-90 transition-colors border-0 cursor-pointer"
                              >
                                LUNAS
                              </button>
                              <button
                                onClick={() => handleValidate(p.id, 'HOLD')}
                                className="bg-[var(--error-color)] text-white text-[10px] px-2 py-1 rounded font-mono hover:opacity-90 transition-colors border-0 cursor-pointer"
                              >
                                HOLD
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono text-[10px]">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
