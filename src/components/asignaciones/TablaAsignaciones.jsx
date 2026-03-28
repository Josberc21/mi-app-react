import React from 'react';
import { Trash2, ArrowUpDown, CheckCheck, RotateCcw, ClipboardList } from 'lucide-react';

const TablaAsignaciones = ({
  asignaciones,
  empleados,
  operaciones,
  prendas,
  onCompletar,
  onRevertir,
  onEliminar,
  ordenEstado,
  onCambiarOrdenEstado,
}) => {
  if (asignaciones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <ClipboardList className="w-7 h-7 text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium">Sin asignaciones</p>
        <p className="text-slate-400 text-sm mt-1">Crea una nueva asignación con el formulario</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="table-base min-w-[900px]">
        <thead>
          <tr>
            <th>Empleado</th>
            <th>Prenda</th>
            <th>Color</th>
            <th>Operación</th>
            <th className="text-center">Cant.</th>
            <th className="text-center">Talla</th>
            <th className="text-right">Monto</th>
            <th
              className="cursor-pointer select-none hover:text-slate-800 transition-colors"
              onClick={onCambiarOrdenEstado}
              title="Clic para ordenar"
            >
              <div className="flex items-center gap-1">
                Estado
                <ArrowUpDown className="w-3 h-3" />
                {ordenEstado && (
                  <span className="text-brand-600 font-bold text-xs">
                    {ordenEstado === 'pendientes' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </th>
            <th className="text-right">Acción</th>
          </tr>
        </thead>
        <tbody>
          {asignaciones.map((a) => {
            const emp    = empleados.find((e) => e.id === a.empleado_id);
            const op     = operaciones.find((o) => o.id === a.operacion_id);
            const prenda = prendas.find((p) => p.id === a.prenda_id);

            return (
              <tr key={a.id}>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-[11px] font-semibold text-slate-600 uppercase">
                        {emp?.nombre?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="text-slate-900 font-medium text-sm leading-none">{emp?.nombre || '—'}</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">ID {emp?.id}</p>
                    </div>
                  </div>
                </td>
                <td className="text-slate-700 font-medium">{prenda?.referencia || '—'}</td>
                <td>
                  {a.color ? (
                    <span className="badge-slate">{a.color}</span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="text-slate-600 text-sm">{op?.nombre || '—'}</td>
                <td className="text-center font-semibold text-slate-800">{a.cantidad}</td>
                <td className="text-center">
                  <span className="badge-blue">{a.talla}</span>
                </td>
                <td className="text-right font-semibold text-slate-900">
                  ${parseFloat(a.monto || 0).toLocaleString()}
                </td>
                <td>
                  <span className={a.completado ? 'badge-green' : 'badge-amber'}>
                    {a.completado ? 'Completado' : 'Pendiente'}
                  </span>
                </td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => (a.completado ? onRevertir(a) : onCompletar(a))}
                      title={a.completado ? 'Revertir' : 'Completar'}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                        a.completado
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {a.completado
                        ? <RotateCcw className="w-3.5 h-3.5" />
                        : <CheckCheck className="w-3.5 h-3.5" />
                      }
                    </button>
                    <button
                      onClick={() => onEliminar(a)}
                      title="Eliminar"
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TablaAsignaciones;
