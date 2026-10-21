import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  Stethoscope,
  User,
  MapPin,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import CopyPill from '../../components/common/CopyPill';
import { ShimmerTable } from '../../components/common/Shimmer';

export const MasterAppointments = () => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Status Update / Override Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState('confirmed');
  const [cancelReason, setCancelReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch filters metadata
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [deptRes, docRes] = await Promise.all([
          api.get('/departments'),
          api.get('/doctors'),
        ]);
        if (deptRes.data.success) setDepartments(deptRes.data.data);
        if (docRes.data.success) setDoctors(docRes.data.data);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    fetchMeta();
  }, []);

  const fetchMasterAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (deptFilter) params.append('department_id', deptFilter);
      if (doctorFilter) params.append('doctor_id', doctorFilter);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      if (searchTerm) params.append('search', searchTerm);

      const res = await api.get(`/appointments/all?${params.toString()}`);
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load master appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterAppointments();
  }, [statusFilter, deptFilter, doctorFilter, dateFrom, dateTo]);

  // Handle live search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMasterAppointments();
  };

  const handleOpenStatusModal = (app) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setCancelReason(app.cancellation_reason || '');
    setStatusModalOpen(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    setUpdatingStatus(true);
    try {
      if (newStatus === 'cancelled') {
        await api.patch(`/appointments/${selectedApp.id}/cancel`, {
          cancellation_reason: cancelReason.trim() || 'Administrative cancellation',
        });
        toast.info(
          `Appointment #${selectedApp.id.slice(0, 8)} cancelled by admin`,
          'Status Updated'
        );
      } else {
        await api.patch(`/appointments/${selectedApp.id}/status`, {
          status: newStatus,
        });
        toast.success(
          `Appointment status updated to ${newStatus.toUpperCase()}`,
          'Status Changed'
        );
      }
      setStatusModalOpen(false);
      fetchMasterAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update appointment status.', 'Error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <DashboardLayout title="Hospital Master Bookings Ledger">
      <div className="space-y-6">
        
        {/* Filter Controls Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Hospital-Wide Appointments Registry
              </h3>
              <p className="text-xs text-slate-500">
                Audit and monitor all upcoming and historical bookings across all clinical specialties
              </p>
            </div>

            {/* Live Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search patient, doctor, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-focus w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="btn-interactive px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 shrink-0"
              >
                Search
              </button>
            </form>
          </div>

          {/* Secondary Filter Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Booking Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-focus w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-800"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Department
              </label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="input-focus w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-800"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Assigned Doctor
              </label>
              <select
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
                className="input-focus w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-800"
              >
                <option value="">All Doctors</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input-focus w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input-focus w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Master Table */}
        {loading ? (
          <ShimmerTable rows={6} columns={6} />
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">No Appointments Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No hospital bookings match your chosen filter criteria. Try clearing some filters.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Schedule</th>
                    <th className="p-4">Patient Details</th>
                    <th className="p-4">Physician & Department</th>
                    <th className="p-4">Consultation Fee</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {appointments.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {new Date(app.appointment_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[11px] font-semibold text-brand-600">
                          {app.time_slot}
                        </div>
                        <div className="mt-1">
                          <CopyPill text={app.id} label={`#${app.id.slice(0, 8)}`} />
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-800">{app.patient_name}</div>
                        <div className="text-[11px] text-slate-500">{app.patient_phone}</div>
                        <div className="text-[10px] text-slate-400">{app.patient_email}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-800">{app.doctor_name}</div>
                        <div className="text-[11px] text-brand-600 font-semibold">
                          {app.department_name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Room {app.room_number || 'OPD-1'}
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap font-bold text-slate-800">
                        ${parseFloat(app.consultation_fee || 0).toFixed(2)}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <StatusBadge status={app.status} size="sm" />
                        {app.cancellation_reason && (
                          <div className="text-[10px] text-rose-600 mt-1 max-w-xs truncate">
                            Reason: {app.cancellation_reason}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenStatusModal(app)}
                          className="btn-interactive px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Admin Status Override Modal */}
        <Modal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          title="Administrative Booking Status Override"
        >
          <form onSubmit={handleSaveStatus} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
              <div>
                <span className="text-slate-400">Patient: </span>
                <strong className="text-slate-800">{selectedApp?.patient_name}</strong>
              </div>
              <div>
                <span className="text-slate-400">Doctor: </span>
                <strong className="text-slate-800">{selectedApp?.doctor_name}</strong> (
                {selectedApp?.department_name})
              </div>
              <div>
                <span className="text-slate-400">Date & Slot: </span>
                <strong className="text-slate-800">
                  {selectedApp && new Date(selectedApp.appointment_date).toLocaleDateString()} at{' '}
                  {selectedApp?.time_slot}
                </strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="input-focus w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
              >
                <option value="pending">Pending Approval</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {newStatus === 'cancelled' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Cancellation Reason
                </label>
                <textarea
                  rows={2}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Administrative reason for cancellation..."
                  className="input-focus w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900 resize-none"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="btn-interactive px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updatingStatus}
                className="btn-interactive inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 disabled:opacity-50"
              >
                {updatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </Modal>

      </div>
    </DashboardLayout>
  );
};

export default MasterAppointments;
