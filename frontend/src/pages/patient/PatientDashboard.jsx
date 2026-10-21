import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  CalendarCheck,
  FileText,
  AlertCircle,
  ArrowRight,
  Stethoscope,
  Heart,
  ChevronRight,
  MapPin,
  CalendarPlus,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { ShimmerStats, ShimmerCard } from '../../components/common/Shimmer';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const [upRes, histRes] = await Promise.all([
          api.get('/appointments/my-appointments?tab=upcoming'),
          api.get('/appointments/my-appointments?tab=history'),
        ]);
        if (upRes.data.success) setUpcoming(upRes.data.data);
        if (histRes.data.success) setHistory(histRes.data.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const nextAppointment = upcoming[0] || null;

  return (
    <DashboardLayout title="Patient Medical Portal">
      <div className="space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Electronic Health Record
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.full_name}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Manage your upcoming hospital appointments, download doctor prescriptions, and book consultations with specialist medical officers.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/patient/book"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md transition-all"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Book New Appointment</span>
              </Link>
              <Link
                to="/patient/appointments"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors"
              >
                <span>View My Appointments History</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
          <div className="hidden lg:block absolute -right-6 -bottom-6 w-64 h-64 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />
        </div>

        {/* KPI Stats */}
        {loading ? (
          <ShimmerStats count={3} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">Upcoming Visits</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{upcoming.length}</h3>
                <p className="text-[11px] text-teal-600 font-medium mt-1">Confirmed & Pending</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">Past Consultations</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {history.filter((h) => h.status === 'completed').length}
                </h3>
                <p className="text-[11px] text-sky-600 font-medium mt-1">Completed Visits</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <CalendarCheck className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">Digital Prescriptions</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {history.filter((h) => h.prescription_id).length}
                </h3>
                <p className="text-[11px] text-indigo-600 font-medium mt-1">Available for Download</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </div>
        )}

        {/* Next Scheduled Appointment Hero */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Next Upcoming Consultation
            </h3>
            <Link
              to="/patient/appointments"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              <span>View All Bookings</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <ShimmerCard />
          ) : nextAppointment ? (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Doctor Info */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-lg border border-teal-200 shrink-0">
                    <Stethoscope className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-base font-bold text-slate-900">
                        {nextAppointment.doctor_name}
                      </h4>
                      <StatusBadge status={nextAppointment.status} />
                    </div>
                    <p className="text-xs font-semibold text-brand-600 mt-0.5">
                      {nextAppointment.specialization} • {nextAppointment.department_name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {nextAppointment.qualification}
                    </p>
                  </div>
                </div>

                {/* Timing & Details */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <Calendar className="w-4 h-4 text-brand-600" />
                    <div>
                      <div className="font-bold text-slate-900">
                        {new Date(nextAppointment.appointment_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-[11px] text-slate-400">Date</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <Clock className="w-4 h-4 text-brand-600" />
                    <div>
                      <div className="font-bold text-slate-900">{nextAppointment.time_slot}</div>
                      <div className="text-[11px] text-slate-400">Time Slot</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <MapPin className="w-4 h-4 text-brand-600" />
                    <div>
                      <div className="font-bold text-slate-900">
                        {nextAppointment.room_number || 'OPD-1'}
                      </div>
                      <div className="text-[11px] text-slate-400">Room</div>
                    </div>
                  </div>
                </div>

              </div>

              {nextAppointment.symptoms && (
                <div className="mt-5 pt-4 border-t border-slate-100 text-xs">
                  <span className="font-bold text-slate-700">Reported Symptoms: </span>
                  <span className="text-slate-600">{nextAppointment.symptoms}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No Upcoming Appointments</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You do not have any scheduled consultations at this time. Book a slot with our specialist doctors whenever needed.
              </p>
              <Link
                to="/patient/book"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Book Appointment</span>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Recent Past Appointments */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Recent Consultation History
          </h3>

          {loading ? (
            <ShimmerCard />
          ) : history.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100">
              {history.slice(0, 3).map((item) => (
                <div key={item.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                      {item.doctor_name?.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{item.doctor_name}</span>
                        <StatusBadge status={item.status} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {item.department_name} •{' '}
                        {new Date(item.appointment_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        at {item.time_slot}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/patient/appointments"
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 text-center text-xs text-slate-400 border border-slate-200">
              No previous bookings recorded.
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
