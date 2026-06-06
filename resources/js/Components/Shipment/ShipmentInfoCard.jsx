import React from 'react';
import { useForm } from '@inertiajs/react';

export default function ShipmentInfoCard({ shipment, role }) {
  const cust = shipment.customer || {};
  
  const { data, setData, put, processing, errors } = useForm({
    port_loading: shipment.port_loading || '',
    port_discharge: shipment.port_discharge || '',
    hs_code: shipment.shipment_items?.[0]?.hs_code || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(`/export/shipments/${shipment.id}/details`);
  };

  return (
    <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-5 rounded-md space-y-4 shadow-sm">
      <h3 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider border-b border-[var(--border-color)] pb-2">Informasi Umum</h3>
      
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-[var(--text-muted)] block">Nama Customer</span>
          <span className="font-bold text-[var(--text-main)]">{cust.name}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)] block">Negara Tujuan</span>
          <span className="font-bold text-[var(--text-main)]">{cust.country}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)] block">Incoterms</span>
          <span className="font-mono text-[var(--primary-color)] font-bold">{shipment.incoterms}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)] block">NPWP / Tax ID</span>
          <span className="font-mono text-[var(--text-main)]">{cust.tax_id || '-'}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)] block">Pelabuhan Muat (POL)</span>
          <span className="text-[var(--text-main)]">{shipment.port_loading || 'Belum diisi'}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)] block">Pelabuhan Bongkar (POD)</span>
          <span className="text-[var(--text-main)]">{shipment.port_discharge || 'Belum diisi'}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)] block">ETD / ETA</span>
          <span className="font-mono text-[var(--text-main)]">{shipment.etd || 'TBD'} / {shipment.eta || 'TBD'}</span>
        </div>
        <div>
          <span className="text-[var(--text-muted)] block">Berkas PO Customer</span>
          {shipment.po_file_path ? (
            <a href={`/storage/${shipment.po_file_path}`} target="_blank" rel="noreferrer" className="text-[var(--primary-color)] hover:underline font-mono">📄 Lihat Berkas PO</a>
          ) : (
            <span className="text-slate-400 italic">Tidak ada</span>
          )}
        </div>
      </div>

      {role === 'export_staff' && shipment.status === 'SENT_TO_EXPORT' && (
        <form onSubmit={handleSubmit} className="border-t border-[var(--border-color)] pt-4 mt-2 space-y-3">
          <span className="text-[10px] font-mono text-[var(--primary-color)] block uppercase">Lengkapi Data Pengapalan (Staff Export)</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">POL (Pelabuhan Muat)</label>
              <input 
                type="text" 
                placeholder="e.g. Tanjung Priok" 
                value={data.port_loading}
                onChange={(e) => setData('port_loading', e.target.value)}
                className="bg-[var(--surface-color)] border border-[var(--border-color)] text-xs text-[var(--text-main)] rounded px-2.5 py-1.5 w-full focus:outline-none focus:border-[var(--primary-color)]"
              />
              {errors.port_loading && <span className="text-[var(--error-color)] text-[10px]">{errors.port_loading}</span>}
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">POD (Pelabuhan Bongkar)</label>
              <input 
                type="text" 
                placeholder="e.g. Singapore" 
                value={data.port_discharge}
                onChange={(e) => setData('port_discharge', e.target.value)}
                className="bg-[var(--surface-color)] border border-[var(--border-color)] text-xs text-[var(--text-main)] rounded px-2.5 py-1.5 w-full focus:outline-none focus:border-[var(--primary-color)]"
              />
              {errors.port_discharge && <span className="text-[var(--error-color)] text-[10px]">{errors.port_discharge}</span>}
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">HS Code Utama</label>
              <input 
                type="text" 
                placeholder="e.g. 7306.30.00" 
                value={data.hs_code}
                onChange={(e) => setData('hs_code', e.target.value)}
                className="bg-[var(--surface-color)] border border-[var(--border-color)] text-xs text-[var(--text-main)] rounded px-2.5 py-1.5 w-full focus:outline-none focus:border-[var(--primary-color)]"
              />
              {errors.hs_code && <span className="text-[var(--error-color)] text-[10px]">{errors.hs_code}</span>}
            </div>
          </div>
          <button
            type="submit"
            disabled={processing}
            className="bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold px-3 py-1.5 rounded transition-colors cursor-pointer disabled:opacity-50"
          >
            {processing ? 'Menyimpan...' : 'Simpan Rincian Pengapalan'}
          </button>
        </form>
      )}
    </div>
  );
}
