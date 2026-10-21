import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Calendar, Heart, MapPin, ShieldAlert, Award } from 'lucide-react';

export const PatientProfile = () => {
  const { user } = useAuth();
  const profile = user?.profile || {};

  return (
    <DashboardLayout title="Patient Medical Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-brand-500/20">
            {user?.full_name?.charAt(0) || 'P'}
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-xl font-bold text-slate-900">{user?.full_name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                Blood Group: {profile.blood_group || 'O+'}
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                Registered Patient
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Demographics Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Personal Information
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500 flex items-center gap-2">
                  <User className="w-4 h-4 text-brand-600" /> Full Name
                </span>
                <span className="font-bold text-slate-900">{user?.full_name}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-600" /> Email
                </span>
                <span className="font-bold text-slate-900">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-600" /> Phone
                </span>
                <span className="font-bold text-slate-900">{user?.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-600" /> Date of Birth
                </span>
                <span className="font-bold text-slate-900">
                  {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-500 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-brand-600" /> Gender
                </span>
                <span className="font-bold text-slate-900">{profile.gender || 'Not specified'}</span>
              </div>
            </div>
          </div>

          {/* Emergency & Medical Alerts Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Emergency & Clinical Notes
            </h4>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" /> Emergency Contact
                </span>
                <p className="text-amber-800 text-xs">
                  {profile.emergency_contact || 'None specified on record'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-600" /> Address
                </span>
                <p className="text-slate-600 text-xs">
                  {profile.address || 'No residential address stored'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-200/70 space-y-1">
                <span className="font-bold text-teal-900 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-teal-600" /> Known Allergies / Medical History
                </span>
                <p className="text-teal-800 text-xs">
                  {profile.medical_history || 'No chronic conditions reported.'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default PatientProfile;
