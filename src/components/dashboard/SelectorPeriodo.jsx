import React from 'react';
import { Calendar } from 'lucide-react';
import { PERIODOS, formatearRangoFechas, obtenerRangoPeriodo } from '../../utils/timeUtils';

const OPCIONES = [
  { valor: PERIODOS.ULTIMOS_7_DIAS,  label: '7 días'  },
  { valor: PERIODOS.ULTIMOS_30_DIAS, label: '30 días' },
  { valor: PERIODOS.ULTIMOS_90_DIAS, label: '90 días' },
  { valor: PERIODOS.ESTE_MES,        label: 'Este mes'      },
  { valor: PERIODOS.MES_ANTERIOR,    label: 'Mes anterior'  },
];

const SelectorPeriodo = ({ periodoActual, onCambioPeriodo }) => {
  const rango = obtenerRangoPeriodo(periodoActual);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Tabs de período */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
        {OPCIONES.map(op => (
          <button
            key={op.valor}
            onClick={() => onCambioPeriodo(op.valor)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              periodoActual === op.valor
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>

      {/* Rango de fechas */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
        <Calendar className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-medium">{formatearRangoFechas(rango)}</span>
      </div>
    </div>
  );
};

export default SelectorPeriodo;
