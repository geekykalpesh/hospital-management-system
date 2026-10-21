import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import {
  Users,
  Search,
  Calendar,
  Heart,
  Phone,
  Mail,
  ShieldAlert,
  MapPin,
} from 'lucide-react';
import CopyPill from '../../components/common/CopyPill';
import { ShimmerTable } from '../../components/common/Shimmer';

export const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const queryParam = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const res = await api.get(`/admin/patients${queryParam}`);
      if (res.data.success) {
        setPatients(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load patient records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients();
  };

  return (
    <DashboardLayout title="Hospital Patient Directory">
      <div className="space-y-6">
        
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Registered Patient Records
            </h3>
            <p className="text-xs text-slate-500">
              Electronic clinical dossiers, allergy profiles, and consultation visit counts
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search patient name, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-focus w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="btn-interactive px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 shrink-0"
            >
              Filter
            </button>
          </form>
        </div>

        {/* Patients Table */}
        {loading ? (
          <ShimmerTable rows={6} columns={6} />
        ) : patients.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">No Patient Records Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No registered patients match your search query.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Patient Name</th>
                    <th className="p-4">Contact Details</th>
                    <th className="p-4">Demographics</th>
                    <th className="p-4">Medical Alert / Allergies</th>
                    <th className="p-4">Emergency Contact</th>
                    <th className="p-4 text-right">Appointments Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((pat) => (
                    <tr key={pat.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{pat.full_name}</div>
                        <div className="text-[10px] text-slate-400">
                          Joined {new Date(pat.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="text-slate-800 font-semibold mb-1">
                          {pat.phone ? (
                            <CopyPill text={pat.phone} label={pat.phone} />
                          ) : (
                            'N/A'
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          <CopyPill text={pat.email} label={pat.email} />
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">
                            Blood: {pat.blood_group || 'O+'}
                          </span>
                          <span className="text-[10px] text-slate-400">({pat.gender || 'M'})</span>
                        </div>
                        {pat.date_of_birth && (
                          <div className="text-[10px] text-slate-400">
                            DOB: {new Date(pat.date_of_birth).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      <td className="p-4 max-w-xs">
                        {pat.medical_history ? (
                          <span className="text-teal-800 bg-teal-50 px-2 py-0.5 rounded text-[11px] border border-teal-200/60 block truncate">
                            {pat.medical_history}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">No allergies reported</span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="text-slate-700 text-xs">
                          {pat.emergency_contact || 'None listed'}
                        </div>
                        {pat.address && (
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">
                            {pat.address}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-brand-50 text-brand-700 border border-brand-200">
                          {pat.total_appointments} Visits
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default PatientManagement;
