import React from 'react';
import { useForm } from '@inertiajs/react';

export default function GenerateDocumentModal({ isOpen, onClose, shipment }) {
  if (!isOpen || !shipment) return null;

  const { data, setData, post, processing, errors, reset } = useForm({
    type: 'Commercial Invoice',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(`/export/shipments/${shipment.id}/generate-document`, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  const docTypes = [
    { value: 'Commercial Invoice', label: 'Commercial Invoice', desc: 'Tagihan resmi ekspor berdasarkan data pesanan' },
    { value: 'Packing List',       label: 'Packing List',       desc: 'Daftar kemasan dan isi barang ekspor' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-md max-w-md w-full p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
          <h3 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">Buat Dokumen Ekspor</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-transparent border-0 text-xl cursor-pointer">&times;</button>
        </div>

        <p className="text-[10px] text-[var(--text-muted)]">
          Dokumen akan dibuat secara otomatis dari data shipment <span className="font-bold font-mono text-[var(--primary-color)]">{shipment.po_number}</span> dan disimpan sebagai <span className="font-bold">Draft</span> untuk ditinjau.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-500 mb-2">Pilih Jenis Dokumen</label>
            <div className="space-y-2">
              {docTypes.map((dt) => (
                <label
                  key={dt.value}
                  className={`flex items-start gap-3 p-3 border rounded cursor-pointer transition-colors ${
                    data.type === dt.value
                      ? 'border-[var(--primary-color)] bg-orange-50'
                      : 'border-[var(--border-color)] hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={dt.value}
                    checked={data.type === dt.value}
                    onChange={(e) => setData('type', e.target.value)}
                    className="mt-0.5 accent-[var(--primary-color)]"
                  />
                  <div>
                    <div className="font-bold text-[var(--text-main)]">{dt.label}</div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{dt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.type && <span className="text-rose-600 text-[10px] block mt-1">{errors.type}</span>}
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 text-slate-700 px-4 py-2 rounded cursor-pointer border-0"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={processing}
              className="bg-[var(--primary-color)] text-white font-bold px-4 py-2 rounded cursor-pointer border-0 disabled:opacity-50"
            >
              {processing ? 'Membuat Dokumen...' : 'Buat & Simpan Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
