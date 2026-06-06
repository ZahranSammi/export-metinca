import React from 'react';
import { useForm } from '@inertiajs/react';

export default function PaymentModal({ isOpen, onClose, shipment }) {
  if (!isOpen || !shipment) return null;

  const { data, setData, post, processing, progress, errors, reset } = useForm({
    vendor_name: '',
    amount: '',
    currency: 'IDR',
    invoice: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.vendor_name || !data.amount) return;

    post(`/finance/shipments/${shipment.id}/invoices`, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-md max-w-md w-full p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
          <h3 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">Tambah Tagihan Vendor / Forwarder</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-transparent border-0 text-xl cursor-pointer">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-500 mb-1">Nama Vendor / Agen Forwarder</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Duta Samudera Logistics" 
              value={data.vendor_name}
              onChange={(e) => setData('vendor_name', e.target.value)}
              className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-color)]"
            />
            {errors.vendor_name && <span className="text-[var(--error-color)] text-[10px]">{errors.vendor_name}</span>}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-slate-500 mb-1">Jumlah Tagihan</label>
              <input 
                type="number" 
                required
                placeholder="e.g. 15000000" 
                value={data.amount}
                onChange={(e) => setData('amount', e.target.value)}
                className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] focus:outline-none"
              />
              {errors.amount && <span className="text-[var(--error-color)] text-[10px]">{errors.amount}</span>}
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Mata Uang</label>
              <select
                value={data.currency}
                onChange={(e) => setData('currency', e.target.value)}
                className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)]"
              >
                <option value="IDR">IDR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Unggah Berkas Invoice Tagihan (Opsional - PDF/Gambar)</label>
            <input 
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setData('invoice', e.target.files[0])}
              className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] focus:outline-none"
            />
            {errors.invoice && <span className="text-[var(--error-color)] text-[10px]">{errors.invoice}</span>}
          </div>

          {progress && (
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[var(--primary-color)] h-full" style={{ width: `${progress.percentage}%` }}></div>
            </div>
          )}

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
              {processing ? 'Menyimpan...' : 'Ajukan Tagihan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
