import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { ROUTES } from '../../constants/Routes';
import { APP_CONFIG } from '../../config/app';

const Login = () => {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Get path from state to redirect to, otherwise go to dashboard
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  // If already authenticated, redirect straight to target page
  useEffect(() => {
    if (token) {
      navigate(from, { replace: true });
    }
  }, [token, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(result.error);
    }
  };

  return (
    <div className="min-h-screen relative flex justify-center items-center font-sans bg-white overflow-hidden">

      {/* ── Decorative arch lines ──────────────────────────────── */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
      >
        {/* Outer arch */}
        <path
          d="M -80 900 Q 720 260 1520 900"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.75"
        />
        {/* Inner arch — slightly tighter curve, runs parallel */}
        <path
          d="M -80 900 Q 720 360 1520 900"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.75"
        />
      </svg>
      {/* ─────────────────────────────────────────────────────── */}

      <div className="relative z-10 w-full max-w-md bg-white backdrop-blur-xl border border-black/10 py-20 px-10 rounded-2xl shadow-2xl">
        {/* Portal Branding */}
        <div className="flex flex-col gap-3 items-center justify-center text-center mb-10">
          <div className=""><img src="/logo.png" width='75px' alt="Jains Computer Logo" />
          </div>
          <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">{APP_CONFIG.NAME}</h1>
          <p className="text-sm text-slate-600">Sign in to access your administrative dashboard</p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 flex items-start gap-3 text-sm">
            <AlertCircle className="shrink-0 mt-0.5" size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <Input
            label="Email Address"
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="aadishjaindesign@gmail.com"
            icon={Mail}
          />

          {/* Password input */}
          <div className="relative">
            <Input
              label="Password"
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={Lock}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 bottom-3.5 text-slate-500 hover:text-slate-350 transition-colors z-10"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full font-semibold mt-10"
          >
            {isSubmitting ? 'Signing in...' : 'Get Started'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
