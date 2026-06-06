import React, { useState } from 'react';
import { router } from '@inertiajs/react';

export default function NotificationDropdown({ notifications = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAllRead = () => {
    router.post(route('notifications.read-all'));
  };

  const handleMarkRead = (id) => {
    router.post(route('notifications.read', { notification: id }));
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-elevated)] rounded relative transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[var(--error-color)] rounded-full border-2 border-[var(--surface-color)]"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-md shadow-2xl p-2 z-50 animate-fade-in">
          <div className="flex justify-between items-center px-2 py-1 border-b border-[var(--border-color)] mb-2">
            <span className="text-xs font-bold text-[var(--text-main)]">Notifikasi</span>
            {notifications.length > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-[10px] text-[var(--primary-color)] hover:underline bg-transparent border-0 cursor-pointer"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {notifications.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-400 italic">Tidak ada notifikasi baru</div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => handleMarkRead(n.id)}
                  className="p-2 rounded text-xs transition-colors bg-[var(--surface-elevated)] text-[var(--text-main)] font-medium border-l-2 border-[var(--primary-color)] cursor-pointer hover:bg-slate-100"
                >
                  <div className="font-bold">{n.title}</div>
                  <div>{n.message}</div>
                  <div className="text-[9px] text-slate-500 font-mono mt-1">
                    {new Date(n.created_at).toLocaleTimeString()} - {new Date(n.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
