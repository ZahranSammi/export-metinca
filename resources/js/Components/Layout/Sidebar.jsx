import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function Sidebar({ role, selectedShipment, setSelectedShipment, setShowCreateModal, setShowDocUploadModal, setShowPaymentModal, setShowCustomerModal }) {
  const { url } = usePage();

  const isDashboardActive = url === '/dashboard';
  const isReportsActive = url.startsWith('/manager/reports');
  const isUsersActive = url.startsWith('/admin/users');
  const isLogsActive = url.startsWith('/admin/audit-logs');

  const getLinkClass = (isActive) => {
    return `w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-all text-left border-0 cursor-pointer ${
      isActive 
        ? 'bg-[var(--primary-color)] text-white font-bold' 
        : 'text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-main)] bg-transparent'
    }`;
  };

  return (
    <aside className="w-64 bg-[var(--surface-color)] border-r border-[var(--border-color)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="px-2">
          <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Navigasi Utama</span>
        </div>

        <nav className="space-y-1">
          <Link 
            href="/dashboard"
            onClick={() => setSelectedShipment && setSelectedShipment(null)}
            className={getLinkClass(isDashboardActive)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
            </svg>
            Dashboard Ringkasan
          </Link>

          {/* Laporan Link for Manager, Finance & Admin */}
          {(role === 'export_manager' || role === 'finance' || role === 'admin') && (
            <>
              <Link 
                href={route('manager.reports')}
                className={getLinkClass(isReportsActive)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Laporan Ekspor
              </Link>
              <Link 
                href="/finance/recap"
                className={getLinkClass(url.startsWith('/finance/recap'))}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Rekap Pembayaran
              </Link>
            </>
          )}

          {/* Admin Management Links */}
          {role === 'admin' && (
            <>
              <Link 
                href={route('admin.users')}
                className={getLinkClass(isUsersActive)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Manajemen User
              </Link>
              <Link 
                href={route('admin.audit-logs')}
                className={getLinkClass(isLogsActive)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Audit Log Sistem
              </Link>
            </>
          )}

          <div className="pt-4 pb-1 px-2">
            <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider">Aksi Cepat ({role.toUpperCase()})</span>
          </div>

          {(role === 'sales' || role === 'export_staff' || role === 'admin') && (
            <button 
              onClick={() => setShowCustomerModal(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-medium text-[var(--primary-color)] border border-[var(--primary-color)] border-dashed hover:bg-[var(--secondary-color)]/20 transition-all text-left bg-transparent cursor-pointer mb-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Tambah Customer Baru
            </button>
          )}

          {role === 'sales' && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-medium text-[var(--primary-color)] border border-[var(--primary-color)] border-dashed hover:bg-[var(--secondary-color)]/20 transition-all text-left bg-transparent cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Buat Shipment Baru
            </button>
          )}

          {role === 'export_staff' && selectedShipment && (
            <>
              <button 
                onClick={() => setShowDocUploadModal(true)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-medium text-[var(--primary-color)] border border-[var(--primary-color)] border-dashed hover:bg-[var(--secondary-color)]/20 transition-all text-left bg-transparent cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Unggah Dokumen
              </button>
            </>
          )}

          {role === 'finance' && selectedShipment && (
            <button 
              onClick={() => setShowPaymentModal(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-medium text-[var(--primary-color)] border border-[var(--primary-color)] border-dashed hover:bg-[var(--secondary-color)]/20 transition-all text-left bg-transparent cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Tambah Tagihan Vendor
            </button>
          )}
        </nav>
      </div>

      <div className="bg-[var(--surface-elevated)] border border-[var(--border-color)] p-3 rounded">
        <span className="text-[9px] font-mono text-slate-500 uppercase">Status Sistem</span>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-[var(--text-muted)]">SQLite DB:</span>
          <span className="text-[10px] text-[var(--success-color)] font-mono font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success-color)] inline-block animate-pulse"></span>
            CONNECTED
          </span>
        </div>
      </div>
    </aside>
  );
}
