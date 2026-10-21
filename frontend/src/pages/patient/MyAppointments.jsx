import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  CalendarCheck,
  Stethoscope,
  XCircle,
  FileText,
  AlertCircle,
  MapPin,
  CalendarPlus,
  Loader2,
  DollarSign,
  ChevronRight,
  Info,
  Pill,
  Copy,
  Printer,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import CopyPill from '../../components/common/CopyPill';
import { ShimmerAppointmentCard } from '../../components/common/Shimmer';

export const MyAppointments = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'history'
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [targetAppointment, setTargetAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  // Prescription View Modal state
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/appointments/my-appointments?tab=${activeTab}`);
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const handleOpenCancel = (app) => {
    setTargetAppointment(app);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!targetAppointment) return;
    setCancelSubmitting(true);
    try {
      const res = await api.patch(`/appointments/${targetAppointment.id}/cancel`, {
        cancellation_reason: cancelReason.trim() || 'Patient requested cancellation',
      });
      if (res.data.success) {
        setCancelModalOpen(false);
        toast.info(
          `Appointment with ${targetAppointment.doctor_name} has been cancelled.`,
          'Booking Cancelled'
        );
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment.', 'Error');
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleOpenPrescription = (app) => {
    setSelectedPrescription(app);
    setPrescriptionModalOpen(true);
  };

  return (
    <DashboardLayout title="My Clinical Appointments">
      <div className="space-y-6">
        
        {/* Top Control Bar: Tabs & Book Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          {/* Segmented Tab Controls */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`btn-interactive flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'upcoming'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upcoming Appointments
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`btn-interactive flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Previous Bookings & History
            </button>
          </div>

          <Link
            to="/patient/book"
            className="btn-interactive inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 shadow-sm shadow-brand-600/20 shrink-0"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Book New Appointment</span>
          </Link>
        </div>

        {/* Content Section */}
        {loading ? (
          <ShimmerAppointmentCard count={3} />
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <CalendarCheck className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800">
              {activeTab === 'upcoming'
                ? 'No Upcoming Appointments Scheduled'
                : 'No Previous Bookings Found'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeTab === 'upcoming'
                ? 'When you schedule an appointment with one of our doctors, it will appear here with live status updates.'
                : 'Your completed or past appointment history and diagnostic prescriptions will be archived here.'}
            </p>
            {activeTab === 'upcoming' && (
              <Link
                to="/patient/book"
                className="btn-interactive inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors mt-2"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Book an Appointment</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {appointments.map((app) => (
              <div
                key={app.id}
                className="card-interactive bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover-lift"
              >
                <div className="space-y-4">
                  {/* Top Doctor Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-sm border border-teal-200 shrink-0 group-hover:scale-105 transition-transform">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {app.doctor_name}
                        </h4>
                        <p className="text-[11px] font-semibold text-brand-600 truncate">
                          {app.specialization}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{app.department_name}</p>
                      </div>
                    </div>
                    <StatusBadge status={app.status} size="sm" />
                  </div>

                  {/* Timing & Room Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Date:</span>
                      <span className="font-bold text-slate-800">
                        {new Date(app.appointment_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Time Slot:</span>
                      <span className="font-bold text-slate-800">{app.time_slot}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Clinic Room:</span>
                      <span className="font-bold text-slate-800">{app.room_number || 'OPD-1'}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-400 font-medium">Consultation Fee:</span>
                      <span className="font-bold text-slate-900">
                        ${parseFloat(app.consultation_fee || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Booking Reference Pill */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Reference Ref:</span>
                    <CopyPill text={app.id} label={`#${app.id.slice(0, 8)}`} />
                  </div>

                  {/* Symptoms Note */}
                  {app.symptoms && (
                    <div className="text-[11px] text-slate-600 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                      <span className="font-semibold text-slate-700">Symptoms: </span>
                      {app.symptoms}
                    </div>
                  )}

                  {/* Cancellation Reason if cancelled */}
                  {app.status === 'cancelled' && (
                    <div className="text-[11px] p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700">
                      <span className="font-bold">Cancellation Note: </span>
                      <span>{app.cancellation_reason || 'Cancelled'}</span>
                    </div>
                  )}
                </div>

                {/* Card Actions with Micro-interactions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {app.prescription_id ? (
                    <button
                      type="button"
                      onClick={() => handleOpenPrescription(app)}
                      className="btn-interactive w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold border border-indigo-200"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Prescription</span>
                    </button>
                  ) : app.status === 'pending' || app.status === 'confirmed' ? (
                    <button
                      type="button"
                      onClick={() => handleOpenCancel(app)}
                      className="btn-interactive w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold border border-rose-200"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel Booking</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic text-center w-full">
                      Archived Consultation
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title="Cancel Appointment"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Are you sure you want to cancel your appointment with{' '}
              <strong className="text-slate-900">{targetAppointment?.doctor_name}</strong> on{' '}
              <strong className="text-slate-900">
                {targetAppointment?.appointment_date &&
                  new Date(targetAppointment.appointment_date).toLocaleDateString()}{' '}
                at {targetAppointment?.time_slot}
              </strong>
              ?
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Schedule conflict, feeling better..."
                className="input-focus w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="btn-interactive px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                disabled={cancelSubmitting}
                onClick={handleConfirmCancel}
                className="btn-interactive inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 disabled:opacity-50"
              >
                {cancelSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Confirm Cancellation</span>
              </button>
            </div>
          </div>
        </Modal>

        {/* Digital Prescription Details Modal */}
        <Modal
          isOpen={prescriptionModalOpen}
          onClose={() => setPrescriptionModalOpen(false)}
          title="Electronic Prescription & Doctor Notes"
          maxWidth="max-w-2xl"
        >
          {selectedPrescription && (
            <div className="space-y-5">
              {/* Doctor and Date Header */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {selectedPrescription.doctor_name}
                  </h4>
                  <p className="text-xs font-semibold text-brand-600">
                    {selectedPrescription.specialization} • {selectedPrescription.department_name}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <div className="text-slate-400">Consultation Date</div>
                  <div className="font-bold text-slate-800">
                    {new Date(selectedPrescription.appointment_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Clinical Diagnosis */}
              <div>
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Clinical Diagnosis
                </h5>
                <div className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-200/80 text-xs font-semibold text-teal-900">
                  {selectedPrescription.diagnosis}
                </div>
              </div>

              {/* Medicines Table */}
              <div>
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Prescribed Medications
                </h5>
                <div className="overflow-hidden border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="p-3">Medicine Name</th>
                        <th className="p-3">Dosage & Frequency</th>
                        <th className="p-3">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(Array.isArray(selectedPrescription.medicines)
                        ? selectedPrescription.medicines
                        : JSON.parse(selectedPrescription.medicines || '[]')
                      ).map((med, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                            <Pill className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                            <span>{med.name}</span>
                          </td>
                          <td className="p-3 text-slate-600">{med.dosage}</td>
                          <td className="p-3 text-slate-600">{med.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Doctor Clinical Instructions / Notes */}
              {selectedPrescription.doctor_notes && (
                <div>
                  <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Physician's Instructions & Care Advice
                  </h5>
                  <p className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                    {selectedPrescription.doctor_notes}
                  </p>
                </div>
              )}

              {/* Follow-up date */}
              {selectedPrescription.follow_up_date && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Recommended Follow-up Visit:{' '}
                    <strong>{new Date(selectedPrescription.follow_up_date).toLocaleDateString()}</strong>
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-interactive inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Prescription</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrescriptionModalOpen(false)}
                  className="btn-interactive px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                >
                  Close Prescription
                </button>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </DashboardLayout>
  );
};

export default MyAppointments;
