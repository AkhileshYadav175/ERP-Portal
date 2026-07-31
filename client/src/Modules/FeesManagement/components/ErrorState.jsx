import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * ErrorState - A clean, professional alert banner for display upon request rejections.
 */
const ErrorState = ({
  message = 'Failed to load live ERP records.',
  onRetry = null,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 bg-rose-50 border border-rose-100 rounded-2xl max-w-md mx-auto my-6 text-center text-rose-600 ${className}`}>
      <AlertCircle size={24} className="mb-2 shrink-0" />
      <div className="space-y-1">
        <h5 className="text-xs font-extrabold uppercase tracking-wide">Sync Failure</h5>
        <p className="text-[11px] font-semibold opacity-90 leading-normal max-w-xs">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3.5 flex items-center gap-1.5 px-3 py-1.5 border border-rose-200 bg-white hover:bg-rose-100/50 text-rose-600 rounded-xl text-[10px] font-bold transition-all cursor-pointer outline-none shadow-xs active:scale-95"
        >
          <RefreshCw size={11} />
          <span>Retry Sync</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
