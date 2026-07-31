import React from 'react';
import { Calendar } from 'lucide-react';

/**
 * DatePicker - Renders a form-friendly inline date selection element with Lucide calendar icon decoration.
 */
const DatePicker = ({
  label = '',
  value = '',
  onChange,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">{label}</label>}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Calendar size={14} />
        </span>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-[#DEDCD8] bg-white rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-300 transition-all cursor-pointer"
          {...props}
        />
      </div>
    </div>
  );
};

export default DatePicker;
