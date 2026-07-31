import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

/**
 * FilterPanel - Grid layout wrapper for list filtering dropdowns.
 */
const FilterPanel = ({ children, className = '', showIcon = true }) => {
  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {showIcon && <SlidersHorizontal size={14} className="text-slate-400 mr-0.5" />}
      {children}
    </div>
  );
};

export default FilterPanel;
