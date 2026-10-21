import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  Stethoscope,
  Heart,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  User,
  Check,
  Sparkles,
} from 'lucide-react';
import { ShimmerCard } from '../../components/common/Shimmer';

export const BookAppointment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Wizard state
  const [step, setStep] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form selections
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load departments and doctors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, docRes] = await Promise.all([
          api.get('/departments'),
          api.get('/doctors?available_only=true'),
        ]);
        if (deptRes.data.success) setDepartments(deptRes.data.data);
        if (docRes.data.success) setDoctors(docRes.data.data);
      } catch (err) {
        console.error('Failed to load booking dependencies:', err);
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchData();
  }, []);

  // Filter doctors by selected department
  const filteredDoctors = selectedDept
    ? doctors.filter((doc) => doc.department_id === parseInt(selectedDept, 10))
    : doctors;

  // When doctor and date are chosen, fetch available slots
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) {
      setSlots([]);
      setSelectedSlot('');
      return;
    }

    const fetchSlots = async () => {
      setSlotsLoading(true);
      setError('');
      try {
        const res = await api.get(`/doctors/${selectedDoctor.id}/available-slots?date=${selectedDate}`);
        if (res.data.success) {
          setSlots(res.data.slots || []);
        }
      } catch (err) {
        setError('Could not retrieve time slots for this date.');
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDoctor, selectedDate]);

  // Handle final booking submission
  const handleConfirmBooking = async () => {
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/appointments', {
        doctor_id: selectedDoctor.id,
        department_id: selectedDoctor.department_id,
        appointment_date: selectedDate,
        time_slot: selectedSlot,
        symptoms: symptoms.trim() || undefined,
      });

      if (res.data.success) {
        setSuccess(true);
        toast.success(
          `Appointment confirmed with ${selectedDoctor.full_name} on ${new Date(
            selectedDate
          ).toLocaleDateString()} at ${selectedSlot}!`,
          'Booking Confirmed'
        );
        setTimeout(() => {
          navigate('/patient/appointments');
        }, 1600);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to confirm appointment. Please pick another slot.';
      setError(msg);
      toast.error(msg, 'Booking Error');
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <DashboardLayout title="Book Specialist Appointment">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Step Indicator Header with Micro-interactions */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { num: 1, label: 'Select Doctor' },
              { num: 2, label: 'Date & Slot' },
              { num: 3, label: 'Symptoms' },
              { num: 4, label: 'Confirmation' },
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      step === s.num
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 scale-110 ring-2 ring-brand-200'
                        : step > s.num
                        ? 'bg-emerald-500 text-white scale-100'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {step > s.num ? <Check className="w-4 h-4 animate-pop-in" /> : s.num}
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-1 hidden sm:block transition-colors ${
                      step === s.num ? 'text-brand-700 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded transition-all duration-500 ${
                      step > idx + 1 ? 'bg-emerald-400' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-2 animate-pop-in">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="text-base font-bold">Appointment Successfully Confirmed!</h4>
            <p className="text-xs text-emerald-700">
              Your appointment request is saved in the hospital ledger. Redirecting...
            </p>
          </div>
        )}

        {/* STEP 1: Select Department & Doctor */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Step 1: Choose Department & Specialist
                </h3>
                <p className="text-xs text-slate-500">
                  Select a clinical specialty or choose directly from available doctors
                </p>
              </div>

              {/* Department Dropdown Filter */}
              <div className="w-full sm:w-64">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="input-focus w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-800"
                >
                  <option value="">All Clinical Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loadingInitial ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ShimmerCard />
                <ShimmerCard />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDoctors.map((doc) => {
                  const isSelected = selectedDoctor?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => {
                        setSelectedDoctor(doc);
                        toast.info(`Selected ${doc.full_name}`, 'Doctor Selected');
                      }}
                      className={`btn-interactive p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between text-left ${
                        isSelected
                          ? 'bg-teal-50/60 border-brand-500 ring-2 ring-brand-300 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-brand-200 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 mb-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-transform duration-200 ${
                            isSelected
                              ? 'bg-brand-600 text-white scale-105'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {doc.full_name?.replace('Dr. ', '').charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {doc.full_name}
                          </h4>
                          <p className="text-[11px] font-semibold text-brand-600 truncate">
                            {doc.specialization}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {doc.qualification}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 mb-3">
                        <div>
                          <span className="font-semibold text-slate-600">Department:</span>{' '}
                          {doc.department_name}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-600">Experience:</span>{' '}
                          {doc.experience_years} yrs
                        </div>
                        <div>
                          <span className="font-semibold text-slate-600">Room:</span>{' '}
                          {doc.room_number || 'OPD-1'}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-600">Fee:</span>{' '}
                          ${parseFloat(doc.consultation_fee).toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400">
                          Hours: {doc.shift_start?.slice(0, 5)} - {doc.shift_end?.slice(0, 5)}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all ${
                            isSelected
                              ? 'bg-brand-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          <span>{isSelected ? 'Selected' : 'Select Doctor'}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                type="button"
                disabled={!selectedDoctor}
                onClick={() => setStep(2)}
                className="btn-interactive inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 shadow-md shadow-brand-600/20 disabled:opacity-40"
              >
                <span>Continue to Date & Slots</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Choose Date & Available Slot */}
        {step === 2 && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Step 2: Choose Consultation Date & Time Slot
              </h3>
              <p className="text-xs text-slate-500">
                Selected Doctor:{' '}
                <span className="font-bold text-slate-800">{selectedDoctor?.full_name}</span> (
                {selectedDoctor?.department_name})
              </p>
            </div>

            {/* Date Picker Input */}
            <div className="max-w-xs">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Appointment Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-focus w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
                />
              </div>
            </div>

            {/* Time Slot Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Available 30-Minute Time Slots
              </label>

              {!selectedDate ? (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-400">
                  Please pick an appointment date above to view available clinical slots.
                </div>
              ) : slotsLoading ? (
                <div className="flex items-center justify-center p-8 text-xs text-slate-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
                  <span>Checking live schedule and conflicts...</span>
                </div>
              ) : slots.length === 0 ? (
                <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center space-y-1">
                  <p className="font-semibold">Doctor is not available on this date.</p>
                  <p className="text-[11px] text-amber-700">
                    The doctor does not hold outpatient clinics on this day. Please pick another date.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {slots.map((item) => {
                    const isSelected = selectedSlot === item.slot;
                    return (
                      <button
                        key={item.slot}
                        type="button"
                        disabled={item.is_booked}
                        onClick={() => {
                          setSelectedSlot(item.slot);
                          toast.info(`Slot: ${item.slot}`, 'Slot Picked');
                        }}
                        className={`btn-interactive py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center flex items-center justify-center gap-1 ${
                          item.is_booked
                            ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm scale-105'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 shrink-0 animate-pop-in" />}
                        <span>{item.slot}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-interactive inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={!selectedDate || !selectedSlot}
                onClick={() => setStep(3)}
                className="btn-interactive inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 disabled:opacity-40"
              >
                <span>Continue to Symptoms</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Symptoms Description */}
        {step === 3 && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Step 3: Reason for Consultation
              </h3>
              <p className="text-xs text-slate-500">
                Briefly describe what symptoms or questions you'd like to consult with the doctor about.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Symptoms & Concerns (Optional but recommended)
              </label>
              <textarea
                rows={4}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g. Experiencing mild headaches in afternoons, joint pain after running..."
                className="input-focus w-full px-3.5 py-3 text-xs border border-slate-200 rounded-2xl bg-slate-50 text-slate-900 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-interactive inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(4)}
                className="btn-interactive inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700"
              >
                <span>Review & Confirm</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Summary & Final Confirmation */}
        {step === 4 && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Step 4: Review Booking Summary
              </h3>
              <p className="text-xs text-slate-500">
                Please verify your appointment schedule before confirming.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
              <div className="flex items-start justify-between pb-4 border-b border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                    {selectedDoctor?.full_name?.replace('Dr. ', '').charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{selectedDoctor?.full_name}</h4>
                    <p className="text-xs font-semibold text-brand-600">
                      {selectedDoctor?.specialization} • {selectedDoctor?.department_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Consultation Fee</div>
                  <div className="text-base font-extrabold text-slate-900">
                    ${parseFloat(selectedDoctor?.consultation_fee || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Date:</span>
                  <span className="font-bold text-slate-800">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Time Slot:</span>
                  <span className="font-bold text-slate-800">{selectedSlot}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Clinic Room:</span>
                  <span className="font-bold text-slate-800">
                    {selectedDoctor?.room_number || 'OPD-1'}
                  </span>
                </div>
              </div>

              {symptoms && (
                <div className="pt-3 border-t border-slate-200/60 text-xs">
                  <span className="text-slate-400 block mb-0.5">Reported Symptoms:</span>
                  <span className="text-slate-700">{symptoms}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-interactive inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={submitting || success}
                onClick={handleConfirmBooking}
                className="btn-interactive inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 shadow-md shadow-brand-600/25 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming Appointment...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm & Book Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default BookAppointment;
