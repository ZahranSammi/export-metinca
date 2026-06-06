import React from 'react';
import { router } from '@inertiajs/react';
import { getStatusBadge } from '../../Utils/status';
import ShipmentInfoCard from './ShipmentInfoCard';
import ItemsTable from './ItemsTable';
import DocumentList from './DocumentList';
import PaymentList from './PaymentList';
import AuditTimeline from './AuditTimeline';

export default function ShipmentDetail({ shipment, role, setSelectedShipment, onOpenUploadModal, onOpenReviewModal, onOpenPaymentModal, onOpenGenerateModal, onOpenRequestModal, onOpenSalesUploadModal }) {
  const requiredTypes = ['Commercial Invoice', 'Packing List'];
  const uploadedTypes = (shipment.documents || []).map(d => d.type);
  const isDocumentComplete = requiredTypes.every(type => uploadedTypes.includes(type));

  const handleSalesSubmit = () => {
    router.post(`/sales/shipments/${shipment.id}/submit`, {}, {
      onSuccess: (page) => {
        // Update local detail state if needed
        const updated = page.props.shipments.find(s => s.id === shipment.id);
        if (updated) setSelectedShipment(updated);
      }
    });
  };

  const handleExportSubmitReview = () => {
    router.post(`/export/shipments/${shipment.id}/submit-review`, {}, {
      onSuccess: (page) => {
        const updated = page.props.shipments.find(s => s.id === shipment.id);
        if (updated) setSelectedShipment(updated);
      }
    });
  };

  const handleSendToForwarder = () => {
    router.post(`/export/shipments/${shipment.id}/send-forwarder`, {}, {
      onSuccess: (page) => {
        const updated = page.props.shipments.find(s => s.id === shipment.id);
        if (updated) setSelectedShipment(updated);
      }
    });
  };

  const handleArchive = () => {
    router.post(`/export/shipments/${shipment.id}/archive`, {}, {
      onSuccess: (page) => {
        const updated = page.props.shipments.find(s => s.id === shipment.id);
        if (updated) setSelectedShipment(updated);
      }
    });
  };

  const handleForwarderStatus = (nextStatus) => {
    router.post(`/forwarder/shipments/${shipment.id}/update-status`, { status: nextStatus }, {
      onSuccess: (page) => {
        const updated = page.props.shipments.find(s => s.id === shipment.id);
        if (updated) setSelectedShipment(updated);
      }
    });
  };

  const handleConfirmDelivery = () => {
    const notes = prompt('Masukkan catatan konfirmasi pengiriman tiba:');
    router.post(`/forwarder/shipments/${shipment.id}/confirm-delivery`, { notes }, {
      onSuccess: (page) => {
        const updated = page.props.shipments.find(s => s.id === shipment.id);
        if (updated) setSelectedShipment(updated);
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Detail Header */}
      <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedShipment(null)}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface-color)] border border-[var(--border-color)] rounded transition-colors bg-transparent cursor-pointer"
          >
            &larr; Back
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[var(--text-main)] font-mono">{shipment.po_number}</h2>
              {getStatusBadge(shipment.status)}
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Dibuat pada {new Date(shipment.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Sales Gate Submit */}
          {role === 'sales' && shipment.status === 'DRAFT' && (
            <button
              onClick={handleSalesSubmit}
              className="bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white font-bold text-xs px-4 py-2 rounded transition-colors border-0 cursor-pointer"
            >
              Kirim ke Ekspor
            </button>
          )}

          {/* Staff Export Block Validation */}
          {role === 'export_staff' && shipment.status === 'PAYMENT_VERIFIED' && (
            <button
              onClick={handleSendToForwarder}
              className="bg-[var(--success-color)] hover:opacity-90 text-white font-bold text-xs px-4 py-2 rounded transition-colors border-0 cursor-pointer"
            >
              Kirim ke Forwarder
            </button>
          )}

          {/* Staff Export Submit for Review */}
          {role === 'export_staff' && ['SENT_TO_EXPORT', 'IN_PROGRESS', 'REVISED'].includes(shipment.status) && (
            <button
              onClick={handleExportSubmitReview}
              disabled={!isDocumentComplete}
              className={`font-bold text-xs px-4 py-2 rounded transition-colors border-0 cursor-pointer ${
                isDocumentComplete 
                  ? 'bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              title={!isDocumentComplete ? 'Unggah dokumen wajib (Commercial Invoice & Packing List) terlebih dahulu' : ''}
            >
              Ajukan Approval
            </button>
          )}

          {/* Forwarder Status Buttons */}
          {role === 'forwarder' && shipment.status === 'SENT_TO_FORWARDER' && (
            <button
              onClick={() => handleForwarderStatus('IN_CUSTOMS')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded transition-colors border-0 cursor-pointer"
            >
              Mulai Proses Bea Cukai (IN CUSTOMS)
            </button>
          )}

          {role === 'forwarder' && shipment.status === 'IN_CUSTOMS' && (
            <button
              onClick={() => handleForwarderStatus('SHIPPED')}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs px-4 py-2 rounded transition-colors border-0 cursor-pointer"
            >
              Konfirmasi Barang Dikapalkan (SHIPPED)
            </button>
          )}

          {role === 'forwarder' && shipment.status === 'SHIPPED' && (
            <button
              onClick={handleConfirmDelivery}
              className="bg-[var(--success-color)] hover:opacity-90 text-white font-bold text-xs px-4 py-2 rounded transition-colors border-0 cursor-pointer"
            >
              Konfirmasi Tiba (DELIVERED)
            </button>
          )}

          {/* Staff Export Archive */}
          {role === 'export_staff' && shipment.status === 'DELIVERED' && (
            <button
              onClick={handleArchive}
              className="bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded transition-colors border-0 cursor-pointer"
            >
              Pindahkan ke Arsip
            </button>
          )}
        </div>
      </div>

      {/* Main Detail Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ShipmentInfoCard shipment={shipment} role={role} />
          <ItemsTable items={shipment.shipment_items} />
          <DocumentList
            shipment={shipment}
            role={role}
            onOpenUploadModal={onOpenUploadModal}
            onOpenReviewModal={onOpenReviewModal}
            onOpenGenerateModal={onOpenGenerateModal}
            onOpenRequestModal={onOpenRequestModal}
            onOpenSalesUploadModal={onOpenSalesUploadModal}
          />
          <PaymentList 
            shipment={shipment} 
            role={role} 
            onOpenPaymentModal={onOpenPaymentModal} 
          />
        </div>

        <div className="space-y-6">
          <AuditTimeline statusLogs={shipment.status_logs} />
        </div>
      </div>
    </div>
  );
}
