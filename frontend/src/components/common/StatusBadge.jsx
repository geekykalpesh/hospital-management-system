import React from 'react';
import { CheckCircle2, Clock, Check, XCircle } from 'lucide-react';

export const StatusBadge = ({ status = 'pending', size = 'md' }) => {
  const normStatus = status?.toLowerCase() || 'pending';

  const config = {
    pending: {
      label: 'Pending Approval',
      classes: 'bg-amber-50 text-amber-700 border-amber-200/80 hover:bg-amber-100/60',
      icon: Clock,
      hasPulse: true,
      pulseColor: 'bg-amber-400',
    },
    confirmed: {
      label: 'Confirmed',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/60',
      icon: CheckCircle2,
      hasPulse: false,
    },
    completed: {
      label: 'Completed',
      classes: 'bg-sky-50 text-sky-700 border-sky-200/80 hover:bg-sky-100/60',
      icon: Check,
      hasPulse: false,
    },
    cancelled: {
      label: 'Cancelled',
      classes: 'bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100/60',
      icon: XCircle,
      hasPulse: false,
    },
  }[normStatus] || {
    label: status,
    classes: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: Clock,
    hasPulse: false,
  };

  const IconComponent = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.classes} ${sizeClasses} tracking-tight transition-all duration-200 shadow-2xs select-none`}
    >
      {config.hasPulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.pulseColor} opacity-75`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.pulseColor}`} />
        </span>
      )}
      <IconComponent className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
