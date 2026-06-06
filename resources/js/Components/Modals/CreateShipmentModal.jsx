import React from 'react';
import { useForm } from '@inertiajs/react';

export default function CreateShipmentModal({ isOpen, onClose, customers = [] }) {
  if (!isOpen) return null;

  const { data, setData, post, processing, progress, errors, reset } = useForm({
    po_number: '',
    customer_id: customers[0]?.id || '',
    incoterms: 'FOB',
    etd: '',
    eta: '',
    po_file: null,
    description: '',
    qty: 1,
    unit_price: 0.00,
    currency: 'USD',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/sales/shipments', {
      forceFormData: true,
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
          <h3 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">Buat Kontrak Ekspor (PO)</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-transparent border-0 text-xl cursor-pointer">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-500 mb-1">Nomor PO Buyer</label>
            <input 
              type="text" 
              required
              placeholder="e.g. PO-2026-999"
              value={data.po_number}
              onChange={(e) => setData('po_number', e.target.value)}
              className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-color)]"
            />
            {errors.po_number && <span className="text-[var(--error-color)] text-[10px]">{errors.po_number}</span>}
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Pilih Customer</label>
            <select 
              value={data.customer_id}
              onChange={(e) => setData('customer_id', e.target.value)}
              className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-color)]"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.country})</option>
              ))}
            </select>
            {errors.customer_id && <span className="text-[var(--error-color)] text-[10px]">{errors.customer_id}</span>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 mb-1">Incoterms</label>
              <select 
                value={data.incoterms}
                onChange={(e) => setData('incoterms', e.target.value)}
                className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] focus:outline-none"
              >
                <option value="FOB">FOB (Free On Board)</option>
                <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                <option value="EXW">EXW (Ex Works)</option>
              </select>
              {errors.incoterms && <span className="text-[var(--error-color)] text-[10px]">{errors.incoterms}</span>}
            </div>
            <div>
              <label className="block text-slate-500 mb-1">Mata Uang</label>
              <select 
                value={data.currency}
                onChange={(e) => setData('currency', e.target.value)}
                className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] focus:outline-none"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="IDR">IDR</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 mb-1">ETD (Estimasi Berangkat)</label>
              <input
                type="date"
                value={data.etd}
                onChange={(e) => setData('etd', e.target.value)}
                className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-color)]"
              />
              {errors.etd && <span className="text-[var(--error-color)] text-[10px]">{errors.etd}</span>}
            </div>
            <div>
              <label className="block text-slate-500 mb-1">ETA (Estimasi Tiba)</label>
              <input
                type="date"
                value={data.eta}
                onChange={(e) => setData('eta', e.target.value)}
                className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-color)]"
              />
              {errors.eta && <span className="text-[var(--error-color)] text-[10px]">{errors.eta}</span>}
            </div>
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Unggah Berkas PO Customer (Opsional - PDF/Gambar, Maks 25MB)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setData('po_file', e.target.files[0])}
              className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] focus:outline-none"
            />
            {errors.po_file && <span className="text-[var(--error-color)] text-[10px]">{errors.po_file}</span>}
          </div>

          {progress && (
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[var(--primary-color)] h-full transition-all" style={{ width: `${progress.percentage}%` }}></div>
            </div>
          )}

          <div className="border-t border-[var(--border-color)] pt-3 mt-3">
            <span className="font-bold text-[var(--text-main)] block mb-2">Item Barang</span>
            <div className="space-y-2">
              <div>
                <label className="block text-slate-500 mb-1">Nama Barang</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Copper wire coil" 
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-color)]"
                />
                {errors.description && <span className="text-[var(--error-color)] text-[10px]">{errors.description}</span>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Qty (Pcs/Tons)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="100" 
                    value={data.qty}
                    onChange={(e) => setData('qty', e.target.value)}
                    className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] focus:outline-none"
                  />
                  {errors.qty && <span className="text-[var(--error-color)] text-[10px]">{errors.qty}</span>}
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Harga per Unit ($)</label>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    placeholder="45.00" 
                    value={data.unit_price}
                    onChange={(e) => setData('unit_price', e.target.value)}
                    className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] focus:outline-none"
                  />
                  {errors.unit_price && <span className="text-[var(--error-color)] text-[10px]">{errors.unit_price}</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded hover:bg-slate-200 cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={processing}
              className="bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white font-bold px-4 py-2 rounded cursor-pointer disabled:opacity-50"
            >
              {processing ? 'Menyimpan...' : 'Buat Shipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
