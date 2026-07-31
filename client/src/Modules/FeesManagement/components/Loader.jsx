import React from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Loader - Custom spinner and text overlay.
 */
const Loader = ({
  message = 'Syncing ERP register ledger...',
  size = 18,
  className = '',
  inline = false
}) => {
  if (inline) {
    return (
      <div className={`flex items-center justify-center p-6 ${className}`}>
        <RefreshCw className="animate-spin text-amber-500 mr-2" size={size} />
        <span className="text-xs font-bold text-slate-500">{message}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-12 bg-white border border-[#EBEAE6] rounded-2xl shadow-xs ${className}`}>
      <RefreshCw className="animate-spin text-amber-500 mr-2" size={size} />
      <span className="text-xs font-bold text-slate-655">{message}</span>
    </div>
  );
};

export default Loader;
