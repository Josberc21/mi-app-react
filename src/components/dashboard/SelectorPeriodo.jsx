// src/components/dashboard/SelectorPeriodo.jsx
import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { PERIODOS, obtenerNombrePeriodo, formatearRangoFechas, obtenerRangoPeriodo } from '../../utils/timeUtils';

const SelectorPeriodo = ({ periodoActual, onCambioPeriodo }) => {
  const rangoPeriodo = obtenerRangoPeriodo(periodoActual);

  const opciones = [
    { valor: PERIODOS.ULTIMOS_7_DIAS, label: 'Últimos 7 días' },
    { valor: PERIODOS.ULTIMOS_30_DIAS, label: 'Últimos 30 días' },
    { valor: PERIODOS.ULTIMOS_90_DIAS, label: 'Últimos 90 días' },
    { valor: PERIODOS.ESTE_MES, label: 'Este mes' },
    { valor: PERIODOS.MES_ANTERIOR, label: 'Mes anterior' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Selector de período */}
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <div className="relative">
            <select
              value={periodoActual}
              onChange={(e) => onCambioPeriodo(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
            >
              {opciones.map(opcion => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Rango de fechas */}
        <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
          <span className="font-medium">{formatearRangoFechas(rangoPeriodo)}</span>
        </div>
      </div>
    </div>
  );
};

export default SelectorPeriodo;