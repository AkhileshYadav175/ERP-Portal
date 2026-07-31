import React from 'react';
import { Search } from 'lucide-react';

/**
 * SearchBar - Standard Search Input with Search Icon for ERP modules.
 */
const SearchBar = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  className = '',
  ...props
}) => {
  return (
    <div className={`relative flex-1 max-w-md ${className}`}>
      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search size={16} />
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-[#DEDCD8] bg-white rounded-xl text-xs font-semibold text-slate-700 placeholder-slate-400 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300 transition-all"
        {...props}
      />
    </div>
  );
};

export default SearchBar;
