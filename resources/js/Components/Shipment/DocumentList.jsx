import React from 'react';

const REQUIRED_DOCS = ['Commercial Invoice', 'Packing List'];

export default function DocumentList({ shipment, role, onOpenUploadModal, onOpenReviewModal, onOpenGenerateModal, onOpenRequestModal, onOpenSalesUploadModal }) {
  const documents = shipment.documents || [];
  const documentRequests = shipment.document_requests || [];
  const pendingRequests = documentRequests.filter(r => r.status === 'PENDING');

  const isProcessingStatus = ['SENT_TO_EXPORT', 'IN_PROGRESS', 'REVISED'].includes(shipment.status);
  const uploadedByType = Object.fromEntries(
    REQUIRED_DOCS.map(type => [type, documents.filter(d => d.type === type).sort((a, b) => b.version - a.version)[0] || null])
  );
  const allRequiredPresent = REQUIRED_DOCS.every(type => uploadedByType[type] !== null);

  return (
    <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-5 rounded-md shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">Dokumen Lampiran Ekspor</h3>

        {role === 'export_staff' && (
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={onOpenRequestModal}
              className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 text-[11px] px-2.5 py-1 rounded transition-colors font-mono font-bold cursor-pointer"
            >
              📋 MINTA KE SALES
            </button>
            <button
              onClick={onOpenGenerateModal}
              className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-[11px] px-2.5 py-1 rounded transition-colors font-mono font-bold cursor-pointer"
            >
              ✎ BUAT DOKUMEN
            </button>
            <button
              onClick={onOpenUploadModal}
              className="bg-[var(--secondary-color)] text-[var(--primary-color)] hover:opacity-90 text-[11px] px-2.5 py-1 rounded transition-colors font-mono font-bold border-0 cursor-pointer"
            >
              + UNGGAH DOKUMEN
            </button>
          </div>
        )}

        {role === 'sales' && (
          <button
            onClick={() => onOpenSalesUploadModal && onOpenSalesUploadModal(null)}
            className="bg-[var(--secondary-color)] text-[var(--primary-color)] hover:opacity-90 text-[11px] px-2.5 py-1 rounded transition-colors font-mono font-bold border-0 cursor-pointer"
          >
            + UNGGAH DOKUMEN PENDUKUNG
          </button>
        )}
      </div>

      {/* Pending document requests panel — visible to Sales */}
      {role === 'sales' && pendingRequests.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded p-3 space-y-2">
          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
            📬 Permintaan Dokumen dari Export Staff ({pendingRequests.length})
          </div>
          {pendingRequests.map(req => (
            <div key={req.id} className="flex justify-between items-center bg-white border border-amber-100 rounded p-2">
              <div>
                <div className="text-xs font-bold text-[var(--text-main)]">{req.document_type}</div>
                {req.message && <div className="text-[10px] text-amber-700 italic mt-0.5">"{req.message}"</div>}
                <div className="text-[9px] text-slate-400 font-mono mt-0.5">Diminta oleh: {req.requester?.name || 'Export Staff'}</div>
              </div>
              <button
                onClick={() => onOpenSalesUploadModal && onOpenSalesUploadModal(req)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] px-2.5 py-1 rounded font-mono transition-colors border-0 cursor-pointer"
              >
                UNGGAH
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Verifikasi Kelengkapan Dokumen — checklist for export_staff */}
      {role === 'export_staff' && isProcessingStatus && (
        <div className="mb-4 border border-[var(--border-color)] rounded p-3 bg-[var(--surface-elevated)]">
          <div className="text-[10px] font-bold text-[var(--text-main)] uppercase tracking-wider mb-2">
            Verifikasi Kelengkapan Dokumen
          </div>
          <div className="space-y-1.5">
            {REQUIRED_DOCS.map(type => {
              const doc = uploadedByType[type];
              return (
                <div key={type} className="flex items-center justify-between bg-[var(--surface-color)] border border-[var(--border-color)] rounded px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${doc ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {doc ? '✓' : '✗'}
                    </span>
                    <span className="text-xs text-[var(--text-main)]">{type}</span>
                    <span className="text-[9px] text-rose-500 font-mono border border-rose-200 bg-rose-50 px-1 rounded">WAJIB</span>
                  </div>
                  {doc ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono text-slate-500">v{doc.version}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        doc.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        doc.status === 'REVISED'  ? 'bg-rose-100 text-rose-700' :
                        doc.status === 'IN_REVIEW'? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">Belum diunggah</span>
                  )}
                </div>
              );
            })}
          </div>
          {allRequiredPresent ? (
            <div className="mt-2 text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 rounded px-2 py-1.5">
              Semua dokumen wajib tersedia — siap untuk diajukan approval ke Manager.
            </div>
          ) : (
            <div className="mt-2 text-[10px] text-rose-700 font-bold bg-rose-50 border border-rose-200 rounded px-2 py-1.5">
              Dokumen wajib belum lengkap — harap unggah Commercial Invoice dan Packing List terlebih dahulu.
            </div>
          )}
        </div>
      )}

      {/* Pending requests summary — visible to export_staff */}
      {role === 'export_staff' && pendingRequests.length > 0 && (
        <div className="mb-3 flex items-center gap-2 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          <span className="font-bold">📤 {pendingRequests.length} permintaan dokumen ke Sales belum dipenuhi</span>
          <div className="text-amber-600 font-mono">
            {pendingRequests.map(r => r.document_type).join(', ')}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {documents.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 italic">Belum ada dokumen yang diunggah.</div>
        ) : (
          documents.map(d => (
            <div key={d.id} className="flex justify-between items-center bg-[var(--surface-elevated)] border border-[var(--border-color)] p-3 rounded transition-colors hover:border-slate-300">
              <div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/documents/${d.id}/preview`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-xs text-[var(--primary-color)] hover:underline"
                  >
                    {d.type}
                  </a>
                  <span className="text-[10px] font-mono bg-orange-100 text-[var(--primary-color)] px-1.5 py-0.5 rounded">v{d.version}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  {d.file_name} &bull; Diunggah oleh: {d.uploader?.name || 'Staff'}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {d.status === 'APPROVED' && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-emerald-100 text-emerald-800">APPROVED</span>}
                {d.status === 'REVISED' && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-rose-100 text-rose-800">REVISED</span>}
                {d.status === 'IN_REVIEW' && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-amber-100 text-amber-800">IN REVIEW</span>}
                {d.status === 'DRAFT' && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-slate-100 text-slate-600">DRAFT</span>}

                {role === 'export_manager' && d.status === 'IN_REVIEW' && (
                  <button
                    onClick={() => onOpenReviewModal(d)}
                    className="bg-[var(--primary-color)] text-white font-bold text-[10px] px-2.5 py-1 rounded font-mono hover:bg-[var(--primary-hover)] transition-colors border-0 cursor-pointer"
                  >
                    TINJAU DOKUMEN
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
