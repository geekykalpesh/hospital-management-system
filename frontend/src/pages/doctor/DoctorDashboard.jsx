import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle,
  Stethoscope,
  ChevronRight,
  AlertCircle,
  FileEdit,
  ArrowRight,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { ShimmerStats, ShimmerTable } from '../../components/common/Shimmer';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const profile = user?.profile || {};

  const [todayQueue, setTodayQueue] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [todayRes, allRes] = await Promise.all([
          api.get('/appointments/doctor-appointments?filter=today'),
          api.get('/appointments/doctor-appointments'),
        ]);
        if (todayRes.data.success) setTodayQueue(todayRes.data.data);
        if (allRes.data.success) setAllAppointments(allRes.data.data);
      } catch (err) {
        console.error('Error fetching doctor dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const completedCount = allAppointments.filter((a) => a.status === 'completed').length;
  const pendingCount = allAppointments.filter((a) => a.status === 'pending' || a.status === 'confirmed').length;

  return (
    <DashboardLayout title="Physician Clinical Station">
      <div className="space-y-8">
        
        {/* Doctor Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Department of {profile.department_name || 'Medicine'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good day, {user?.full_name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {profile.specialization} • {profile.qualification}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-xs text-xs">
            <div>
              <div className="text-slate-400 text-[11px]">Room Number</div>
              <div className="font-bold text-white text-sm">{profile.room_number || 'OPD-1'}</div>
            </div>
            <div className="h-8 w-px bg-white/10 mx-2" />
            <div>
              <div className="text-slate-400 text-[11px]">Clinic Shift</div>
              <div className="font-bold text-white text-sm">
                {profile.shift_start?.slice(0, 5)} - {profile.shift_end?.slice(0, 5)}
              </div>
            </div>
          </div>
        </div>

        {/* Counters */}
        {loading ? (
          <ShimmerStats count={3} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">Today's Patient Queue</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{todayQueue.length}</h3>
                <p className="text-[11px] text-teal-600 font-medium mt-1">Scheduled Today</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">Awaiting Consultation</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{pendingCount}</h3>
                <p className="text-[11px] text-amber-600 font-medium mt-1">Pending Action</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400">Consultations Completed</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{completedCount}</h3>
                <p className="text-[11px] text-sky-600 font-medium mt-1">Total Treated</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
        )}

        {/* Today's Queue Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Today's Patient Consultation Queue
              </h3>
              <p className="text-xs text-slate-500">
                Live outpatient line for current clinic hours
              </p>
            </div>
            <Link
              to="/doctor/appointments"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              <span>View Full Queue & History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <ShimmerTable rows={4} />
          ) : todayQueue.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">Queue is Clear for Today</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                There are no patient appointments scheduled on your calendar for today's date.
              </p>
              <Link
                to="/doctor/appointments"
                className="inline-flex items-center gap-1.5 text-xs text-brand-600 font-bold hover:underline pt-2"
              >
                <span>Check Upcoming Consultations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="p-4">Time Slot</th>
                      <th className="p-4">Patient Name</th>
                      <th className="p-4">Blood & DOB</th>
                      <th className="p-4">Symptoms</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {todayQueue.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{item.time_slot}</td>
                        <td className="p-4 font-bold text-slate-800">
                          {item.patient_name}
                          <div className="text-[11px] text-slate-400 font-normal">
                            {item.patient_phone || item.patient_email}
                          </div>
                        </td>
                        <td className="p-4 text-slate-600">
                          <span className="font-semibold">{item.blood_group || 'O+'}</span>
                          <div className="text-[10px] text-slate-400">{item.gender || 'Patient'}</div>
                        </td>
                        <td className="p-4 text-slate-600 max-w-xs truncate">
                          {item.symptoms || 'General consultation'}
                        </td>
                        <td className="p-4">
                          <StatusBadge status={item.status} size="sm" />
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            to="/doctor/appointments"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 font-semibold text-xs transition-colors border border-brand-200"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                            <span>Consult</span>
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

export default DoctorDashboard;
