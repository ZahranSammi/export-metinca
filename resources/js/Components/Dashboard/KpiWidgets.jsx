import React from 'react';

export default function KpiWidgets({ shipments = [] }) {
  const activeShipments = shipments.filter(s => s.status !== 'ARCHIVED').length;
  const awaitingReview = shipments.filter(s => s.status === 'IN_REVIEW').length;
  
  const unpaidBills = shipments.reduce((acc, s) => {
    const unpaidInShipment = s.payments ? s.payments.filter(p => p.status === 'UNPAID').length : 0;
    return acc + unpaidInShipment;
  }, 0);
  
  const archivedCount = shipments.filter(s => s.status === 'ARCHIVED').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-4 rounded relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
        <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Total Active Shipments</span>
        <div className="text-2xl font-bold text-[var(--text-main)] mt-1">{activeShipments}</div>
        <div className="w-1 h-8 bg-[var(--primary-color)] absolute left-0 top-4"></div>
      </div>

      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-4 rounded relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
        <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Menunggu Review Manager</span>
        <div className="text-2xl font-bold text-[var(--warning-color)] mt-1">{awaitingReview}</div>
        <div className="w-1 h-8 bg-[var(--warning-color)] absolute left-0 top-4"></div>
      </div>

      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-4 rounded relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
        <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Unpaid Vendor Bills</span>
        <div className="text-2xl font-bold text-indigo-600 mt-1">{unpaidBills}</div>
        <div className="w-1 h-8 bg-indigo-500 absolute left-0 top-4"></div>
      </div>

      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-4 rounded relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
        <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Selesai & Diarsipkan</span>
        <div className="text-2xl font-bold text-[var(--success-color)] mt-1">{archivedCount}</div>
        <div className="w-1 h-8 bg-[var(--success-color)] absolute left-0 top-4"></div>
      </div>
    </div>
  );
}
