import React from 'react';
import { useForm } from '@inertiajs/react';

export default function RequestDocumentModal({ isOpen, onClose, shipment }) {
  if (!isOpen || !shipment) return null;

  const { data, setData, post, processing, errors, reset } = useForm({
    document_type: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(`/export/shipments/${shipment.id}/request-document`, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  const commonTypes = [
    'Surat Keterangan Asal (COO)',
    'Data Teknis / Spesifikasi Barang',
    'Foto Produk',
    'Sertifikat Mutu / Quality Certificate',
    'Dokumen Fumigasi',
    'Sertifikat Phytosanitary',
    'Lainnya',
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-md max-w-md w-full p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
          <h3 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">Minta Dokumen ke Sales</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-transparent border-0 text-xl cursor-pointer">&times;</button>
        </div>

        <p className="text-[10px] text-[var(--text-muted)]">
          Permintaan akan dikirim ke Sales pemilik PO{' '}
          <span className="font-bold font-mono text-[var(--primary-color)]">{shipment.po_number}</span>.
          Sales akan menerima notifikasi dan dapat mengunggah dokumen yang diminta.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-500 mb-1">Jenis Dokumen yang Diminta <span className="text-rose-500">*</span></label>
            <select
              value={data.document_type}
              onChange={(e) => setData('document_type', e.target.value)}
              className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)]"
              required
            >
              <option value="">-- Pilih jenis dokumen --</option>
              {commonTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.document_type && <span className="text-rose-600 text-[10px] block mt-1">{errors.document_type}</span>}
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Pesan / Instruksi ke Sales (opsional)</label>
            <textarea
              value={data.message}
              onChange={(e) => setData('message', e.target.value)}
              rows={3}
              placeholder="Contoh: Mohon sertakan sertifikat COO format A..."
              className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] resize-none focus:outline-none focus:border-[var(--primary-color)]"
            />
            {errors.message && <span className="text-rose-600 text-[10px] block mt-1">{errors.message}</span>}
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="bg-slate-100 text-slate-700 px-4 py-2 rounded cursor-pointer border-0">
              Batal
            </button>
            <button
              type="submit"
              disabled={processing || !data.document_type}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded cursor-pointer border-0 disabled:opacity-50"
            >
              {processing ? 'Mengirim...' : 'Kirim Permintaan ke Sales'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
