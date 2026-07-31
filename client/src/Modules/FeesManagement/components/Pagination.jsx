import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination - Unified pagination control component for ERP tables.
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 10,
  loading = false
}) => {
  if (totalPages <= 1) return null;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-white border border-[#EBEAE6] rounded-2xl text-xs text-slate-500 font-bold">
      <div>
        Showing <span className="text-slate-800">{startIndex + 1}</span> to{' '}
        <span className="text-slate-800">{endIndex}</span> of{' '}
        <span className="text-slate-800">{totalItems}</span> entries
      </div>

      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || loading}
          className="p-1.5 rounded-lg border border-[#DEDCD8] bg-white text-slate-655 hover:bg-[#FAF9F6] disabled:opacity-50 disabled:hover:bg-white transition-all cursor-pointer disabled:cursor-not-allowed outline-none"
        >
          <ChevronLeft size={16} />
        </button>
        
        {Array.from({ length: totalPages }).map((_, idx) => {
          const pNum = idx + 1;
          return (
            <button
              key={pNum}
              onClick={() => onPageChange(pNum)}
              className={`w-7 h-7 flex items-center justify-center rounded-lg border text-[11px] transition-all cursor-pointer outline-none ${
                currentPage === pNum
                  ? 'bg-amber-500 border-amber-500 text-white font-extrabold shadow-sm'
                  : 'border-[#DEDCD8] bg-white text-slate-655 hover:bg-[#FAF9F6]'
              }`}
            >
              {pNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || loading}
          className="p-1.5 rounded-lg border border-[#DEDCD8] bg-white text-slate-655 hover:bg-[#FAF9F6] disabled:opacity-50 disabled:hover:bg-white transition-all cursor-pointer disabled:cursor-not-allowed outline-none"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
