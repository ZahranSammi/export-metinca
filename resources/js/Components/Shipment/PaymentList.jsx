import React from 'react';
import { router } from '@inertiajs/react';

export default function PaymentList({ shipment, role, onOpenPaymentModal }) {
  const payments = shipment.payments || [];

  const handleValidate = (paymentId, status) => {
    if (status === 'HOLD') {
      const comment = prompt('Masukkan catatan penundaan pembayaran (HOLD):');
      if (!comment) return;
      router.post(`/finance/payments/${paymentId}/validate/HOLD`, { comment });
    } else if (status === 'PARTIAL') {
      const comment = prompt('Masukkan catatan pembayaran sebagian (mis. nominal/termin yang sudah dibayar):');
      if (!comment) return;
      router.post(`/finance/payments/${paymentId}/validate/PARTIAL`, { comment });
    } else {
      router.post(`/finance/payments/${paymentId}/validate/PAID`);
    }
  };

  const handleFileChange = (paymentId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    router.post(`/finance/payments/${paymentId}/upload-proof`, {
      _method: 'POST',
      proof: file
    }, {
      forceFormData: true,
    });
  };

  return (
    <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-5 rounded-md shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">Status Pembayaran Vendor/Forwarder (Gate)</h3>
        {role === 'finance' && (
          <button 
            onClick={onOpenPaymentModal}
            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[11px] px-2.5 py-1 rounded transition-colors font-mono font-bold border-0 cursor-pointer"
          >
            + INPUT TAGIHAN
          </button>
        )}
      </div>

      <div className="space-y-3">
        {payments.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 italic">Belum ada tagihan vendor yang diinput.</div>
        ) : (
          payments.map(p => (
            <div key={p.id} className="bg-[var(--surface-elevated)] border border-[var(--border-color)] p-3 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-xs text-[var(--text-main)]">{p.vendor_name}</div>
                  <div className="text-[10px] font-mono text-[var(--primary-color)] mt-0.5 font-bold">
                    {p.currency} {parseFloat(p.amount).toLocaleString()}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono mt-1">
                    {p.invoice_path && (
                      <a href={`/storage/${p.invoice_path}`} target="_blank" rel="noreferrer" className="text-[var(--primary-color)] hover:underline mr-3">
                        📄 Unduh Invoice
                      </a>
                    )}
                    {p.proof_path && (
                      <a href={`/storage/${p.proof_path}`} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">
                        🧾 Unduh Bukti Bayar
                      </a>
                    )}
                  </div>
                  {p.comment && (
                    <div className="text-[10px] text-rose-600 font-mono mt-1 bg-rose-50 p-1 rounded border border-rose-100">
                      Catatan: {p.comment}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    {p.status === 'PAID' && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-emerald-100 text-emerald-800">PAID</span>}
                    {p.status === 'PARTIAL' && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-sky-100 text-sky-800">PARTIAL</span>}
                    {p.status === 'HOLD' && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-rose-100 text-rose-800">HOLD</span>}
                    {p.status === 'UNPAID' && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-amber-100 text-amber-800">UNPAID</span>}

                    {role === 'finance' && p.status !== 'PAID' && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleValidate(p.id, 'PAID')}
                          className="bg-[var(--success-color)] text-white font-bold text-[10px] px-2 py-1 rounded font-mono hover:opacity-90 transition-colors border-0 cursor-pointer"
                        >
                          LUNAS
                        </button>
                        <button
                          onClick={() => handleValidate(p.id, 'PARTIAL')}
                          className="bg-sky-600 text-white text-[10px] px-2 py-1 rounded font-mono hover:opacity-90 transition-colors border-0 cursor-pointer"
                        >
                          PARSIAL
                        </button>
                        <button
                          onClick={() => handleValidate(p.id, 'HOLD')}
                          className="bg-[var(--error-color)] text-white text-[10px] px-2 py-1 rounded font-mono hover:opacity-90 transition-colors border-0 cursor-pointer"
                        >
                          HOLD
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Upload payment proof input for Finance */}
                  {role === 'finance' && !p.proof_path && (
                    <div className="mt-1">
                      <label className="block text-[9px] text-slate-500 font-mono mb-1 text-right">Unggah Bukti Bayar</label>
                      <input 
                        type="file" 
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(p.id, e)}
                        className="text-[9px] w-40 text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
