import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Check, X, ShieldAlert, Sparkles, 
  Calendar, Users, Clock, Search, Plus, User, AlertCircle
} from 'lucide-react';
import { adminAttendanceApi } from '../../../api/adminAttendanceApi';
import Card from '../../../components/Card';
import Button from '../../../components/Button';

export default function Attendance() {
  const navigate = useNavigate();
  
  // Dashboard Core Data
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [dailySummary, setDailySummary] = useState([]);
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [chartStats, setChartStats] = useState([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Right Sidebar Filter Tab: 'logged_in' (all present/late), 'on_time', 'late'
  const [sidebarTab, setSidebarTab] = useState('logged_in');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Profile Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const pendingRes = await adminAttendanceApi.getPendingApprovals();
      const summaryRes = await adminAttendanceApi.getDailySummary();
      const activeRes = await adminAttendanceApi.getActiveEmployees();
      const statsRes = await adminAttendanceApi.getAttendanceStats();
      
      if (pendingRes.success) setPendingApprovals(pendingRes.pending || []);
      if (summaryRes.success) setDailySummary(summaryRes.summary || []);
      if (activeRes.success) setActiveEmployees(activeRes.employees || []);
      if (statsRes.success) setChartStats(statsRes.stats || []);
    } catch (err) {
      console.error('Failed to fetch attendance dashboard data:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to sync attendance logbooks with server.';
      setError(`Failed to sync attendance logbooks: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await adminAttendanceApi.approveEmployee(id);
      if (res.success) {
        setSuccess('Employee registration approved.');
        await fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve employee.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this employee request?')) return;
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await adminAttendanceApi.rejectEmployee(id);
      if (res.success) {
        setSuccess('Employee request rejected and removed.');
        await fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject employee.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setFormError('');
    setActionLoading(true);
    try {
      const res = await adminAttendanceApi.createEmployee({
        name: formName,
        lastName: formLastName,
        email: formEmail,
        phone: formPhone,
        department: formDepartment,
        designation: formDesignation,
        password: formPassword
      });
      if (res.success) {
        setSuccess('New employee profile added successfully.');
        setShowAddModal(false);
        // Clear form
        setFormName('');
        setFormLastName('');
        setFormEmail('');
        setFormPhone('');
        setFormDepartment('');
        setFormDesignation('');
        setFormPassword('');
        await fetchData();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create employee profile.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter right sidebar scrollable log
  const filteredSidebarLogs = useMemo(() => {
    return dailySummary.filter(log => {
      // 1. Status Filter
      if (sidebarTab === 'on_time' && log.status !== 'Present') return false;
      if (sidebarTab === 'late' && log.status !== 'Late') return false;
      if (sidebarTab === 'logged_in' && log.status !== 'Present' && log.status !== 'Late') return false;
      
      // 2. Search Query
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const lastNameVal = log.lastName || '';
        const matchName = `${log.name} ${lastNameVal}`.toLowerCase().includes(query);
        const matchDept = log.department.toLowerCase().includes(query);
        return matchName || matchDept;
      }
      return true;
    });
  }, [dailySummary, sidebarTab, searchQuery]);

  // Sidebar counters
  const counters = useMemo(() => {
    const totalActive = activeEmployees.length;
    const loggedInCount = dailySummary.filter(d => d.status === 'Present' || d.status === 'Late').length;
    const onTimeCount = dailySummary.filter(d => d.status === 'Present').length;
    const lateCount = dailySummary.filter(d => d.status === 'Late').length;
    
    return {
      active: totalActive,
      loggedIn: loggedInCount,
      onTime: onTimeCount,
      late: lateCount
    };
  }, [activeEmployees, dailySummary]);

  // Maximum value for bar chart heights scaling
  const chartMaxScale = useMemo(() => {
    if (chartStats.length === 0) return 120;
    const maxVal = Math.max(...chartStats.map(s => Math.max(s.onTime, s.late)));
    return maxVal > 0 ? maxVal * 1.2 : 120;
  }, [chartStats]);

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
    <div className="space-y-6 animate-fade-in text-slate-800 font-sans pb-10">
      
      {/* Premium Sub-Header exactly like the mockup */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#E3E1DC]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-650 hover:text-slate-850 border border-slate-200 cursor-pointer shadow-sm flex items-center justify-center bg-white"
            title="Back"
          >
            <ArrowLeft size={16} />
          </button>
          
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-800 tracking-tight">Attendance</h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold bg-[#FAF9F6] border border-[#E8E6E1] py-1 px-2.5 rounded-lg shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                <Calendar size={13} className="text-slate-400" />
                <span>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-bold tracking-wide uppercase">Corporate Attendance Control Panel</p>
          </div>
        </div>

        {/* Shift timing display */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end hidden sm:flex bg-[#FAF9F6] border border-[#E8E6E1] py-1.5 px-3.5 rounded-xl shadow-xs">
            <span className="text-[9px] text-slate-450 font-black tracking-wider uppercase">Office Timings</span>
            <span className="text-xs font-extrabold text-slate-750 mt-0.5">10:00 AM to 06:00 PM</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-brand-red text-xs font-bold p-3.5 rounded-2xl animate-fade-in flex items-center gap-2">
          <ShieldAlert size={15} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold p-3.5 rounded-2xl animate-fade-in flex items-center gap-2">
          <Check size={15} style={{ color: '#10b981' }} />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <Card className="py-32 text-center text-slate-450 bg-white border border-[#E8E6E1] rounded-3xl">
          <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#E31C1C] animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold">Synchronizing Dashboard Modules...</p>
        </Card>
      ) : (
        /* Main Layout Grid matching the screenshot */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* LEFT 3 COLUMNS: Chart, Approvals, Profile Quick Card */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* 1. Bar Chart Card */}
            <Card className="bg-white border border-[#E8E6E1] rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#FAF9F6]">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Attendance Status</h3>
                  <p className="text-[10px] text-slate-400 font-bold">Past 10 days present ratios</p>
                </div>

                <div className="flex items-center gap-2">
                  <select className="text-[10px] font-black text-slate-550 border border-[#DEDCD8] bg-white rounded-lg px-2 py-1 outline-none">
                    <option>All Departments</option>
                  </select>
                  <select className="text-[10px] font-black text-slate-550 border border-[#DEDCD8] bg-white rounded-lg px-2 py-1 outline-none">
                    <option>Current Month</option>
                  </select>
                  <select className="text-[10px] font-black text-slate-550 border border-[#DEDCD8] bg-white rounded-lg px-2 py-1 outline-none">
                    <option>2026</option>
                  </select>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="flex justify-end gap-4 py-3 text-[10px] font-extrabold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-red inline-block" />
                  <span className="text-slate-500">On-time</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#fca5a5] inline-block" />
                  <span className="text-slate-500">Late</span>
                </div>
              </div>

              {/* Chart Plot Area */}
              <div className="relative pt-6 pb-2 h-64 flex">
                
                {/* Y-Axis Labels */}
                <div className="w-10 flex flex-col justify-between text-[10px] font-bold text-slate-400 pr-2 pb-6 text-right select-none h-full">
                  <span>100</span>
                  <span>75</span>
                  <span>50</span>
                  <span>25</span>
                  <span>0</span>
                </div>

                {/* Bars Plot */}
                <div className="flex-1 border-b border-l border-slate-100 relative h-full flex justify-between items-end px-4 pb-6">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                    <div className="w-full border-t border-slate-100" />
                    <div className="w-full border-t border-slate-100" />
                    <div className="w-full border-t border-slate-100" />
                    <div className="w-full border-t border-slate-100" />
                    <div className="w-full" />
                  </div>

                  {chartStats.map((item, idx) => {
                    const onTimeHeight = `${Math.min(100, (item.onTime / chartMaxScale) * 100)}%`;
                    const lateHeight = `${Math.min(100, (item.late / chartMaxScale) * 100)}%`;

                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 group relative z-10 w-8">
                        {/* Rod Group */}
                        <div className="flex items-end gap-1.5 h-44 w-full justify-center">
                          {/* On-Time Rod */}
                          <div 
                            style={{ height: onTimeHeight }}
                            className="w-2 bg-brand-red rounded-t-sm transition-all duration-500 group-hover:brightness-95 relative"
                            title={`On-time: ${item.onTime}`}
                          />
                          {/* Late Rod */}
                          <div 
                            style={{ height: lateHeight }}
                            className="w-2 bg-[#fca5a5] rounded-t-sm transition-all duration-500 group-hover:brightness-95 relative"
                            title={`Late: ${item.late}`}
                          />
                        </div>
                        {/* Day Label */}
                        <span className="text-[9px] font-black text-slate-400 uppercase select-none mt-1 truncate w-full text-center">
                          {item.label}
                        </span>

                        {/* Interactive Tooltip on Hover */}
                        <div className="absolute -top-12 bg-slate-900 text-white text-[9px] font-black rounded-lg p-2 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 flex flex-col gap-0.5 min-w-[70px]">
                          <span className="text-slate-400 uppercase tracking-widest">{item.label}</span>
                          <span className="text-white">On-time: {item.onTime}</span>
                          <span className="text-slate-300">Late: {item.late}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* 2. Side-By-Side Bottom Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Table Card (Spans 2/3) */}
              <Card className="md:col-span-2 bg-white border border-[#E8E6E1] rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#FAF9F6]">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Pending Registrations</h3>
                      <span className="bg-brand-red text-white text-[9px] font-black rounded-full px-2 py-0.2 shrink-0">
                        {pendingApprovals.length}
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto min-h-[180px]">
                    <table className="w-full text-left border-collapse text-[11px] font-medium text-slate-650">
                      <thead>
                        <tr className="border-b border-[#E8E6E1] text-[9px] font-black text-slate-400 uppercase tracking-wider">
                          <th className="pb-2">Name</th>
                          <th className="pb-2">Department</th>
                          <th className="pb-2">Requested On</th>
                          <th className="pb-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EBEAE6]">
                        {pendingApprovals.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="py-10 text-center text-slate-400 font-bold">
                              🎉 No pending approvals left!
                            </td>
                          </tr>
                        ) : (
                          pendingApprovals.slice(0, 4).map((emp) => (
                            <tr key={emp._id} className="hover:bg-[#FAF9F6]/40 transition-colors">
                              <td className="py-2.5 flex items-center gap-2">
                                {emp.profilePicture ? (
                                  <img 
                                    src={emp.profilePicture} 
                                    alt="User" 
                                    className="w-6 h-6 rounded-full object-cover border border-slate-200"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-450 border border-slate-200 text-[10px]">
                                    {emp.name[0]}
                                  </div>
                                )}
                                <span className="font-extrabold text-slate-850">{emp.lastName ? `${emp.name} ${emp.lastName}` : emp.name}</span>
                              </td>
                              <td className="py-2.5">{emp.department || '-'}</td>
                              <td className="py-2.5 font-mono text-slate-450">
                                {new Date(emp.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                              </td>
                              <td className="py-2.5 text-right">
                                <div className="inline-flex gap-1.5">
                                  <button
                                    onClick={() => handleApprove(emp._id)}
                                    disabled={actionLoading}
                                    className="w-6 h-6 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center cursor-pointer border border-emerald-200 active:scale-90 transition-all"
                                    title="Approve"
                                  >
                                    <Check size={11} />
                                  </button>
                                  <button
                                    onClick={() => handleReject(emp._id)}
                                    disabled={actionLoading}
                                    className="w-6 h-6 rounded-full bg-rose-50 hover:bg-rose-100 text-brand-red flex items-center justify-center cursor-pointer border border-rose-200 active:scale-90 transition-all"
                                    title="Reject"
                                  >
                                    <X size={11} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>

              {/* Add New Profile Illustration Card (Spans 1/3) */}
              <Card className="bg-white border border-[#E8E6E1] rounded-3xl p-5 shadow-xs flex flex-col items-center justify-center text-center space-y-4">
                <div className="space-y-1">
                  <svg className="w-24 h-24 mx-auto text-slate-200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Visual representation card graphic */}
                    <rect x="40" y="70" width="120" height="90" rx="12" fill="#FAF9F6" stroke="#E3E1DC" strokeWidth="2" />
                    <circle cx="100" cy="100" r="16" fill="#fce8ee" />
                    <path d="M75 145 C 75 125, 125 125, 125 145" fill="#fce8ee" />
                    <rect x="60" y="80" width="30" height="4" rx="2" fill="#E3E1DC" />
                    <rect x="60" y="88" width="20" height="4" rx="2" fill="#E3E1DC" />
                    <circle cx="150" cy="140" r="14" fill="#E31C1C" />
                    <path d="M144 140 H 156 M150 134 V 146" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Add New Profile</h4>
                  <p className="text-[10px] text-slate-400 leading-normal max-w-[150px] mx-auto">
                    Create a new employee profile directly into the active database.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-10 h-10 rounded-full bg-brand-red hover:bg-brand-red-hover text-white flex items-center justify-center cursor-pointer shadow-md transition-all active:scale-90 border-0"
                  title="Add Profile"
                >
                  <Plus size={20} />
                </button>
              </Card>

            </div>
          </div>

          {/* RIGHT SIDEBAR COLUMN: Checked-in logs */}
          <div className="lg:col-span-1 bg-white border border-[#E8E6E1] rounded-3xl p-4 shadow-xs space-y-4">
            
            {/* Sidebar Tabs */}
            <div className="flex bg-[#FAF9F6] border border-[#E8E6E1] p-1 rounded-xl text-[9px] font-black text-slate-450 select-none">
              <button 
                onClick={() => setSidebarTab('logged_in')}
                className={`flex-1 py-1.5 rounded-lg text-center cursor-pointer transition-all ${
                  sidebarTab === 'logged_in' 
                    ? 'bg-white text-slate-800 shadow-xs' 
                    : 'hover:text-slate-700'
                }`}
              >
                LOGGED IN ({counters.loggedIn})
              </button>
              <button 
                onClick={() => setSidebarTab('on_time')}
                className={`flex-1 py-1.5 rounded-lg text-center cursor-pointer transition-all ${
                  sidebarTab === 'on_time' 
                    ? 'bg-white text-slate-800 shadow-xs' 
                    : 'hover:text-slate-700'
                }`}
              >
                ON TIME ({counters.onTime})
              </button>
              <button 
                onClick={() => setSidebarTab('late')}
                className={`flex-1 py-1.5 rounded-lg text-center cursor-pointer transition-all ${
                  sidebarTab === 'late' 
                    ? 'bg-white text-slate-800 shadow-xs' 
                    : 'hover:text-slate-700'
                }`}
              >
                LATE ({counters.late})
              </button>
            </div>

            {/* Search Input Box */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employees"
                className="w-full bg-[#FAF9F6] border border-[#DEDCD8] rounded-xl p-2 pl-9 text-[10px] font-semibold text-slate-800 outline-none focus:border-slate-500 focus:bg-white transition-all placeholder:text-slate-350"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            </div>

            {/* Scrollable Logs Stack */}
            <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
              {filteredSidebarLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-350 text-[10px] font-bold">
                  No matching employee records.
                </div>
              ) : (
                filteredSidebarLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between group border-b border-[#EBEAE6]/40 pb-3 last:border-b-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {log.profilePicture ? (
                        <img 
                          src={log.profilePicture} 
                          alt="User" 
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-450 border border-slate-200 text-[10px] shrink-0 uppercase">
                          {log.name[0]}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0 text-[10px]">
                        <strong className="text-slate-800 leading-tight truncate">{log.lastName ? `${log.name} ${log.lastName}` : log.name}</strong>
                        <span className="text-slate-450 text-[8px] font-semibold truncate leading-none mt-0.5">
                          {log.designation || 'Staff'} | {log.department}
                        </span>
                        <span className="text-slate-400 text-[8px] font-medium leading-none mt-1">
                          In: {formatTime(log.checkIn)} | Out: {formatTime(log.checkOut)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                        log.status === 'Present' ? 'bg-brand-red animate-pulse' : 'bg-[#fca5a5]'
                      }`} />
                      <span className="text-[8px] font-black text-slate-400 uppercase select-none">
                        {log.status === 'Present' ? 'On-time' : 'Late'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer quick link */}
            <div className="pt-2 text-center border-t border-slate-150">
              <span className="text-[9px] font-black text-[#E31C1C] hover:underline cursor-pointer uppercase tracking-wider block">
                View all employees ({counters.active})
              </span>
            </div>

          </div>

        </div>
      )}

      {/* POPUP MODAL: Add New Profile */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#0b0a09]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-[#E8E6E1] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#EBEAE6] bg-[#FAF9F6]">
              <div className="space-y-0.5">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Create Employee Profile
                </h3>
                <p className="text-[9px] text-slate-400 font-bold">Add profile details directly to the active directory</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer bg-transparent border-0 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Scroll Area */}
            <form onSubmit={handleCreateEmployee} className="p-6 overflow-y-auto space-y-4">
              
              {formError && (
                <div className="bg-rose-50 border border-rose-100 text-brand-red text-xs font-bold p-3 rounded-2xl animate-fade-in flex items-start gap-1.5">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wide">First Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="First Name"
                    className="w-full bg-[#FAF9F6] border border-[#DEDCD8] rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-500 focus:bg-white transition-all"
                    required
                  />
                </div>
                
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Last Name</label>
                  <input
                    type="text"
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    placeholder="Last Name"
                    className="w-full bg-[#FAF9F6] border border-[#DEDCD8] rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-500 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Department</label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    placeholder="e.g. Sales"
                    className="w-full bg-[#FAF9F6] border border-[#DEDCD8] rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-500 focus:bg-white transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Designation</label>
                  <input
                    type="text"
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    placeholder="e.g. Designer"
                    className="w-full bg-[#FAF9F6] border border-[#DEDCD8] rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Phone Number</label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="Phone"
                  className="w-full bg-[#FAF9F6] border border-[#DEDCD8] rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-[#FAF9F6] border border-[#DEDCD8] rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-500 focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Password</label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full bg-[#FAF9F6] border border-[#DEDCD8] rounded-xl p-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-500 focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="flex gap-2.5 pt-4 border-t border-[#EBEAE6]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white hover:bg-slate-50 border border-[#DEDCD8] text-slate-500 rounded-xl text-xs font-bold py-2.5 cursor-pointer shadow-sm transition-all"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#E31C1C] hover:bg-[#b81414] text-white rounded-xl text-xs font-bold py-2.5 cursor-pointer shadow-sm border-0 transition-all flex items-center justify-center gap-1.5"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  ) : (
                    'Add Profile'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
