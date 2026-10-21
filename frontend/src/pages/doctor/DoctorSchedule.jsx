import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Clock, Calendar, CheckCircle, AlertCircle, DollarSign, MapPin, Loader2, Check } from 'lucide-react';

export const DoctorSchedule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const profile = user?.profile || {};

  const [availableDays, setAvailableDays] = useState(
    Array.isArray(profile.available_days)
      ? profile.available_days
      : JSON.parse(profile.available_days || '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]')
  );
  const [shiftStart, setShiftStart] = useState(profile.shift_start?.slice(0, 5) || '09:00');
  const [shiftEnd, setShiftEnd] = useState(profile.shift_end?.slice(0, 5) || '17:00');
  const [consultationFee, setConsultationFee] = useState(profile.consultation_fee || '50.00');
  const [roomNumber, setRoomNumber] = useState(profile.room_number || 'OPD-1');
  const [isAvailable, setIsAvailable] = useState(profile.is_available !== false);

  const [saving, setSaving] = useState(false);

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleToggleDay = (day) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.put(`/doctors/${user.id}`, {
        available_days: availableDays,
        shift_start: `${shiftStart}:00`,
        shift_end: `${shiftEnd}:00`,
        consultation_fee: parseFloat(consultationFee),
        room_number: roomNumber,
        is_available: isAvailable,
      });

      if (res.data.success) {
        toast.success(
          'Clinic working hours and fee schedule saved successfully!',
          'Schedule Updated'
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update schedule.', 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Clinic Availability & Timings">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Weekly Practice Schedule
            </h3>
            <p className="text-xs text-slate-500">
              Patients will only be able to book 30-minute consultation slots on your designated working days.
            </p>
          </div>

          {/* Working Days Selector with Micro-interactions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Designated Clinic Days
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {allDays.map((day) => {
                const active = availableDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`btn-interactive py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-1 ${
                      active
                        ? 'bg-brand-600 text-white border-brand-600 shadow-xs scale-102'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5 shrink-0 animate-pop-in" />}
                    <span>{day}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shift Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Shift Start Time
              </label>
              <input
                type="time"
                value={shiftStart}
                onChange={(e) => setShiftStart(e.target.value)}
                className="input-focus w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Shift End Time
              </label>
              <input
                type="time"
                value={shiftEnd}
                onChange={(e) => setShiftEnd(e.target.value)}
                className="input-focus w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
              />
            </div>
          </div>

          {/* Fee & Room Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Consultation Fee ($ USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                className="input-focus w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Clinic Room / OPD Station
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="Suite 302-A"
                className="input-focus w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-900"
              />
            </div>
          </div>

          {/* Availability Toggle with Micro-interaction */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
            <div>
              <div className="text-xs font-bold text-slate-800">Available for Online Appointments</div>
              <div className="text-[11px] text-slate-400">
                When disabled, patients cannot book new slots with you.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => {
                  setIsAvailable(e.target.checked);
                  toast.info(
                    e.target.checked ? 'Online booking enabled' : 'Online booking disabled',
                    'Availability Status'
                  );
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="btn-interactive inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 shadow-md shadow-brand-600/25 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              <span>Save Practice Settings</span>
            </button>
          </div>
        </form>

      </div>
    </DashboardLayout>
  );
};

export default DoctorSchedule;
