import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import TopBanner from '../../Components/Layout/TopBanner';
import Sidebar from '../../Components/Layout/Sidebar';

export default function AuditLogs({ auth, logs = [], users = [], filters = {}, unreadNotifications = [] }) {
  const [userId, setUserId] = useState(filters.user_id || '');
  const [action, setAction] = useState(filters.action || '');
  const [startDate, setStartDate] = useState(filters.start_date || '');
  const [endDate, setEndDate] = useState(filters.end_date || '');

  const handleFilter = (e) => {
    e.preventDefault();
    router.get('/admin/audit-logs', {
      user_id: userId,
      action: action,
      start_date: startDate,
      end_date: endDate,
    }, { preserveState: true });
  };

  const handleReset = () => {
    setUserId('');
    setAction('');
    setStartDate('');
    setEndDate('');
    router.get('/admin/audit-logs');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-main)] text-xs">
      <Head title="Audit Trail - PT Metinca" />

      <TopBanner auth={auth} unreadNotifications={unreadNotifications} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar role="admin" selectedShipment={null} setSelectedShipment={() => {}} />

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-main)]">Audit Log Sistem</h2>
            <p className="text-xs text-[var(--text-muted)]">Log terperinci mengenai semua aktivitas aktor di sistem ekspor.</p>
          </div>

          {/* Filter Panel */}
          <form onSubmit={handleFilter} className="bg-[var(--surface-color)] border border-[var(--border-color)] p-4 rounded-md shadow-sm grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Filter User</label>
              <select 
                value={userId} 
                onChange={(e) => setUserId(e.target.value)}
                className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-1.5 text-[var(--text-main)]"
              >
                <option value="">Semua User</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Aktivitas</label>
              <select 
                value={action} 
                onChange={(e) => setAction(e.target.value)}
                className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-1.5 text-[var(--text-main)]"
              >
                <option value="">Semua Aksi</option>
                <option value="LOGIN">LOGIN</option>
                <option value="LOGOUT">LOGOUT</option>
                <option value="CREATE_SHIPMENT">CREATE SHIPMENT</option>
                <option value="SUBMIT_SHIPMENT_TO_EXPORT">SUBMIT TO EXPORT</option>
                <option value="UPDATE_SHIPMENT_DETAILS">UPDATE DETAILS</option>
                <option value="UPLOAD_DOCUMENT">UPLOAD DOCUMENT</option>
                <option value="APPROVE_DOCUMENT">APPROVE DOCUMENT</option>
                <option value="REVISE_DOCUMENT">REVISE DOCUMENT</option>
                <option value="CREATE_INVOICE">CREATE INVOICE</option>
                <option value="VALIDATE_PAYMENT">VALIDATE PAYMENT</option>
                <option value="CONFIRM_DELIVERY">CONFIRM DELIVERY</option>
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
                Cari
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

          {/* Audit Logs Table */}
          <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-slate-500 text-[10px] uppercase font-mono bg-[var(--surface-elevated)]">
                    <th className="p-3 w-40">Waktu</th>
                    <th className="p-3 w-44">User</th>
                    <th className="p-3 w-48">Aksi</th>
                    <th className="p-3">Detail Deskripsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] text-xs font-mono">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-4 text-center text-slate-400 italic font-sans">Belum ada data audit log yang sesuai filter.</td>
                    </tr>
                  ) : (
                    logs.map(log => (
                      <tr key={log.id} className="hover:bg-[var(--surface-elevated)] transition-all">
                        <td className="p-3 text-slate-500">
                          {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString()}
                        </td>
                        <td className="p-3 font-sans">
                          <div className="font-bold text-[var(--text-main)]">{log.user?.name || 'System'}</div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">{log.user?.role || 'SYSTEM'}</div>
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 text-[var(--text-muted)] font-sans text-xs">
                          {log.payload?.detail || JSON.stringify(log.payload)}
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
