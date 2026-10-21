import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  Plus,
  Trash2,
  Loader2,
  Stethoscope,
  Pill,
  Search,
  Phone,
  Printer,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import CopyPill from '../../components/common/CopyPill';
import { ShimmerTable } from '../../components/common/Shimmer';

export const DoctorAppointments = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState('all'); // 'all' | 'today' | 'upcoming' | 'history'
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Consultation & Prescription Modal State
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '1 tablet daily after food', duration: '5 days' },
  ]);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // View Prescription Modal State
  const [viewPrescriptionModalOpen, setViewPrescriptionModalOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const queryParam = filter !== 'all' ? `?filter=${filter}` : '';
      const res = await api.get(`/appointments/doctor-appointments${queryParam}`);
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load doctor appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  // Open Consultation Modal
  const handleOpenConsult = (app) => {
    setActiveAppointment(app);
    setDiagnosis(app.diagnosis || '');
    setMedicines(
      app.medicines
        ? Array.isArray(app.medicines)
          ? app.medicines
          : JSON.parse(app.medicines)
        : [{ name: '', dosage: '1 tablet twice daily after meals', duration: '5 days' }]
    );
    setDoctorNotes(app.doctor_notes || '');
    setFollowUpDate(app.follow_up_date ? app.follow_up_date.split('T')[0] : '');
    setModalError('');
    setConsultModalOpen(true);
  };

  // Add / Remove medicine row
  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '1 tablet daily', duration: '5 days' }]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  // Submit Prescription & Mark Completed
  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      setModalError('Please specify a clinical diagnosis.');
      return;
    }

    const validMeds = medicines.filter((m) => m.name.trim() !== '');

    setSubmitting(true);
    setModalError('');
    try {
      const res = await api.post(`/appointments/${activeAppointment.id}/prescription`, {
        diagnosis: diagnosis.trim(),
        medicines: validMeds,
        doctor_notes: doctorNotes.trim() || undefined,
        follow_up_date: followUpDate || undefined,
      });

      if (res.data.success) {
        setConsultModalOpen(false);
        toast.success(
          `Consultation completed and prescription recorded for ${activeAppointment.patient_name}!`,
          'Prescription Issued'
        );
        fetchAppointments();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to submit prescription.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick confirm status
  const handleQuickStatus = async (appId, newStatus, patientName) => {
    try {
      const res = await api.patch(`/appointments/${appId}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Slot approved for ${patientName}`, 'Status Updated');
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.', 'Error');
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      a.patient_name?.toLowerCase().includes(term) ||
      a.patient_phone?.toLowerCase().includes(term) ||
      a.symptoms?.toLowerCase().includes(term)
    );
  });

  return (
    <DashboardLayout title="Patient Consultations & Queue">
      <div className="space-y-6">
        
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
            {[
              { id: 'all', label: 'All Patients' },
              { id: 'today', label: "Today's Queue" },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'history', label: 'Completed / Past' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`btn-interactive px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  filter === tab.id
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search patient name, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-focus w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Appointments Table */}
        {loading ? (
          <ShimmerTable rows={6} columns={6} />
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">No Appointments Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no patient records matching your active filter criteria.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Schedule</th>
                    <th className="p-4">Patient Information</th>
                    <th className="p-4">Vitals & History</th>
                    <th className="p-4">Reported Symptoms</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Consultation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {new Date(app.appointment_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-[11px] font-semibold text-brand-600">
                          {app.time_slot}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900">{app.patient_name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          {app.patient_phone && (
                            <CopyPill text={app.patient_phone} label={app.patient_phone} />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{app.patient_email}</div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">
                            Blood: {app.blood_group || 'O+'}
                          </span>
                          <span className="text-[10px] text-slate-400">({app.gender || 'M'})</span>
                        </div>
                        {app.medical_history && (
                          <div className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded mt-1 max-w-xs truncate border border-teal-200/60">
                            {app.medical_history}
                          </div>
                        )}
                      </td>

                      <td className="p-4 max-w-xs">
                        <p className="text-slate-600 line-clamp-2">
                          {app.symptoms || 'General consultation visit'}
                        </p>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <StatusBadge status={app.status} size="sm" />
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          {app.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(app.id, 'confirmed', app.patient_name)}
                              className="btn-interactive px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs border border-emerald-200"
                            >
                              Approve
                            </button>
                          )}

                          {app.status !== 'completed' && app.status !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => handleOpenConsult(app)}
                              className="btn-interactive inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 shadow-xs shadow-brand-600/20"
                            >
                              <Stethoscope className="w-3.5 h-3.5" />
                              <span>Prescribe & Complete</span>
                            </button>
                          )}

                          {app.prescription_id && (
                            <button
                              type="button"
                              onClick={() => {
                                setViewTarget(app);
                                setViewPrescriptionModalOpen(true);
                              }}
                              className="btn-interactive inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs border border-indigo-200"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Prescription</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Clinical Consultation & Prescription Modal */}
        <Modal
          isOpen={consultModalOpen}
          onClose={() => setConsultModalOpen(false)}
          title={`Clinical Consultation - ${activeAppointment?.patient_name}`}
          maxWidth="max-w-3xl"
        >
          <form onSubmit={handleSubmitPrescription} className="space-y-5">
            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-semibold">{modalError}</span>
              </div>
            )}

            {/* Patient Overview Strip */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Patient Name</span>
                <span className="font-bold text-slate-800">{activeAppointment?.patient_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Blood Group</span>
                <span className="font-bold text-slate-800">
                  {activeAppointment?.blood_group || 'O+'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Time Slot</span>
                <span className="font-bold text-slate-800">{activeAppointment?.time_slot}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Known Allergies</span>
                <span className="font-bold text-slate-800 truncate block">
                  {activeAppointment?.medical_history || 'None'}
                </span>
              </div>
            </div>

            {/* Diagnosis Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Clinical Diagnosis *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acute Bacterial Pharyngitis, Type 2 Hypertension..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="input-focus w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
              />
            </div>

            {/* Dynamic Medicines Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700">
                  Prescribed Medications
                </label>
                <button
                  type="button"
                  onClick={handleAddMedicine}
                  className="btn-interactive inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medication Row</span>
                </button>
              </div>

              <div className="space-y-2">
                {medicines.map((med, idx) => (
                  <div key={idx} className="flex items-center gap-2 animate-fade-in">
                    <input
                      type="text"
                      placeholder="Drug Name (e.g. Amoxicillin 500mg)"
                      value={med.name}
                      onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                      className="input-focus flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 1 tab thrice daily)"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                      className="input-focus flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                    />
                    <input
                      type="text"
                      placeholder="Duration (e.g. 5 days)"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                      className="input-focus w-28 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                    />
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        className="btn-interactive p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor Clinical Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Clinical Instructions & Lifestyle Advice
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Adequate oral hydration, salt restriction, rest from strenuous athletic activity..."
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                className="input-focus w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900 resize-none"
              />
            </div>

            {/* Follow-up date */}
            <div className="max-w-xs">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Recommended Follow-up Date (Optional)
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="input-focus w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConsultModalOpen(false)}
                className="btn-interactive px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-interactive inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 shadow-md shadow-brand-600/25 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Finalizing Prescription...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Complete Consultation & Prescribe</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>

        {/* View Prescription Modal */}
        <Modal
          isOpen={viewPrescriptionModalOpen}
          onClose={() => setViewPrescriptionModalOpen(false)}
          title="Clinical Prescription Archive"
          maxWidth="max-w-2xl"
        >
          {viewTarget && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{viewTarget.patient_name}</h4>
                  <p className="text-[11px] text-slate-500">
                    Consultation on {new Date(viewTarget.appointment_date).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status="completed" size="sm" />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Diagnosis:
                </span>
                <p className="p-3 bg-teal-50 text-teal-900 text-xs font-bold rounded-xl border border-teal-200">
                  {viewTarget.diagnosis}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Prescribed Drugs:
                </span>
                <div className="overflow-hidden border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">Dosage</th>
                        <th className="p-2.5">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(Array.isArray(viewTarget.medicines)
                        ? viewTarget.medicines
                        : JSON.parse(viewTarget.medicines || '[]')
                      ).map((m, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-bold text-slate-800">{m.name}</td>
                          <td className="p-2.5 text-slate-600">{m.dosage}</td>
                          <td className="p-2.5 text-slate-600">{m.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {viewTarget.doctor_notes && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Instructions:
                  </span>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {viewTarget.doctor_notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal>

      </div>
    </DashboardLayout>
  );
};

export default DoctorAppointments;
