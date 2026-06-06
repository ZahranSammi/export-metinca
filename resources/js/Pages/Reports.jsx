import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import TopBanner from '../Components/Layout/TopBanner';
import Sidebar from '../Components/Layout/Sidebar';
import { getStatusBadge } from '../Utils/status';

export default function Reports({ auth, shipments = [], customers = [], summary = {}, filters = {}, unreadNotifications = [] }) {
  const [startDate, setStartDate] = useState(filters.start_date || '');
  const [endDate, setEndDate] = useState(filters.end_date || '');
  const [customerId, setCustomerId] = useState(filters.customer_id || '');
  const [status, setStatus] = useState(filters.status || '');
  const [country, setCountry] = useState(filters.country || '');

  const handleFilter = (e) => {
    e.preventDefault();
    router.get('/manager/reports', {
      start_date: startDate,
      end_date: endDate,
      customer_id: customerId,
      status: status,
      country: country,
    }, { preserveState: true });
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setCustomerId('');
    setStatus('');
    setCountry('');
    router.get('/manager/reports');
  };

  const role = auth?.user?.role || 'export_manager';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-main)] text-xs">
      <Head title="Laporan Ekspor - PT Metinca" />

      <TopBanner auth={auth} unreadNotifications={unreadNotifications} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar role={role} selectedShipment={null} setSelectedShipment={() => {}} />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[var(--text-main)]">Laporan Analisis Ekspor</h2>
              <p className="text-xs text-[var(--text-muted)]">Rangkuman kinerja, volume barang, dan statistik pengapalan.</p>
            </div>
            
            {/* Export CSV trigger button */}
            <a
              href={route('manager.reports.export', { start_date: startDate, end_date: endDate, customer_id: customerId, status: status, country: country })}
              target="_blank"
              rel="noreferrer"
              className="bg-[var(--success-color)] text-white hover:opacity-90 font-bold px-4 py-2 rounded text-center block no-underline"
            >
              Export Laporan XLSX 📊
            </a>
          </div>

          {/* Filter Panel */}
          <form onSubmit={handleFilter} className="bg-[var(--surface-color)] border border-[var(--border-color)] p-4 rounded-md shadow-sm grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Customer</label>
              <select 
                value={customerId} 
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-1.5 text-[var(--text-main)]"
              >
                <option value="">Semua Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Negara Tujuan</label>
              <input 
                type="text" 
                placeholder="Singapore, Japan..."
                value={country} 
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-1.5 text-[var(--text-main)]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Status Shipment</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-1.5 text-[var(--text-main)]"
              >
                <option value="">Semua Status</option>
                <option value="DRAFT">DRAFT</option>
                <option value="SENT_TO_EXPORT">SENT TO EXPORT</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="IN_REVIEW">IN REVIEW</option>
                <option value="APPROVED">APPROVED</option>
                <option value="PAYMENT_VERIFIED">PAYMENT VERIFIED</option>
                <option value="SENT_TO_FORWARDER">SENT TO FORWARDER</option>
                <option value="IN_CUSTOMS">IN CUSTOMS</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="ARCHIVED">ARCHIVED</option>
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
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Volume Transaksi Pengapalan</span>
              <div className="text-2xl font-bold text-[var(--text-main)] mt-1">{summary.total_shipments || 0} Kontrak</div>
              <div className="w-1 h-8 bg-[var(--primary-color)] absolute left-0 top-4"></div>
            </div>

            <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-4 rounded relative overflow-hidden">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Estimasi Nilai Total Ekspor</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">USD {parseFloat(summary.total_value || 0).toLocaleString()}</div>
              <div className="w-1 h-8 bg-emerald-500 absolute left-0 top-4"></div>
            </div>

            <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-4 rounded relative overflow-hidden">
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Rata-rata Leadtime (DRAFT→DELIVERED)</span>
              <div className="text-2xl font-bold text-purple-600 mt-1">
                {summary.avg_leadtime !== null && summary.avg_leadtime !== undefined
                  ? `${summary.avg_leadtime} hari`
                  : '—'}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                {summary.delivered_count || 0} shipment selesai dihitung
              </div>
              <div className="w-1 h-8 bg-purple-500 absolute left-0 top-4"></div>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-slate-500 text-[10px] uppercase font-mono bg-[var(--surface-elevated)]">
                    <th className="p-3">Nomor PO</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Incoterms</th>
                    <th className="p-3">Sales Aktor</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Nilai Kontrak (Est.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] text-xs">
                  {shipments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-slate-400 italic">Belum ada kontrak pengapalan yang sesuai filter.</td>
                    </tr>
                  ) : (
                    shipments.map(s => {
                      const totalCargo = s.shipment_items?.reduce((acc, item) => acc + (item.qty * item.unit_price), 0) || 0;
                      return (
                        <tr key={s.id} className="hover:bg-[var(--surface-elevated)] transition-all">
                          <td className="p-3 font-mono font-bold text-[var(--primary-color)]">{s.po_number}</td>
                          <td className="p-3">
                            <div className="font-bold text-[var(--text-main)]">{s.customer?.name}</div>
                            <div className="text-[10px] text-slate-400">{s.customer?.country}</div>
                          </td>
                          <td className="p-3 font-mono">{s.incoterms}</td>
                          <td className="p-3">{s.sales?.name || '-'}</td>
                          <td className="p-3">{getStatusBadge(s.status)}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-700">
                            USD {totalCargo.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
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
