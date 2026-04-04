// src/components/nomina/ResumenNomina.jsx
import React from 'react';
import { Download, Users, Settings, Package, DollarSign, Loader2 } from 'lucide-react';

const ResumenNomina = ({
  nominaFiltrada,
  filtroFechaInicio,
  filtroFechaFin,
  onExportar,
  exportando = false,
  children
}) => {
  const totalGeneral = nominaFiltrada.reduce((sum, r) => sum + r.monto, 0);
  const totalOperaciones = nominaFiltrada.reduce((sum, e) => sum + e.operaciones, 0);
  const totalPiezas = nominaFiltrada.reduce((sum, e) => sum + e.piezas, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Reporte de Nómina Detallado</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {new Date(filtroFechaInicio).toLocaleDateString('es-CO')} al {new Date(filtroFechaFin).toLocaleDateString('es-CO')}
          </p>
        </div>
        <button
          onClick={onExportar}
          disabled={exportando}
          className="btn-primary gap-2 self-start sm:self-auto"
        >
          {exportando
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Download className="w-4 h-4" />
          }
          {exportando ? 'Exportando...' : 'Exportar Excel'}
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4.5 h-4.5 text-brand-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Total a Pagar</p>
              <p className="text-lg font-bold text-emerald-600 truncate">${totalGeneral.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-4.5 h-4.5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Empleados</p>
              <p className="text-lg font-bold text-slate-900">{nominaFiltrada.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Settings className="w-4.5 h-4.5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Operaciones</p>
              <p className="text-lg font-bold text-slate-900">{totalOperaciones.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Package className="w-4.5 h-4.5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Piezas</p>
              <p className="text-lg font-bold text-slate-900">{totalPiezas.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee detail tables */}
      {children}

      {/* Footer total */}
      <div className="card p-5 border-2 border-emerald-100 bg-emerald-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Total General del Período</p>
            <p className="text-xs text-slate-500 mt-1">
              {nominaFiltrada.length} empleados · {totalOperaciones.toLocaleString()} operaciones · {totalPiezas.toLocaleString()} piezas
            </p>
          </div>
          <p className="text-4xl font-bold text-emerald-600">${totalGeneral.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default ResumenNomina;
