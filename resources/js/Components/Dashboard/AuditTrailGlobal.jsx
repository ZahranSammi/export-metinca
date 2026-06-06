import React from 'react';

export default function AuditTrailGlobal({ auditLogs = [] }) {
  return (
    <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-4 rounded-md shadow-sm">
      <h3 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider mb-3">Audit Trail Global</h3>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {auditLogs.slice(0, 10).map(log => (
          <div key={log.id} className="flex gap-3 text-xs border-b border-[var(--border-color)] pb-2 last:border-0 last:pb-0">
            <span className="text-[10px] font-mono text-[var(--primary-color)] w-44 shrink-0 font-bold">
              {new Date(log.created_at).toLocaleTimeString()} - {log.user?.name || 'System'}
            </span>
            <span className="font-bold text-[10px] uppercase font-mono w-36 shrink-0 text-slate-500">{log.action}</span>
            <span className="text-[var(--text-muted)]">{log.payload?.detail || '-'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
