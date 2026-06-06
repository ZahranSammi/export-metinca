import React from 'react';
import { useForm } from '@inertiajs/react';

export default function SalesUploadDocumentModal({ isOpen, onClose, shipment, documentRequest }) {
  if (!isOpen || !shipment) return null;

  // documentRequest opsional — jika ada, pre-fill dari request Staff
  const { data, setData, post, processing, progress, errors, reset } = useForm({
    document: null,
    type: documentRequest?.document_type || '',
    request_id: documentRequest?.id || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.document) return;

    post(`/sales/shipments/${shipment.id}/documents`, {
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
          <h3 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">
            {documentRequest ? 'Penuhi Permintaan Dokumen' : 'Unggah Dokumen Pendukung'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-transparent border-0 text-xl cursor-pointer">&times;</button>
        </div>

        {documentRequest && (
          <div className="bg-amber-50 border border-amber-200 rounded p-3 text-[10px]">
            <div className="font-bold text-amber-800 mb-1">📋 Permintaan dari Export Staff</div>
            <div className="text-amber-700">Dokumen: <span className="font-bold">{documentRequest.document_type}</span></div>
            {documentRequest.message && (
              <div className="text-amber-600 mt-1 italic">"{documentRequest.message}"</div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-500 mb-1">Jenis Dokumen <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={data.type}
              onChange={(e) => setData('type', e.target.value)}
              placeholder="e.g. Surat Keterangan Asal (COO)"
              className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-color)]"
            />
            {errors.type && <span className="text-rose-600 text-[10px] block mt-1">{errors.type}</span>}
          </div>

          <div>
            <label className="block text-slate-500 mb-1">Pilih Berkas (PDF/JPG/PNG - Maks 25MB) <span className="text-rose-500">*</span></label>
            <input
              type="file"
              required
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setData('document', e.target.files[0])}
              className="w-full bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-2 text-[var(--text-main)] focus:outline-none"
            />
            {errors.document && <span className="text-rose-600 text-[10px] block mt-1">{errors.document}</span>}
          </div>

          {progress && (
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[var(--primary-color)] h-full transition-all" style={{ width: `${progress.percentage}%` }}></div>
            </div>
          )}

          <div className="pt-3 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="bg-slate-100 text-slate-700 px-4 py-2 rounded cursor-pointer border-0">
              Batal
            </button>
            <button
              type="submit"
              disabled={processing}
              className="bg-[var(--primary-color)] text-white font-bold px-4 py-2 rounded cursor-pointer border-0 disabled:opacity-50"
            >
              {processing ? 'Mengunggah...' : 'Unggah Dokumen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
