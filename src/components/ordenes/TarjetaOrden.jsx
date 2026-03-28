import React from 'react';
import { Edit, Trash2, ChevronDown, ChevronRight, Calendar } from 'lucide-react';

const TarjetaOrden = ({
  orden,
  prenda,
  progreso,
  expandida,
  onToggleExpandir,
  onEditar,
  onEliminar
}) => {
  const pctCls = progreso.porcentaje === 100 ? 'badge-green' :
    progreso.porcentaje >= 50 ? 'badge-amber' : 'badge-red';

  return (
    <div className="card overflow-hidden hover:shadow-card-md transition-shadow">
      {/* HEADER */}
      <div
        className="px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
        onClick={onToggleExpandir}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {expandida
            ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900">{orden.numero_orden}</h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {prenda?.referencia} · {orden.color} · Talla {orden.talla}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-lg font-bold text-brand-600">
              {progreso.completadas}<span className="text-slate-300 font-normal">/{orden.cantidad_total}</span>
            </p>
            <p className="text-xs text-slate-400">piezas</p>
          </div>
          <span className={`badge ${pctCls}`}>{progreso.porcentaje}%</span>
        </div>
      </div>

      {/* DETALLE EXPANDIBLE */}
      {expandida && (
        <div className="border-t border-slate-100 p-4 bg-slate-50/50">
          <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Fecha entrada: {new Date(orden.fecha_entrada).toLocaleDateString('es-CO')}
          </p>

          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Progreso por Operación</p>
          <div className="space-y-2.5 mb-4">
            {progreso.detalles.map((det, idx) => (
              <div key={idx} className="bg-white rounded-xl px-3 py-2.5 border border-slate-100">
                <div className="flex items-center gap-3 mb-1.5">
                  <p className="text-sm font-medium text-slate-700 flex-1 truncate">{det.operacion}</p>
                  <span className="text-xs font-semibold text-slate-500 flex-shrink-0">{det.completadas}/{det.total}</span>
                  <span className={`badge ${det.porcentaje === 100 ? 'badge-green' : det.porcentaje >= 50 ? 'badge-amber' : 'badge-red'} flex-shrink-0`}>
                    {det.porcentaje}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${det.porcentaje === 100 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                    style={{ width: `${det.porcentaje}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-3 border-t border-slate-100">
            <button onClick={(e) => { e.stopPropagation(); onEditar(); }} className="btn-secondary text-xs gap-1.5 py-1.5 px-3">
              <Edit className="w-3.5 h-3.5" /> Editar
            </button>
            <button onClick={(e) => { e.stopPropagation(); onEliminar(); }} className="btn-danger text-xs gap-1.5 py-1.5 px-3">
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TarjetaOrden;
