import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const CopyPill = ({ text, label, className = '' }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.info(`Copied ${label || 'text'} to clipboard`, 'Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Copy ${label || text}`}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 transition-all active:scale-95 cursor-pointer ${className}`}
    >
      <span>{label || text}</span>
      {copied ? (
        <Check className="w-3 h-3 text-emerald-600 animate-pop-in" />
      ) : (
        <Copy className="w-3 h-3 opacity-60 hover:opacity-100" />
      )}
    </button>
  );
};

export default CopyPill;
