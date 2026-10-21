import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Activity, Mail, Lock, ShieldCheck, Stethoscope, User, AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get('expired');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(isExpired ? 'Your session expired. Please sign in again.' : '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      toast.success(`Welcome back, ${result.user.full_name}!`, 'Signed In');
      const role = result.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'doctor') navigate('/doctor');
      else navigate('/patient');
    } else {
      setError(result.message);
      toast.error(result.message, 'Sign In Failed');
    }
  };

  const handleQuickFill = (demoEmail, demoPassword, roleLabel) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    toast.info(`Filled credentials for ${roleLabel}`, 'Quick Demo');
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-100 via-slate-50 to-teal-50/40 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
            <Activity className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 group-hover:text-brand-700 transition-colors">
            Aura<span className="text-brand-600">Care</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Hospital Portal Sign In
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Role-based access for Administrators, Doctors, and Registered Patients
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200/80 sm:px-10 hover:shadow-2xl transition-shadow duration-300">
          
          {/* Quick Demo Credentials Switcher for Evaluation */}
          <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200/90 transition-all hover:border-slate-300">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Evaluation Demo Quick-Fill</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@hospital.com', 'Admin@123', 'Administrator')}
                className="btn-interactive px-2 py-2 text-xs font-semibold rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100/80 hover:shadow-xs flex items-center justify-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('doctor.sarah@hospital.com', 'Doctor@123', 'Attending Doctor')}
                className="btn-interactive px-2 py-2 text-xs font-semibold rounded-xl bg-teal-50 text-teal-700 border border-teal-200/80 hover:bg-teal-100/80 hover:shadow-xs flex items-center justify-center gap-1"
              >
                <Stethoscope className="w-3.5 h-3.5 shrink-0" />
                <span>Doctor</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('john.doe@example.com', 'Patient@123', 'Registered Patient')}
                className="btn-interactive px-2 py-2 text-xs font-semibold rounded-xl bg-sky-50 text-sky-700 border border-sky-200/80 hover:bg-sky-100/80 hover:shadow-xs flex items-center justify-center gap-1"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span>Patient</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hospital.com"
                  className="input-focus block w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-focus block w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-interactive w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/25 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New patient?{' '}
              <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
                Register as a New Patient
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
