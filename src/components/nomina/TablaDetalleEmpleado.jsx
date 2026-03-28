// src/components/nomina/TablaDetalleEmpleado.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, User } from 'lucide-react';

const TablaDetalleEmpleado = ({ empleado, asignaciones, operaciones, prendas }) => {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
        onClick={() => setExpandido(!expandido)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {expandido
            ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
          <div className="w-8 h-8 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-brand-600">{empleado.nombre.charAt(0)}</span>
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 truncate">{empleado.nombre}</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {empleado.operaciones} ops · {empleado.piezas} piezas
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-emerald-600">${empleado.monto.toLocaleString()}</p>
          <p className="text-xs text-slate-400">total a pagar</p>
        </div>
      </div>

      {/* Detail table */}
      {expandido && (
        <div className="border-t border-slate-100">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Fecha Asignada</th>
                  <th>Fecha Terminada</th>
                  <th>Prenda</th>
                  <th>Operación</th>
                  <th>Talla</th>
                  <th>Cantidad</th>
                  <th>Valor Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {asignaciones.map(a => {
                  const op = operaciones.find(o => o.id === a.operacion_id);
                  const prenda = prendas.find(p => p.id === a.prenda_id);
                  return (
                    <tr key={a.id}>
                      <td className="text-slate-500">{new Date(a.fecha).toLocaleDateString('es-CO')}</td>
                      <td>
                        {a.fecha_terminado
                          ? <span className="text-emerald-600 font-medium">{new Date(a.fecha_terminado).toLocaleDateString('es-CO')}</span>
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="text-slate-600">{prenda?.referencia || '—'}</td>
                      <td className="font-medium text-slate-800">{op?.nombre || '—'}</td>
                      <td>{a.talla}</td>
                      <td className="font-semibold">{a.cantidad}</td>
                      <td className="text-slate-500">${op?.costo?.toLocaleString() || 0}</td>
                      <td className="font-bold text-emerald-600">${parseFloat(a.monto || 0).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200">
                  <td colSpan="7" className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Total {empleado.nombre}
                  </td>
                  <td className="px-4 py-3 font-bold text-base text-emerald-600">
                    ${empleado.monto.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablaDetalleEmpleado;
