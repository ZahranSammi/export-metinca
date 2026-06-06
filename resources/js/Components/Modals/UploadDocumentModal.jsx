import React from 'react';
import { useForm } from '@inertiajs/react';

export default function UploadDocumentModal({ isOpen, onClose, shipment, role }) {
  if (!isOpen || !shipment) return null;

  const { data, setData, post, processing, progress, errors, reset } = useForm({
    document: null,
    type: 'Purchase Order (PO)',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.document) return;

    const url = role === 'forwarder' 
      ? `/forwarder/shipments/${shipment.id}/customs-doc`
      : `/export/shipments/${shipment.id}/documents`;

    post(url, {
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
          <h3 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">Unggah Dokumen Ekspor</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-transparent border-0 text-xl cursor-pointer">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-500 mb-1">Jenis Dokumen</label>
            <select
              value={data.type}
              onChange={(e) => setData('type', e.target.value)}
              className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)]"
            >
              {role === 'forwarder' ? (
                <>
                  <option value="PEB Final">PEB Final</option>
                  <option value="NPE (Nota Pelayanan Ekspor)">NPE (Nota Pelayanan Ekspor)</option>
                  <option value="Customs Declaration">Customs Declaration</option>
                </>
              ) : (
                <>
                  <option value="Purchase Order (PO)">Purchase Order (PO)</option>
                  <option value="Commercial Invoice">Commercial Invoice</option>
                  <option value="Packing List">Packing List</option>
                  <option value="Bill of Lading (B/L)">Bill of Lading (B/L)</option>
                  <option value="Certificate of Origin (COO)">Certificate of Origin (COO)</option>
                  <option value="PEB Draft">PEB Draft</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Pilih Berkas Dokumen (PDF, JPG, PNG - Maks 25MB)</label>
            <input 
              type="file" 
              required
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setData('document', e.target.files[0])}
              className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] focus:outline-none"
            />
            {errors.document && <span className="text-[var(--error-color)] text-[10px] block mt-1">{errors.document}</span>}
          </div>

          {progress && (
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[var(--primary-color)] h-full transition-all" style={{ width: `${progress.percentage}%` }}></div>
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
              {processing ? 'Mengunggah...' : 'Unggah & Ajukan Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
