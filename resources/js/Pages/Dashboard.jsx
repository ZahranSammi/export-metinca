import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import TopBanner from '../Components/Layout/TopBanner';
import Sidebar from '../Components/Layout/Sidebar';
import KpiWidgets from '../Components/Dashboard/KpiWidgets';
import ShipmentTable from '../Components/Dashboard/ShipmentTable';
import AuditTrailGlobal from '../Components/Dashboard/AuditTrailGlobal';
import ShipmentDetail from '../Components/Shipment/ShipmentDetail';

// Modals
import CreateShipmentModal from '../Components/Modals/CreateShipmentModal';
import UploadDocumentModal from '../Components/Modals/UploadDocumentModal';
import GenerateDocumentModal from '../Components/Modals/GenerateDocumentModal';
import RequestDocumentModal from '../Components/Modals/RequestDocumentModal';
import SalesUploadDocumentModal from '../Components/Modals/SalesUploadDocumentModal';
import ReviewDocumentModal from '../Components/Modals/ReviewDocumentModal';
import PaymentModal from '../Components/Modals/PaymentModal';
import CustomerModal from '../Components/Modals/CustomerModal';

export default function Dashboard({ auth, shipments = [], customers = [], auditLogs = [], unreadNotifications = [], flash = {} }) {
  const role = auth?.user?.role || 'sales';

  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [showGenerateDocModal, setShowGenerateDocModal] = useState(false);
  const [showRequestDocModal, setShowRequestDocModal] = useState(false);
  const [showSalesUploadModal, setShowSalesUploadModal] = useState(false);
  const [activeDocRequest, setActiveDocRequest] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [reviewDoc, setReviewDoc] = useState(null);

  // Sync selected shipment details on prop reload
  useEffect(() => {
    if (selectedShipment) {
      const updated = shipments.find(s => s.id === selectedShipment.id);
      if (updated) {
        setSelectedShipment(updated);
      }
    }
  }, [shipments]);

  const handleOpenReviewModal = (doc) => {
    setReviewDoc(doc);
    setShowReviewModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-main)]">
      <Head title="Dashboard - PT Metinca Export" />

      {/* Top Banner layout */}
      <TopBanner 
        auth={auth} 
        unreadNotifications={unreadNotifications} 
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav */}
        <Sidebar 
          role={role}
          selectedShipment={selectedShipment}
          setSelectedShipment={setSelectedShipment}
          setShowCreateModal={setShowCreateModal}
          setShowDocUploadModal={setShowDocUploadModal}
          setShowPaymentModal={setShowPaymentModal}
          setShowCustomerModal={setShowCustomerModal}
        />

        {/* Main Workspace */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          {flash.success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded text-xs">
              {flash.success}
            </div>
          )}
          {flash.error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-2 rounded text-xs">
              {flash.error}
            </div>
          )}

          {selectedShipment === null ? (
            // Home Dashboard Summary Screen
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[var(--text-main)]">Dashboard Ringkasan Ekspor</h2>
                <p className="text-xs text-[var(--text-muted)]">Memantau semua transaksi aktif PT Metinca.</p>
              </div>

              <KpiWidgets shipments={shipments} />

              <ShipmentTable 
                shipments={shipments} 
                customers={customers} 
                setSelectedShipment={setSelectedShipment} 
              />

              <AuditTrailGlobal auditLogs={auditLogs} />
            </div>
          ) : (
            // Details Screen workspace
            <ShipmentDetail
              shipment={selectedShipment}
              role={role}
              setSelectedShipment={setSelectedShipment}
              onOpenUploadModal={() => setShowDocUploadModal(true)}
              onOpenGenerateModal={() => setShowGenerateDocModal(true)}
              onOpenRequestModal={() => setShowRequestDocModal(true)}
              onOpenSalesUploadModal={(req) => { setActiveDocRequest(req); setShowSalesUploadModal(true); }}
              onOpenReviewModal={handleOpenReviewModal}
              onOpenPaymentModal={() => setShowPaymentModal(true)}
            />
          )}
        </main>
      </div>

      {/* Forms and Action Modals */}
      <CreateShipmentModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        customers={customers}
      />

      <UploadDocumentModal
        isOpen={showDocUploadModal}
        onClose={() => setShowDocUploadModal(false)}
        shipment={selectedShipment}
        role={role}
      />

      <GenerateDocumentModal
        isOpen={showGenerateDocModal}
        onClose={() => setShowGenerateDocModal(false)}
        shipment={selectedShipment}
      />

      <RequestDocumentModal
        isOpen={showRequestDocModal}
        onClose={() => setShowRequestDocModal(false)}
        shipment={selectedShipment}
      />

      <SalesUploadDocumentModal
        isOpen={showSalesUploadModal}
        onClose={() => { setShowSalesUploadModal(false); setActiveDocRequest(null); }}
        shipment={selectedShipment}
        documentRequest={activeDocRequest}
      />

      <ReviewDocumentModal 
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        document={reviewDoc}
      />

      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        shipment={selectedShipment}
      />

      <CustomerModal 
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
      />
    </div>
  );
}
