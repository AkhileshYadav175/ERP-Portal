import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * EmptyState - Renders a premium empty state panel for vacant listings or search results.
 */
const EmptyState = ({
  title = 'No Records Found',
  message = 'No data records match your current criteria.',
  icon: Icon = Inbox,
  className = '',
  actionButton = null
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-12 bg-white border border-[#EBEAE6] rounded-2xl shadow-xs max-w-md mx-auto my-6 ${className}`}>
      <div className="w-12 h-12 bg-slate-50 border border-slate-200 text-slate-400 rounded-full flex items-center justify-center shadow-xs mb-3">
        <Icon size={20} />
      </div>
      <div className="space-y-1">
        <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
        <p className="text-[11px] text-slate-400 leading-normal max-w-xs">{message}</p>
      </div>
      {actionButton && <div className="mt-4">{actionButton}</div>}
    </div>
  );
};

export default EmptyState;
