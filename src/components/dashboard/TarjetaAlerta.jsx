import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, Info } from 'lucide-react';

const CONFIGS = {
  critico:     { icon: AlertTriangle, bar: 'bg-rose-500',    bg: 'bg-rose-50',    border: 'border-rose-100',    title: 'text-rose-900',    msg: 'text-rose-700',    iconCls: 'text-rose-500'    },
  advertencia: { icon: AlertCircle,   bar: 'bg-amber-400',   bg: 'bg-amber-50',   border: 'border-amber-100',   title: 'text-amber-900',   msg: 'text-amber-700',   iconCls: 'text-amber-500'   },
  exito:       { icon: CheckCircle2,  bar: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', title: 'text-emerald-900', msg: 'text-emerald-700', iconCls: 'text-emerald-500' },
  info:        { icon: Info,          bar: 'bg-blue-500',    bg: 'bg-blue-50',    border: 'border-blue-100',    title: 'text-blue-900',    msg: 'text-blue-700',    iconCls: 'text-blue-500'    },
};

const TarjetaAlerta = ({ alerta }) => {
  const cfg  = CONFIGS[alerta.tipo] || CONFIGS.info;
  const Icon = cfg.icon;

  return (
    <div className={`relative flex items-start gap-3 px-4 py-3.5 rounded-xl border overflow-hidden ${cfg.bg} ${cfg.border}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bar}`} />
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${cfg.iconCls}`} />
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold leading-snug ${cfg.title}`}>{alerta.titulo}</p>
        <p className={`text-xs mt-0.5 ${cfg.msg}`}>{alerta.mensaje}</p>
      </div>
    </div>
  );
};

export default TarjetaAlerta;
