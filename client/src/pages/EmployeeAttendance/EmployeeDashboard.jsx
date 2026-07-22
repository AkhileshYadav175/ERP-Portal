import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, CheckCircle, Clock, Calendar, AlertCircle } from 'lucide-react';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { employeeApi } from '../../api/employeeApi';
import { ROUTES } from '../../constants/Routes';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { employee, employeeToken, employeeLogout } = useEmployeeAuth();

  const [todayRecord, setTodayRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await employeeApi.getTodayAttendance();
      if (res.success) {
        setTodayRecord(res.todayRecord);
        setHistory(res.history || []);
      }
    } catch (err) {
      console.error('Failed to load status:', err);
      setError('Failed to sync today\'s status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!employeeToken) {
      navigate(ROUTES.EMPLOYEE_LOGIN);
      return;
    }
    fetchStatus();
  }, [employeeToken, navigate]);

  const handleCheckIn = async () => {
    setError('');
    setSuccessMsg('');
    setBtnLoading(true);
    try {
      const res = await employeeApi.checkIn(remarks);
      if (res.success) {
        setSuccessMsg(res.message || 'Checked in successfully.');
        setRemarks('');
        await fetchStatus();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in request failed.');
    } finally {
      setLoading(false);
      setBtnLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setError('');
    setSuccessMsg('');
    setBtnLoading(true);
    try {
      const res = await employeeApi.checkOut();
      if (res.success) {
        setSuccessMsg(res.message || 'Checked out successfully.');
        await fetchStatus();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Check-out request failed.');
    } finally {
      setLoading(false);
      setBtnLoading(false);
    }
  };

  const handleLogout = () => {
    employeeLogout();
    navigate(ROUTES.EMPLOYEE_LOGIN);
  };

  const formatTime = (timeStr) => {
    if (!timeStr || timeStr === '-') return '-';
    if (timeStr.includes(':')) {
      const [h, m] = timeStr.split(':');
      const hours = parseInt(h);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours.toString().padStart(2, '0')}:${m} ${ampm}`;
    }
    return timeStr;
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center font-sans">
      <div className="w-full max-w-md min-h-screen sm:min-h-[85vh] sm:rounded-3xl sm:shadow-2xl bg-white flex flex-col p-6 relative overflow-hidden animate-fade-in justify-between">
        
        <div className="space-y-6">
          {/* Header Dashboard */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              {employee?.profilePicture ? (
                <img 
                  src={employee.profilePicture} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                  <User size={18} />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-800 leading-tight">
                  {employee?.name} {employee?.lastName}
                </span>
                <span className="text-[9px] text-[#E31C1C] font-black uppercase tracking-wider mt-0.5">
                  {employee?.department || 'Employee'}
                </span>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer bg-transparent border-0 flex items-center justify-center"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* Realtime Clock Widget */}
          <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white text-center space-y-2 shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-red" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <h2 className="text-3xl font-black tracking-tight leading-none tabular-nums text-white">
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              OFFICE HOURS: 09:30 AM - 06:30 PM
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-brand-red text-xs font-bold p-3 rounded-2xl animate-fade-in flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-650 text-xs font-bold p-3 rounded-2xl animate-fade-in flex items-start gap-2">
              <CheckCircle size={14} className="shrink-0 mt-0.5" style={{ color: '#10b981' }} />
              <span>{successMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-brand-red animate-spin mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-wider">Syncing status...</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Checkin Action Card */}
              <div className="bg-white border border-[#E8E6E1] p-5 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-[10px] font-black text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={12} className="text-[#E31C1C]" />
                  <span>Daily Operation Log</span>
                </h3>

                {/* Status displays */}
                {todayRecord ? (
                  <div className="grid grid-cols-2 gap-4 pb-1">
                    <div className="bg-[#FAF9F6] border border-[#EBEAE6] p-3 rounded-xl">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Check In</span>
                      <strong className="text-slate-800 text-sm block mt-0.5">
                        {formatTime(todayRecord.checkIn)}
                      </strong>
                      <span className={`inline-block text-[8px] font-black px-1.5 py-0.2 rounded-md uppercase tracking-wider mt-1.5 ${
                        todayRecord.status === 'Present' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {todayRecord.status}
                      </span>
                    </div>

                    <div className="bg-[#FAF9F6] border border-[#EBEAE6] p-3 rounded-xl">
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Check Out</span>
                      <strong className="text-slate-800 text-sm block mt-0.5">
                        {todayRecord.checkOut ? formatTime(todayRecord.checkOut) : '--:--'}
                      </strong>
                      <span className="inline-block text-[8px] font-black px-1.5 py-0.2 rounded-md uppercase tracking-wider mt-1.5 bg-slate-50 text-slate-500 border border-slate-200">
                        {todayRecord.checkOut ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Remarks / Work Notes</label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Optional remarks (e.g. working from client site)..."
                        className="w-full bg-[#FAF9F6] border border-[#DEDCD8] rounded-xl p-3 text-xs font-semibold text-slate-800 outline-none focus:border-slate-500 focus:bg-white transition-all placeholder:text-slate-350"
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                {/* Operations buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCheckIn}
                    disabled={btnLoading || !!todayRecord}
                    className="flex-1 text-white text-xs font-extrabold py-3 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer border-0 flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: !todayRecord ? '#10b981' : '#e2e8f0' }}
                  >
                    <span>Punch In</span>
                  </button>

                  <button
                    onClick={handleCheckOut}
                    disabled={btnLoading || !todayRecord || !!todayRecord?.checkOut}
                    className="flex-1 text-white text-xs font-extrabold py-3 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer border-0 flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: (todayRecord && !todayRecord.checkOut) ? '#E31C1C' : '#e2e8f0' }}
                  >
                    <span>Punch Out</span>
                  </button>
                </div>
              </div>

              {/* History section */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={12} className="text-slate-400" />
                  <span>Recent Logs (Last 10 Days)</span>
                </h3>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {history.length === 0 ? (
                    <p className="text-center text-slate-350 text-[10px] font-bold py-6 bg-[#FAF9F6] border border-[#EBEAE6] rounded-xl">
                      No logs found.
                    </p>
                  ) : (
                    history.map((record) => (
                      <div 
                        key={record._id}
                        className="p-3 bg-white border border-[#EBEAE6] rounded-xl flex items-center justify-between shadow-xs hover:border-slate-300 transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-extrabold text-slate-800">
                            {new Date(record.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold mt-0.5">
                            Checkin: {formatTime(record.checkIn)} | Checkout: {formatTime(record.checkOut)}
                          </span>
                        </div>

                        <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-md uppercase tracking-wider ${
                          record.status === 'Present' 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-4 text-center text-[9px] font-black text-slate-300 uppercase tracking-widest border-t border-slate-100 mt-6 flex justify-between items-center">
          <span>JAINS COMPUTER ATTENDANCE V2.0</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-550 inline-block animate-pulse" style={{ backgroundColor: '#10b981' }} />
            <span className="text-slate-400 text-[8px] font-bold">ONLINE SYNCED</span>
          </span>
        </div>

      </div>
    </div>
  );
}
