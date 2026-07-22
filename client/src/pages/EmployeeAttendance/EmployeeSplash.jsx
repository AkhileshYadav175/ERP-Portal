import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { ROUTES } from '../../constants/Routes';

export default function EmployeeSplash() {
  const navigate = useNavigate();
  const { employeeToken } = useEmployeeAuth();
  const [fadeClass, setFadeClass] = useState('opacity-100');

  useEffect(() => {
    // Wait 2.2 seconds showing splash, then fade out and redirect
    const timer = setTimeout(() => {
      setFadeClass('opacity-0 transition-opacity duration-500 ease-out');
      
      const redirectTimer = setTimeout(() => {
        if (employeeToken) {
          navigate(ROUTES.EMPLOYEE_DASHBOARD);
        } else {
          navigate(ROUTES.EMPLOYEE_LOGIN);
        }
      }, 500);

      return () => clearTimeout(redirectTimer);
    }, 2200);

    return () => clearTimeout(timer);
  }, [employeeToken, navigate]);

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center font-sans">
      <div className={`w-full max-w-md min-h-screen sm:min-h-[85vh] sm:rounded-3xl sm:shadow-2xl bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden transition-all duration-300 ${fadeClass}`}>
        {/* Status Bar simulation for premium mobile look */}
        <div className="absolute top-4 left-6 right-6 flex items-center justify-between text-[11px] text-slate-400 font-bold sm:flex hidden">
          <span>9:00 AM</span>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-2 border border-slate-350 rounded-sm" />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
          </div>
        </div>

        {/* Splash Logo */}
        <div className="flex-1 flex flex-col items-center justify-center animate-splash-zoom">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-32 h-auto object-contain hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
            }}
          />
          <h2 className="text-xl font-black text-brand-red tracking-wider mt-4">JAINS COMPUTER</h2>
          <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-1">ERP ATTENDANCE PORTAL</p>
        </div>

        <div className="pb-8 flex flex-col items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-slate-100 border-t-brand-red animate-spin" />
          <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest">LOADING SERVICES...</span>
        </div>
      </div>
    </div>
  );
}
