import React from 'react';
import { useForm } from '@inertiajs/react';

export default function CustomerModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    country: '',
    address: '',
    tax_id: '',
    contact: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/customers', {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-xs">
      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-md max-w-md w-full p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
          <h3 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">Tambah Customer Ekspor</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-transparent border-0 text-xl cursor-pointer">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-slate-500 mb-1">Nama Customer / Perusahaan</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Metinca Global Corp" 
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-color)]"
            />
            {errors.name && <span className="text-[var(--error-color)] text-[10px]">{errors.name}</span>}
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Negara Tujuan</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Singapore" 
              value={data.country}
              onChange={(e) => setData('country', e.target.value)}
              className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-color)]"
            />
            {errors.country && <span className="text-[var(--error-color)] text-[10px]">{errors.country}</span>}
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Alamat Lengkap Kantor</label>
            <textarea 
              placeholder="e.g. 10 Marina Boulevard, Singapore" 
              value={data.address}
              onChange={(e) => setData('address', e.target.value)}
              className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] h-20 focus:outline-none focus:border-[var(--primary-color)]"
            />
            {errors.address && <span className="text-[var(--error-color)] text-[10px]">{errors.address}</span>}
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Tax ID / NPWP (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. SG-98127398" 
              value={data.tax_id}
              onChange={(e) => setData('tax_id', e.target.value)}
              className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Narahubung & Kontak</label>
            <input 
              type="text" 
              placeholder="e.g. John Doe (+65 9123 4567)" 
              value={data.contact}
              onChange={(e) => setData('contact', e.target.value)}
              className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={processing}
              className="bg-[var(--primary-color)] text-white font-bold px-4 py-2 rounded cursor-pointer disabled:opacity-50"
            >
              {processing ? 'Menyimpan...' : 'Tambah Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
