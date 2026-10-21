import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import {
  Stethoscope,
  Plus,
  Trash2,
  Mail,
  Phone,
  Clock,
  DollarSign,
  AlertCircle,
  Loader2,
  CheckCircle,
  Search,
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import CopyPill from '../../components/common/CopyPill';
import { ShimmerCard } from '../../components/common/Shimmer';

export const DoctorManagement = () => {
  const { toast } = useToast();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add Doctor Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    department_id: '',
    specialization: '',
    qualification: '',
    experience_years: 5,
    consultation_fee: 100.0,
    room_number: '',
    shift_start: '09:00:00',
    shift_end: '17:00:00',
    bio: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docRes, deptRes] = await Promise.all([api.get('/doctors'), api.get('/departments')]);
      if (docRes.data.success) setDoctors(docRes.data.data);
      if (deptRes.data.success) {
        setDepartments(deptRes.data.data);
        if (deptRes.data.data.length > 0) {
          setFormData((prev) => ({ ...prev, department_id: deptRes.data.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load doctors data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      const res = await api.post('/doctors', {
        ...formData,
        department_id: parseInt(formData.department_id, 10),
        experience_years: parseInt(formData.experience_years, 10),
        consultation_fee: parseFloat(formData.consultation_fee),
      });

      if (res.data.success) {
        setModalOpen(false);
        toast.success(
          `Dr. ${formData.full_name} registered successfully to ${departments.find(d => d.id == formData.department_id)?.name || 'staff'}!`,
          'Doctor Registered'
        );
        setFormData({
          full_name: '',
          email: '',
          password: '',
          phone: '',
          department_id: departments[0]?.id || '',
          specialization: '',
          qualification: '',
          experience_years: 5,
          consultation_fee: 100.0,
          room_number: '',
          shift_start: '09:00:00',
          shift_end: '17:00:00',
          bio: '',
        });
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create doctor.';
      setModalError(msg);
      toast.error(msg, 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDoctor = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove doctor "${name}" from the system?`)) return;
    try {
      const res = await api.delete(`/doctors/${id}`);
      if (res.data.success) {
        toast.info(`Doctor "${name}" removed from clinical directory.`, 'Doctor Removed');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete doctor.', 'Error');
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      doc.full_name?.toLowerCase().includes(term) ||
      doc.specialization?.toLowerCase().includes(term) ||
      doc.department_name?.toLowerCase().includes(term)
    );
  });

  return (
    <DashboardLayout title="Hospital Doctor Directory">
      <div className="space-y-6">
        
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Medical Staff & Physicians
            </h3>
            <p className="text-xs text-slate-500">
              Manage hospital specialists, outpatient clinic rooms, and consultation tariffs
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search physicians..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-focus w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="btn-interactive inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 shadow-sm shadow-brand-600/20 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Specialist Doctor</span>
            </button>
          </div>
        </div>

        {/* Doctor Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
            <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">No Doctors Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No doctor profiles match your current search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="card-interactive bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover-lift"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-sm border border-teal-200 shrink-0 group-hover:scale-105 transition-transform">
                        {doc.full_name?.replace('Dr. ', '').charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{doc.full_name}</h4>
                        <p className="text-[11px] font-semibold text-brand-600 truncate">
                          {doc.specialization}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{doc.qualification}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        doc.is_available
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {doc.is_available ? 'Active' : 'Away'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Department:</span>
                      <span className="font-bold text-slate-800">{doc.department_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Consultation Fee:</span>
                      <span className="font-bold text-slate-800">
                        ${parseFloat(doc.consultation_fee).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Clinic Room:</span>
                      <span className="font-bold text-slate-800">{doc.room_number || 'OPD-1'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Shift Hours:</span>
                      <span className="font-bold text-slate-800">
                        {doc.shift_start?.slice(0, 5)} - {doc.shift_end?.slice(0, 5)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center justify-between gap-1.5 truncate">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Mail className="w-3.5 h-3.5 shrink-0" /> Email:
                      </span>
                      <CopyPill text={doc.email} label={doc.email} />
                    </div>
                    {doc.phone && (
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Phone className="w-3.5 h-3.5 shrink-0" /> Phone:
                        </span>
                        <CopyPill text={doc.phone} label={doc.phone} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteDoctor(doc.id, doc.full_name)}
                    className="btn-interactive p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove doctor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Doctor Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Register New Attending Physician"
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleCreateDoctor} className="space-y-4">
            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{modalError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Doctor Name *
                </label>
                <input
                  type="text"
                  required
                  name="full_name"
                  placeholder="Dr. Jane Doe, MD"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="input-focus w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  name="email"
                  placeholder="doctor.jane@hospital.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-focus w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Temporary Password *
                </label>
                <input
                  type="password"
                  required
                  name="password"
                  minLength={6}
                  placeholder="Min. 6 chars"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-focus w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department *
                </label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className="input-focus w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specialization *
                </label>
                <input
                  type="text"
                  required
                  name="specialization"
                  placeholder="e.g. Pediatric Cardiology"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="input-focus w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Qualification *
                </label>
                <input
                  type="text"
                  required
                  name="qualification"
                  placeholder="MD, FAAP - Harvard Medical"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="input-focus w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Consultation Fee ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="consultation_fee"
                  value={formData.consultation_fee}
                  onChange={handleChange}
                  className="input-focus w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinic Room Number
                </label>
                <input
                  type="text"
                  name="room_number"
                  placeholder="Suite 204-B"
                  value={formData.room_number}
                  onChange={handleChange}
                  className="input-focus w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn-interactive px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-interactive inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 shadow-sm shadow-brand-600/25 disabled:opacity-50"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Create Doctor Profile</span>
              </button>
            </div>
          </form>
        </Modal>

      </div>
    </DashboardLayout>
  );
};

export default DoctorManagement;
