import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const CONFIGS = {
  exito:      { icon: CheckCircle2, bg: 'bg-emerald-50', border: 'border-emerald-200', iconColor: 'text-emerald-600', bar: 'bg-emerald-500', text: 'text-emerald-900' },
  error:      { icon: XCircle,      bg: 'bg-rose-50',    border: 'border-rose-200',    iconColor: 'text-rose-600',    bar: 'bg-rose-500',    text: 'text-rose-900'    },
  advertencia:{ icon: AlertTriangle,bg: 'bg-amber-50',   border: 'border-amber-200',   iconColor: 'text-amber-600',   bar: 'bg-amber-500',   text: 'text-amber-900'   },
  info:       { icon: Info,         bg: 'bg-blue-50',    border: 'border-blue-200',    iconColor: 'text-blue-600',    bar: 'bg-blue-500',    text: 'text-blue-900'    },
};

const Toast = ({ toast, onClose }) => {
  if (!toast.show) return null;

  const cfg = CONFIGS[toast.tipo] || CONFIGS.info;
  const Icon = cfg.icon;

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-sm w-full animate-slide-in">
      <div className={`relative flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-card-lg border ${cfg.bg} ${cfg.border} overflow-hidden`}>
        {/* Barra lateral de color */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bar} rounded-l-2xl`} />

        {/* Ícono */}
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${cfg.iconColor}`} />

        {/* Mensaje */}
        <p className={`flex-1 text-sm font-medium leading-snug whitespace-pre-line ${cfg.text}`}>
          {toast.mensaje}
        </p>

        {/* Cerrar */}
        <button
          onClick={onClose}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
