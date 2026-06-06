import React from 'react';
import { Link } from '@inertiajs/react';
import NotificationDropdown from './NotificationDropdown';

export default function TopBanner({ auth, unreadNotifications }) {
  const role = auth?.user?.role || 'sales';
  const name = auth?.user?.name || 'User Session';

  return (
    <div className="bg-[var(--surface-color)] border-b border-[var(--border-color)] px-6 py-3 flex items-center justify-between z-10 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-[var(--primary-color)] flex items-center justify-center font-bold text-white text-sm tracking-wider">
          MT
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-[var(--text-main)]">PT Metinca Prima Industrial Works</h1>
          <p className="text-[10px] font-mono text-[var(--primary-color)]">Export Document Management System v1.0</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <span className="text-xs font-bold text-[var(--text-main)] block">{name}</span>
          <span className="text-[10px] font-mono text-[var(--primary-color)] block uppercase tracking-wider">{role.replace('_', ' ')}</span>
        </div>

        <Link
          method="post"
          href={route('logout')}
          as="button"
          className="text-[11px] text-[var(--error-color)] border border-[var(--error-color)]/30 hover:bg-[var(--error-color)]/10 rounded px-3 py-1.5 font-mono font-medium transition-all cursor-pointer"
        >
          LOGOUT
        </Link>

        <NotificationDropdown notifications={unreadNotifications} />
      </div>
    </div>
  );
}
