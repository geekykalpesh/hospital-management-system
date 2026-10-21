import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import {
  Users,
  Stethoscope,
  Calendar,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  Activity,
  ClipboardList,
  ChevronRight,
  ArrowRight,
  Clock,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { ShimmerStats, ShimmerTable } from '../../components/common/Shimmer';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout title="Hospital Operations & Executive Analytics">
      <div className="space-y-8">
        
        {/* Executive Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              System Administration
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hospital Master Command
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time surveillance of clinical appointments, physician schedules, patient registrations, and department workloads.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/appointments"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md transition-all"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Master Bookings Ledger</span>
            </Link>
          </div>
        </div>

        {/* Executive KPI Stats Cards */}
        {loading ? (
          <ShimmerStats count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">Total Doctors</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.total_doctors}</h3>
                <Link to="/admin/doctors" className="text-[11px] text-brand-600 font-semibold hover:underline">
                  Manage Directory →
                </Link>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">Total Patients</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats?.total_patients}</h3>
                <Link to="/admin/patients" className="text-[11px] text-sky-600 font-semibold hover:underline">
                  View Patient Records →
                </Link>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">Total Bookings</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {stats?.total_appointments}
                </h3>
                <span className="text-[11px] text-emerald-600 font-medium">
                  {stats?.today_appointments} Scheduled Today
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">Est. Consult Revenue</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  ${parseFloat(stats?.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {stats?.completed_appointments} Completed Consults
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>
        )}

        {/* Secondary Grid: Status Breakdown & Department Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Status Breakdown */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Hospital Appointments Breakdown
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70">
                <div className="text-slate-500 text-[11px]">Pending Approval</div>
                <div className="text-xl font-bold text-amber-800 mt-0.5">
                  {stats?.pending_appointments || 0}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70">
                <div className="text-slate-500 text-[11px]">Confirmed Slots</div>
                <div className="text-xl font-bold text-emerald-800 mt-0.5">
                  {stats?.confirmed_appointments || 0}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/70">
                <div className="text-slate-500 text-[11px]">Completed Consults</div>
                <div className="text-xl font-bold text-sky-800 mt-0.5">
                  {stats?.completed_appointments || 0}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/70">
                <div className="text-slate-500 text-[11px]">Cancelled Visits</div>
                <div className="text-xl font-bold text-rose-800 mt-0.5">
                  {stats?.cancelled_appointments || 0}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/admin/appointments"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                <span>Filter & Inspect All Records</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Department Distribution */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Department Consultations Load
              </h3>
              <span className="text-xs text-slate-400">Total Across Hospital</span>
            </div>

            <div className="space-y-3">
              {stats?.department_distribution?.map((dept, i) => {
                const total = Math.max(stats.total_appointments, 1);
                const pct = Math.round((dept.appointment_count / total) * 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{dept.department_name}</span>
                      <span className="font-bold text-slate-900">
                        {dept.appointment_count} bookings ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-brand-600 transition-all duration-500"
                        style={{ width: `${Math.max(pct, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Recent Hospital Booking Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Recent Appointment Stream
              </h3>
              <p className="text-xs text-slate-500">Live feed of hospital registrations and visits</p>
            </div>
            <Link
              to="/admin/appointments"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              <span>View All Past & Upcoming Bookings</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <ShimmerTable rows={5} columns={5} />
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="p-4">Appointment Date</th>
                      <th className="p-4">Patient</th>
                      <th className="p-4">Doctor & Department</th>
                      <th className="p-4">Time Slot</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Ledger</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats?.recent_activity?.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 font-bold text-slate-900 whitespace-nowrap">
                          {new Date(item.appointment_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="p-4 font-bold text-slate-800">{item.patient_name}</td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-800">{item.doctor_name}</span>
                          <span className="text-[10px] text-brand-600 block">
                            {item.department_name}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-slate-700 whitespace-nowrap">
                          {item.time_slot}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <StatusBadge status={item.status} size="sm" />
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            to="/admin/appointments"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
