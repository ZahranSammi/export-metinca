import React, { useState, useMemo } from 'react';
import { getStatusBadge } from '../../Utils/status';

const STATUS_OPTIONS = [
  'DRAFT', 'SENT_TO_EXPORT', 'IN_PROGRESS', 'IN_REVIEW', 'APPROVED',
  'PAYMENT_VERIFIED', 'SENT_TO_FORWARDER', 'IN_CUSTOMS', 'SHIPPED', 'DELIVERED', 'ARCHIVED',
];

export default function ShipmentTable({ shipments = [], customers = [], setSelectedShipment }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return shipments.filter(s => {
      const matchSearch = !q
        || s.po_number?.toLowerCase().includes(q)
        || s.customer?.name?.toLowerCase().includes(q)
        || s.customer?.country?.toLowerCase().includes(q);
      const matchStatus = !statusFilter || s.status === statusFilter;
      const created = s.created_at ? s.created_at.substring(0, 10) : '';
      const matchStart = !startDate || created >= startDate;
      const matchEnd = !endDate || created <= endDate;
      return matchSearch && matchStatus && matchStart && matchEnd;
    });
  }, [shipments, search, statusFilter, startDate, endDate]);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilter = search || statusFilter || startDate || endDate;

  return (
    <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-md overflow-hidden shadow-sm">
      <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--surface-elevated)]">
        <span className="text-xs font-bold text-[var(--text-main)]">Daftar Shipment & Dokumen Kontrol</span>
        <span className="text-[10px] font-mono text-slate-400">
          {filtered.length}{hasActiveFilter ? ` / ${shipments.length}` : ''} shipments
        </span>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-3 border-b border-[var(--border-color)] grid grid-cols-1 md:grid-cols-5 gap-2 bg-[var(--surface-color)]">
        <input
          type="text"
          placeholder="Cari PO / customer / negara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:col-span-2 bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-1.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-color)]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-2 py-1.5 text-xs text-[var(--text-main)]"
        >
          <option value="">Semua Status</option>
          {STATUS_OPTIONS.map(st => <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>)}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          title="Dibuat dari tanggal"
          className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-2 py-1.5 text-xs text-[var(--text-main)]"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            title="Dibuat sampai tanggal"
            className="flex-1 bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-2 py-1.5 text-xs text-[var(--text-main)]"
          />
          {hasActiveFilter && (
            <button
              onClick={resetFilters}
              className="bg-slate-100 text-slate-600 text-[10px] px-2 rounded hover:bg-slate-200 border-0 cursor-pointer font-mono"
              title="Reset filter"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-color)] text-slate-500 text-[10px] uppercase font-mono bg-[var(--surface-elevated)]">
              <th className="p-3">Nomor PO</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Incoterms</th>
              <th className="p-3">ETD / ETA</th>
              <th className="p-3">Status Shipment</th>
              <th className="p-3">Dokumen</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)] text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-slate-400 italic">
                  {hasActiveFilter ? 'Tidak ada shipment yang cocok dengan filter.' : 'Belum ada shipment.'}
                </td>
              </tr>
            ) : filtered.map(s => {
              const cust = s.customer || {};
              return (
                <tr 
                  key={s.id}
                  className="hover:bg-[var(--surface-elevated)] transition-all cursor-pointer"
                  onClick={() => setSelectedShipment(s)}
                >
                  <td className="p-3 font-mono font-bold text-[var(--primary-color)]">{s.po_number}</td>
                  <td className="p-3">
                    <div className="font-medium text-[var(--text-main)]">{cust.name}</div>
                    <div className="text-[10px] text-slate-500">{cust.country}</div>
                  </td>
                  <td className="p-3 font-mono text-[11px]">{s.incoterms}</td>
                  <td className="p-3 font-mono text-[10px]">
                    {s.etd || 'TBD'} / {s.eta || 'TBD'}
                  </td>
                  <td className="p-3">{getStatusBadge(s.status)}</td>
                  <td className="p-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {!s.documents || s.documents.length === 0 ? (
                        <span className="text-[10px] text-slate-400 italic">Belum ada dokumen</span>
                      ) : (
                        s.documents.map(d => (
                          <span 
                            key={d.id} 
                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                              d.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 
                              d.status === 'REVISED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}
                            title={`${d.type} v${d.version}`}
                          >
                            {d.type.split(' ').map(w => w[0]).join('')}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => setSelectedShipment(s)}
                      className="text-xs text-[var(--primary-color)] hover:underline font-mono bg-transparent border-0 cursor-pointer"
                    >
                      DETAIL &rarr;
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
