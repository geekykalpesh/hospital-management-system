import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, LogOut, User, LayoutDashboard, Calendar, ShieldCheck, Stethoscope } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin';
    if (role === 'doctor') return '/doctor';
    return '/patient';
  };

  const getRoleBadge = () => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
          <ShieldCheck className="w-3 h-3" /> Admin
        </span>
      );
    }
    if (role === 'doctor') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
          <Stethoscope className="w-3 h-3" /> Doctor
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
        <User className="w-3 h-3" /> Patient
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
              Aura<span className="text-brand-600">Care</span>
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block leading-none">
              Medical Center
            </span>
          </div>
        </Link>

        {/* Center Links (Landing / Public) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-brand-600 transition-colors">
            Home
          </Link>
          <a href="#departments" className="hover:text-brand-600 transition-colors">
            Specialties
          </a>
          <a href="#doctors" className="hover:text-brand-600 transition-colors">
            Our Doctors
          </a>
          <a href="#about" className="hover:text-brand-600 transition-colors">
            About HMS
          </a>
        </nav>

        {/* Right Auth / User Bar */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                to={getDashboardPath()}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors border border-slate-200"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-brand-600" />
                <span>Dashboard</span>
              </Link>

              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-semibold flex items-center justify-center text-xs border border-brand-200">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {user.full_name}
                  </div>
                  <div>{getRoleBadge()}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-brand-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-600/20 transition-all hover:shadow"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Appointment</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
