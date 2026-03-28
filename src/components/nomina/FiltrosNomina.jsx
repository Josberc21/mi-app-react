// src/components/nomina/FiltrosNomina.jsx
import React from 'react';
import { Calendar, TrendingUp, X } from 'lucide-react';

const FiltrosNomina = ({
  filtroFechaInicio,
  filtroFechaFin,
  onChangeFechaInicio,
  onChangeFechaFin,
  onCalcular,
  onLimpiar,
  onRangoRapido
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Fecha Inicio
          </label>
          <input
            type="date"
            value={filtroFechaInicio}
            onChange={(e) => onChangeFechaInicio(e.target.value)}
            className="input-base"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Fecha Fin
          </label>
          <input
            type="date"
            value={filtroFechaFin}
            onChange={(e) => onChangeFechaFin(e.target.value)}
            className="input-base"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={onCalcular}
            disabled={!filtroFechaInicio || !filtroFechaFin}
            className="btn-primary w-full gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Calcular Nómina
          </button>
        </div>

        <div className="flex items-end">
          <button onClick={onLimpiar} className="btn-secondary w-full gap-2">
            <X className="w-4 h-4" />
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Rangos rápidos */}
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-semibold text-slate-500">Rangos rápidos:</p>
        {[7, 10, 15, 30].map(dias => (
          <button key={dias} onClick={() => onRangoRapido(dias)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-lg transition-colors">
            {dias === 30 ? 'Último mes' : `${dias} días`}
          </button>
        ))}
      </div>

      {filtroFechaInicio && filtroFechaFin && (
        <div className="flex items-start gap-2 px-3 py-2.5 bg-brand-50 border border-brand-100 rounded-xl">
          <Calendar className="w-3.5 h-3.5 text-brand-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-brand-700">
            <span className="font-semibold">Período seleccionado:</span>{' '}
            {new Date(filtroFechaInicio).toLocaleDateString('es-CO')} al {new Date(filtroFechaFin).toLocaleDateString('es-CO')}
          </p>
        </div>
      )}
    </div>
  );
};

export default FiltrosNomina;
