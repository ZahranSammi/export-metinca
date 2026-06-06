import React from 'react';

export default function ItemsTable({ items = [] }) {
  return (
    <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-5 rounded-md shadow-sm">
      <h3 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider mb-3">Daftar Barang Ekspor</h3>
      <div className="border border-[var(--border-color)] rounded-md overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[var(--surface-elevated)] border-b border-[var(--border-color)] text-[10px] text-slate-500 font-mono">
              <th className="p-3">Deskripsi Barang</th>
              <th className="p-3">HS Code</th>
              <th className="p-3 text-right">Qty</th>
              <th className="p-3 text-right">Harga Satuan</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="text-xs divide-y divide-[var(--border-color)]">
            {items.map((item, idx) => (
              <tr key={idx}>
                <td className="p-3 text-[var(--text-main)]">{item.description}</td>
                <td className="p-3 font-mono text-slate-500">{item.hs_code || 'TBD'}</td>
                <td className="p-3 text-right font-mono">{item.qty}</td>
                <td className="p-3 text-right font-mono">{item.currency} {parseFloat(item.unit_price).toFixed(2)}</td>
                <td className="p-3 text-right font-mono font-bold text-[var(--primary-color)]">
                  {item.currency} {(item.qty * item.unit_price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
