import React from 'react';

export const getStatusBadge = (status) => {
  switch (status) {
    case 'DRAFT': 
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-slate-100 text-slate-700">Draft</span>;
    case 'SENT_TO_EXPORT': 
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-100 text-blue-700">Sent To Export</span>;
    case 'IN_PROGRESS': 
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-100 text-amber-700">In Progress</span>;
    case 'IN_REVIEW': 
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-orange-100 text-orange-700">In Review</span>;
    case 'APPROVED': 
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-100 text-emerald-700">Approved</span>;
    case 'PAYMENT_VERIFIED': 
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-indigo-100 text-indigo-700">Payment Verified</span>;
    case 'SENT_TO_FORWARDER': 
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-cyan-100 text-cyan-700">Sent to Forwarder</span>;
    case 'IN_CUSTOMS': 
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-100 text-purple-700">In Customs</span>;
    case 'SHIPPED': 
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-teal-100 text-teal-700">Shipped</span>;
    case 'DELIVERED': 
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-green-100 text-green-700">Delivered</span>;
    case 'ARCHIVED': 
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-gray-100 text-gray-500">Archived</span>;
    default: 
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-slate-100 text-slate-700">{status}</span>;
  }
};
