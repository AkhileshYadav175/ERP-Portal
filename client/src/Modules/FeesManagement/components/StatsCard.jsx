import React from 'react';

const StatsCard = ({ title, value, icon: Icon, trend, trendType = 'up', accentColor = 'from-amber-400 to-orange-500' }) => {
  return (
    <div className="relative overflow-hidden bg-white border border-[#EBEAE6] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-350 group">
      {/* Background glow on hover */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${accentColor} opacity-[0.02] group-hover:opacity-[0.05] blur-2xl transition-opacity duration-300 rounded-full`} />
      
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            {title}
          </span>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            {value}
          </h3>
        </div>

        {Icon && (
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentColor} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-[#FAF9F6] flex items-center gap-1.5 text-xs font-bold">
          <span
            className={`px-2 py-0.5 rounded-full ${
              trendType === 'up'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                : trendType === 'down'
                ? 'bg-rose-50 text-brand-red border border-rose-100'
                : 'bg-slate-50 text-slate-500 border border-slate-100'
            }`}
          >
            {trend}
          </span>
          <span className="text-slate-400 font-semibold">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
