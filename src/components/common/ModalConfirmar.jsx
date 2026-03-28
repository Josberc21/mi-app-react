import React from 'react';
import { AlertTriangle, Trash2, CheckCircle2, Info } from 'lucide-react';
import Modal from './Modal';

const CONFIGS = {
  danger:  { icon: Trash2,        iconBg: 'bg-rose-100',   iconColor: 'text-rose-600',   btnClass: 'btn-danger',   btnLabel: 'Eliminar'   },
  warning: { icon: AlertTriangle, iconBg: 'bg-amber-100',  iconColor: 'text-amber-600',  btnClass: 'bg-amber-600 hover:bg-amber-700 text-white inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all', btnLabel: 'Confirmar'  },
  success: { icon: CheckCircle2,  iconBg: 'bg-emerald-100',iconColor: 'text-emerald-600',btnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all', btnLabel: 'Confirmar'  },
  info:    { icon: Info,          iconBg: 'bg-blue-100',   iconColor: 'text-blue-600',   btnClass: 'btn-primary',  btnLabel: 'Confirmar'  },
};

const ModalConfirmar = ({ isOpen, onClose, onConfirm, titulo, mensaje, tipo = 'warning' }) => {
  const cfg = CONFIGS[tipo] || CONFIGS.warning;
  const Icon = cfg.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titulo} size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cfg.iconBg}`}>
          <Icon className={`w-7 h-7 ${cfg.iconColor}`} />
        </div>
        <p className="text-slate-600 text-sm leading-relaxed">{mensaje}</p>
      </div>

      <div className="flex gap-3 justify-end mt-6">
        <button onClick={onClose} className="btn-secondary">
          Cancelar
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={cfg.btnClass}
        >
          {cfg.btnLabel}
        </button>
      </div>
    </Modal>
  );
};

export default ModalConfirmar;
