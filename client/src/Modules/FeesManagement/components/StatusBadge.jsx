import React from 'react';

/**
 * StatusBadge - Color-coded status badge component.
 */
const StatusBadge = ({ status = '', className = '' }) => {
  const getStatusStyle = (val) => {
    const s = String(val).toUpperCase();
    switch (s) {
      case 'PAID':
      case 'ACTIVE':
      case 'SUCCESS':
        return 'bg-emerald-50 border-emerald-150 text-emerald-600';
      case 'PENDING':
      case 'WARNING':
        return 'bg-amber-50 border-amber-150 text-amber-600';
      case 'OVERDUE':
      case 'ERROR':
      case 'CRITICAL':
      case 'INACTIVE':
        return 'bg-rose-50 border-rose-150 text-rose-600';
      case 'PARTIAL':
      case 'INFO':
      case 'LOW':
        return 'bg-blue-50 border-blue-150 text-blue-600';
      default:
        return 'bg-slate-50 border-slate-150 text-slate-600';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold uppercase tracking-wide inline-block ${getStatusStyle(status)} ${className}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
