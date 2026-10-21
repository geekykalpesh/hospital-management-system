import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import api from '../api/axios';
import {
  Activity,
  Calendar,
  Shield,
  Clock,
  Heart,
  Award,
  ChevronRight,
  PhoneCall,
  CheckCircle,
  Stethoscope,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ShimmerCard } from '../components/common/Shimmer';

export const LandingPage = () => {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, docRes] = await Promise.all([
          api.get('/departments'),
          api.get('/doctors?available_only=true'),
        ]);
        if (deptRes.data.success) setDepartments(deptRes.data.data);
        if (docRes.data.success) setDoctors(docRes.data.data.slice(0, 4));
      } catch (err) {
        console.error('Failed to load landing data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-slate-50 py-16 lg:py-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Next-Generation Healthcare Management</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Modern Clinical Care,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-teal-800">
                  Seamless Booking.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                AuraCare provides comprehensive hospital clinical management for patients, doctors, and administration. Instant slot appointments, electronic prescriptions, and historical medical records in one unified platform.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 shadow-md shadow-brand-600/20 transition-all hover:scale-[1.01]"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment Now</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-xs"
                >
                  <Shield className="w-4 h-4 text-brand-600" />
                  <span>Doctor & Admin Sign In</span>
                </Link>
              </div>

              {/* Key Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl font-bold text-slate-900">99.4%</div>
                  <div className="text-xs text-slate-500 font-medium">Care Satisfaction</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">24/7</div>
                  <div className="text-xs text-slate-500 font-medium">Emergency Care</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">100%</div>
                  <div className="text-xs text-slate-500 font-medium">Verified MDs</div>
                </div>
              </div>
            </div>

            {/* Right Card Presentation */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 relative z-10 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Quick Appointment</h4>
                      <p className="text-xs text-slate-400">Consult with specialists</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Booking
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Stethoscope className="w-4 h-4 text-brand-600" />
                      <span className="text-xs font-semibold text-slate-700">Specialist Consultations</span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">From $50</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-brand-600" />
                      <span className="text-xs font-semibold text-slate-700">Same-Day Availability</span>
                    </div>
                    <span className="text-xs text-emerald-600 font-semibold">Available</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="w-4 h-4 text-brand-600" />
                      <span className="text-xs font-semibold text-slate-700">Board Certified Specialists</span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Top Tier</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-600 to-teal-700 text-white flex items-center justify-between shadow-md shadow-brand-600/20">
                  <div>
                    <div className="text-xs text-brand-100 font-medium">Emergency Care Hotline</div>
                    <div className="text-sm font-bold">+1-800-AURA-CARE</div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                    <PhoneCall className="w-4 h-4 text-white" />
                  </div>
                </div>

                <Link
                  to="/login"
                  className="block text-center w-full py-3 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
                >
                  Sign In to Patient Portal
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="py-16 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Clinical Excellence
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Hospital Departments & Specialties
            </h3>
            <p className="text-sm text-slate-600">
              State-of-the-art diagnostic facilities and specialized outpatient clinics led by senior consultants.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ShimmerCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200/80 hover:bg-white hover:shadow-md hover:border-brand-200 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-brand-600 flex items-center justify-center shadow-xs mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <Heart className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800 mb-1 group-hover:text-brand-600 transition-colors">
                    {dept.name}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                    {dept.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 text-xs">
                    <span className="font-semibold text-slate-600">
                      {dept.doctor_count || 1} Attending Doctors
                    </span>
                    <Link
                      to="/login"
                      className="text-brand-600 font-semibold inline-flex items-center gap-1 hover:underline"
                    >
                      <span>Book</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section id="doctors" className="py-16 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Medical Staff
              </h2>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Meet Our Senior Physicians
              </h3>
            </div>
            <Link
              to="/login"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              <span>View All Doctors & Book</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-sm border border-brand-200">
                      {doc.full_name?.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {doc.full_name}
                      </h4>
                      <p className="text-[11px] text-brand-600 font-semibold">{doc.specialization}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-500 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-700">Dept:</span> {doc.department_name}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Exp:</span> {doc.experience_years} Years
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Room:</span> {doc.room_number || 'OPD-1'}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900">
                    ${parseFloat(doc.consultation_fee).toFixed(2)}
                  </div>
                  <Link
                    to="/login"
                    className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-[11px] font-semibold hover:bg-brand-700 transition-colors"
                  >
                    Select Slot
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-base font-bold text-white">AuraCare Health</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Integrated Hospital Management Platform supporting clinical consultations, electronic medical records, and role-based administration.
              </p>
            </div>
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Roles & Access</h5>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><Link to="/login" className="hover:text-white">Admin Management</Link></li>
                <li><Link to="/login" className="hover:text-white">Doctor Consultation Queue</Link></li>
                <li><Link to="/login" className="hover:text-white">Patient Booking & History</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Emergency Contact</h5>
              <p className="text-xs text-slate-400">24/7 Casualty & Trauma Center</p>
              <p className="text-sm font-bold text-teal-400 mt-1">+1-800-555-0100</p>
              <p className="text-xs text-slate-500 mt-1">742 Evergreen Healthcare Ave, Medical District</p>
            </div>
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Compliance & Security</h5>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>JWT Secure Authenticated</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>PostgreSQL ACID Architecture</span>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
            © 2026 AuraCare Hospital Management System. All rights reserved. Built for technical interview evaluation.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
