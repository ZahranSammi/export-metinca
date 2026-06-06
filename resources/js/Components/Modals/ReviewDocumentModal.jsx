import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function ReviewDocumentModal({ isOpen, onClose, document: doc }) {
  if (!isOpen || !doc) return null;

  const { data, setData, post, processing, errors, reset } = useForm({
    comment: '',
  });

  const handleApprove = (e) => {
    e.preventDefault();
    post(`/manager/documents/${doc.id}/approve`, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  const handleRevise = (e) => {
    e.preventDefault();
    if (!data.comment || data.comment.trim().length < 3) {
      alert("Catatan revisi wajib diisi minimal 3 karakter.");
      return;
    }
    post(`/manager/documents/${doc.id}/revise`, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  const isPdf = doc.file_name?.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-md max-w-2xl w-full p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
          <h3 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">Tinjau Dokumen Ekspor</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-transparent border-0 text-xl cursor-pointer">&times;</button>
        </div>

        <div className="space-y-3 text-xs">
          {/* Document Preview Box */}
          <div className="border border-[var(--border-color)] p-2 rounded bg-slate-50 flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-2 px-1">
              <span className="font-mono text-slate-500 text-[10px]">{doc.file_name} ({doc.type})</span>
              <a 
                href={`/documents/${doc.id}/download`} 
                target="_blank"
                className="text-[10px] text-[var(--primary-color)] hover:underline font-bold"
              >
                Unduh Berkas 💾
              </a>
            </div>

            {isPdf ? (
              <iframe 
                src={`/documents/${doc.id}/preview`} 
                className="w-full h-96 border rounded bg-white" 
                title="Preview Dokumen"
              />
            ) : (
              <img 
                src={`/documents/${doc.id}/preview`} 
                className="max-w-full max-h-96 object-contain border rounded" 
                alt="Preview Gambar Dokumen"
              />
            )}
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Catatan Tambahan (Wajib diisi jika Anda menolak/meminta REVISI)</label>
            <textarea 
              placeholder="Berikan alasan revisi secara detail..."
              value={data.comment}
              onChange={(e) => setData('comment', e.target.value)}
              className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] h-20 focus:outline-none focus:border-[var(--primary-color)]"
            />
            {errors.comment && <span className="text-[var(--error-color)] text-[10px] block mt-1">{errors.comment}</span>}
          </div>

          <div className="pt-3 flex justify-between items-center gap-2">
            <button 
              type="button" 
              onClick={onClose}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded cursor-pointer border-0"
            >
              Batal
            </button>
            <div className="flex gap-2">
              <button 
                onClick={handleRevise}
                disabled={processing}
                className="bg-[var(--error-color)] text-white font-bold px-4 py-2 rounded cursor-pointer disabled:opacity-50 border-0"
              >
                Minta Revisi (Reject)
              </button>
              <button 
                onClick={handleApprove}
                disabled={processing}
                className="bg-[var(--success-color)] text-white font-bold px-4 py-2 rounded cursor-pointer disabled:opacity-50 border-0"
              >
                Setujui Dokumen (Approve)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
