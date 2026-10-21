import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', title, message, duration = 4000 }) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (message, title = 'Success') => addToast({ type: 'success', title, message }),
    error: (message, title = 'Error') => addToast({ type: 'error', title, message }),
    info: (message, title = 'Notice') => addToast({ type: 'info', title, message }),
    warning: (message, title = 'Warning') => addToast({ type: 'warning', title, message }),
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((item) => {
          const config = {
            success: {
              border: 'border-emerald-200/90',
              bg: 'bg-white',
              badge: 'bg-emerald-50 text-emerald-700',
              icon: CheckCircle2,
              iconColor: 'text-emerald-600',
            },
            error: {
              border: 'border-rose-200/90',
              bg: 'bg-white',
              badge: 'bg-rose-50 text-rose-700',
              icon: AlertCircle,
              iconColor: 'text-rose-600',
            },
            warning: {
              border: 'border-amber-200/90',
              bg: 'bg-white',
              badge: 'bg-amber-50 text-amber-700',
              icon: AlertTriangle,
              iconColor: 'text-amber-600',
            },
            info: {
              border: 'border-sky-200/90',
              bg: 'bg-white',
              badge: 'bg-sky-50 text-sky-700',
              icon: Info,
              iconColor: 'text-sky-600',
            },
          }[item.type] || {
            border: 'border-slate-200',
            bg: 'bg-white',
            badge: 'bg-slate-50 text-slate-700',
            icon: Info,
            iconColor: 'text-slate-600',
          };

          const IconComponent = config.icon;

          return (
            <div
              key={item.id}
              className={`pointer-events-auto w-full ${config.bg} p-4 rounded-2xl shadow-xl shadow-slate-900/10 border ${config.border} flex items-start gap-3 animate-slide-in-right transition-all group`}
            >
              <div
                className={`w-8 h-8 rounded-xl ${config.badge} flex items-center justify-center shrink-0 mt-0.5`}
              >
                <IconComponent className={`w-4 h-4 ${config.iconColor}`} />
              </div>

              <div className="flex-1 min-w-0 pr-1">
                {item.title && (
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {item.title}
                  </h4>
                )}
                <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                  {item.message}
                </p>
              </div>

              <button
                onClick={() => removeToast(item.id)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
