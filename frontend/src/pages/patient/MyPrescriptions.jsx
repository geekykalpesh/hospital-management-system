import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../api/axios';
import { FileText, Calendar, Stethoscope, Pill, Download, Printer } from 'lucide-react';
import { ShimmerCard } from '../../components/common/Shimmer';

export const MyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await api.get('/appointments/my-appointments?tab=history');
        if (res.data.success) {
          const withPrescriptions = res.data.data.filter((a) => a.prescription_id);
          setPrescriptions(withPrescriptions);
        }
      } catch (err) {
        console.error('Failed to load prescriptions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout title="My Electronic Prescriptions">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Clinical Diagnoses & Medications
            </h3>
            <p className="text-xs text-slate-500">
              Verified clinical prescriptions issued by attending doctors
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Records</span>
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <ShimmerCard />
            <ShimmerCard />
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Prescriptions on File</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Once you complete an appointment consultation with a physician, your electronic prescription and medication regimen will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {prescriptions.map((item) => {
              const meds = Array.isArray(item.medicines)
                ? item.medicines
                : JSON.parse(item.medicines || '[]');

              return (
                <div
                  key={item.prescription_id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.doctor_name}</h4>
                        <p className="text-[11px] font-semibold text-brand-600">
                          {item.specialization} • {item.department_name}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-600" />
                      <span>
                        Date:{' '}
                        <strong>{new Date(item.appointment_date).toLocaleDateString()}</strong>
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Diagnosis:
                    </span>
                    <div className="p-3 rounded-xl bg-teal-50/60 text-teal-900 font-semibold text-xs border border-teal-200/70">
                      {item.diagnosis}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Prescribed Medications:
                    </span>
                    <div className="overflow-hidden border border-slate-200 rounded-2xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="p-3">Medicine</th>
                            <th className="p-3">Dosage</th>
                            <th className="p-3">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {meds.map((m, idx) => (
                            <tr key={idx}>
                              <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                                <Pill className="w-3.5 h-3.5 text-brand-600" />
                                <span>{m.name}</span>
                              </td>
                              <td className="p-3 text-slate-600">{m.dosage}</td>
                              <td className="p-3 text-slate-600">{m.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {item.doctor_notes && (
                    <div className="text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-700 block mb-1">Instructions:</span>
                      <p className="text-slate-600 leading-relaxed">{item.doctor_notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyPrescriptions;
