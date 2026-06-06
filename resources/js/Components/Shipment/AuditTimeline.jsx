import React from 'react';

export default function AuditTimeline({ statusLogs = [] }) {
  return (
    <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-5 rounded-md shadow-sm">
      <h3 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider mb-4 border-b border-[var(--border-color)] pb-2">Riwayat Perubahan Status</h3>
      <div className="space-y-4">
        {statusLogs.length === 0 ? (
          <div className="text-xs text-slate-400 italic py-2">Belum ada riwayat status.</div>
        ) : (
          statusLogs.map((log, idx) => (
            <div key={idx} className="relative pl-6 last:border-0 border-l border-[var(--border-color)] pb-4 last:pb-0">
              <div className="absolute left-[-4.5px] top-1 w-2.5 h-2.5 rounded-full bg-[var(--primary-color)]"></div>
              <div className="text-[10px] text-slate-400 font-mono">
                {new Date(log.changed_at || log.created_at).toLocaleString()}
              </div>
              <div className="text-xs font-bold text-[var(--text-main)] mt-0.5">{log.status}</div>
              {log.note && <p className="text-xs text-[var(--text-muted)] mt-1">{log.note}</p>}
              <span className="text-[9px] text-[var(--primary-color)] font-mono mt-1 block">Oleh: {log.user?.name || 'Sistem'}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
