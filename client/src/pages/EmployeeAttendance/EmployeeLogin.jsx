import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useEmployeeAuth } from '../../context/EmployeeAuthContext';
import { ROUTES } from '../../constants/Routes';

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const { employeeLogin } = useEmployeeAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await employeeLogin(email, password);
      if (res.success) {
        navigate(ROUTES.EMPLOYEE_DASHBOARD);
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError('Connection to server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center font-sans">
      <div className="w-full max-w-md min-h-screen sm:min-h-[85vh] sm:rounded-3xl sm:shadow-2xl bg-white flex flex-col p-8 relative overflow-hidden animate-fade-in justify-between">
        
        {/* Top Header */}
        <div className="space-y-6">
          <div className="flex justify-center pt-4">
            <img 
              src="/jains.svg" 
              alt="Jains" 
              className="h-10 w-auto object-contain"
              onError={(e) => {
                e.target.onerror = null;
              }}
            />
          </div>

          <div className="space-y-2 mt-8">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none">
              Log In to our <span className="text-brand-red font-black">E</span>RP
            </h1>
            <p className="text-xs text-slate-450 font-medium leading-relaxed max-w-[280px]">
              Please take a moment to log in to your account when you're ready.
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-brand-red text-xs font-bold p-3 rounded-2xl animate-fade-in">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                Username
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Username"
                  className="w-full bg-[#FAF9F6] border border-[#DEDCD8] rounded-xl p-3.5 pl-11 text-xs font-semibold text-slate-800 outline-none focus:border-slate-500 focus:bg-white transition-all"
                  required
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
              </div>
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-[#FAF9F6] border border-[#DEDCD8] rounded-xl p-3.5 pl-11 pr-11 text-xs font-semibold text-slate-800 outline-none focus:border-slate-500 focus:bg-white transition-all"
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 focus:outline-none cursor-pointer bg-transparent border-0 flex items-center justify-center"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-red hover:bg-brand-red-hover text-white text-xs font-extrabold py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-98 cursor-pointer border-0 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : (
                'Log In'
              )}
            </button>
          </form>
        </div>

        {/* Footer Navigation */}
        <div className="pt-8 text-center text-xs font-bold text-slate-450 border-t border-slate-100 mt-6 pb-2">
          Don't have an account?{' '}
          <Link 
            to={ROUTES.EMPLOYEE_REGISTER} 
            className="text-brand-red hover:underline font-extrabold"
          >
            Register
          </Link>
        </div>

      </div>
    </div>
  );
}
