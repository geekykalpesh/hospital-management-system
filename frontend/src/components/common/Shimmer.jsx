import React from 'react';

/**
 * Base Shimmer Element
 */
export const ShimmerBase = ({ className = '' }) => (
  <div className={`shimmer-wave rounded ${className}`} />
);

/**
 * Shimmer for KPI / Analytics Metric Cards
 */
export const ShimmerStats = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <ShimmerBase className="h-4 w-24" />
            <ShimmerBase className="h-10 w-10 rounded-xl" />
          </div>
          <ShimmerBase className="h-8 w-20" />
          <ShimmerBase className="h-3 w-36" />
        </div>
      ))}
    </div>
  );
};

/**
 * Shimmer for Data Tables (Appointments, Patients, Doctors)
 */
export const ShimmerTable = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="p-4 border-b border-slate-100 flex gap-4 bg-slate-50/50">
        {Array.from({ length: columns }).map((_, c) => (
          <div key={c} className="flex-1">
            <ShimmerBase className="h-4 w-3/4" />
          </div>
        ))}
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex items-center gap-4">
            {Array.from({ length: columns }).map((_, c) => (
              <div key={c} className="flex-1">
                <ShimmerBase className={`h-4 ${c === 0 ? 'w-4/5' : c === 1 ? 'w-2/3' : 'w-1/2'}`} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Shimmer for Appointment Booking Cards (Patient & Doctor Views)
 */
export const ShimmerAppointmentCard = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <ShimmerBase className="w-12 h-12 rounded-full" />
              <div className="space-y-1.5">
                <ShimmerBase className="h-4 w-32" />
                <ShimmerBase className="h-3 w-24" />
              </div>
            </div>
            <ShimmerBase className="h-6 w-20 rounded-full" />
          </div>
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <ShimmerBase className="h-3.5 w-full" />
            <ShimmerBase className="h-3.5 w-4/5" />
          </div>
          <div className="pt-2 flex justify-between items-center">
            <ShimmerBase className="h-4 w-20" />
            <ShimmerBase className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Shimmer for Generic Content Cards
 */
export const ShimmerCard = ({ className = '' }) => {
  return (
    <div className={`bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <ShimmerBase className="w-12 h-12 rounded-xl" />
        <div className="space-y-2 flex-1">
          <ShimmerBase className="h-4 w-1/3" />
          <ShimmerBase className="h-3 w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        <ShimmerBase className="h-3 w-full" />
        <ShimmerBase className="h-3 w-5/6" />
        <ShimmerBase className="h-3 w-3/4" />
      </div>
    </div>
  );
};

export default ShimmerBase;
