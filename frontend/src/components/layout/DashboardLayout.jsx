import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  LayoutDashboard,
  CalendarPlus,
  CalendarCheck,
  FileText,
  User,
  Users,
  Stethoscope,
  Clock,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';

export const DashboardLayout = ({ children, title = 'Dashboard' }) => {
  const { user, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Build role-specific menu
  const getNavLinks = () => {
    if (role === 'admin') {
      return [
        { name: 'Analytics & KPIs', path: '/admin', icon: LayoutDashboard },
        { name: 'Hospital Appointments', path: '/admin/appointments', icon: ClipboardList },
        { name: 'Doctor Management', path: '/admin/doctors', icon: Stethoscope },
        { name: 'Patient Directory', path: '/admin/patients', icon: Users },
      ];
    }
    if (role === 'doctor') {
      return [
        { name: 'Doctor Dashboard', path: '/doctor', icon: LayoutDashboard },
        { name: 'Patient Queue & Consults', path: '/doctor/appointments', icon: CalendarCheck },
        { name: 'Clinic Availability', path: '/doctor/schedule', icon: Clock },
      ];
    }
    // Patient
    return [
      { name: 'Overview', path: '/patient', icon: LayoutDashboard },
      { name: 'Book Appointment', path: '/patient/book', icon: CalendarPlus },
      { name: 'My Appointments', path: '/patient/appointments', icon: CalendarCheck },
      { name: 'Digital Prescriptions', path: '/patient/prescriptions', icon: FileText },
      { name: 'Medical Profile', path: '/patient/profile', icon: User },
    ];
  };

  const navLinks = getNavLinks();

  const getRoleTheme = () => {
    if (role === 'admin') {
      return {
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        label: 'Hospital Admin',
        icon: ShieldCheck,
      };
    }
    if (role === 'doctor') {
      return {
        badge: 'bg-teal-50 text-teal-700 border-teal-200',
        label: 'Attending Doctor',
        icon: Stethoscope,
      };
    }
    return {
      badge: 'bg-sky-50 text-sky-700 border-sky-200',
      label: 'Patient Portal',
      icon: User,
    };
  };

  const roleMeta = getRoleTheme();
  const RoleIcon = roleMeta.icon;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                Aura<span className="text-brand-600">Care</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block leading-none">
                {roleMeta.label}
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card Pill */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm border border-brand-200">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                {user?.full_name}
              </p>
              <p className="text-[11px] text-slate-400 truncate leading-tight mb-1">
                {user?.email}
              </p>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleMeta.badge}`}
              >
                <RoleIcon className="w-2.5 h-2.5" />
                <span>{roleMeta.label}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-bold shadow-xs border border-brand-200/60'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-brand-600' : 'text-slate-400'
                  }`}
                />
                <span>{item.name}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-brand-600" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Signout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors hidden sm:block"
            >
              Public Portal
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs border border-brand-200">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline-block">
                {user?.full_name}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
