import React from 'react';
import { formatearFecha } from '../../utils/dateUtils';
import { BarChart2 } from 'lucide-react';

const TablaTrazabilidad = ({ ordenes, prendas, remisiones, calcularProgresoOrden, asignaciones }) => {

  const calcularTiempoProduccion = (orden) => {
    const asignacionesOrden = asignaciones.filter(a =>
      a.orden_id === orden.id && a.completado && a.fecha_terminado
    );
    if (asignacionesOrden.length === 0) return null;
    const fechasTerminadas = asignacionesOrden.map(a => new Date(a.fecha_terminado));
    const fechaUltimaTerminacion = new Date(Math.max(...fechasTerminadas));
    const fechaEntrada = new Date(orden.fecha_entrada);
    const diffMs = fechaUltimaTerminacion - fechaEntrada;
    const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return { dias, horas, minutos, totalDias: dias };
  };

  const despachadas = ordenes.filter(o => {
    const total = remisiones.filter(r => r.orden_id === o.id).reduce((s, r) => s + r.cantidad_despachada, 0);
    return total >= o.cantidad_total;
  }).length;

  const listasDespacho = ordenes.filter(o => {
    const prog = calcularProgresoOrden(o);
    const total = remisiones.filter(r => r.orden_id === o.id).reduce((s, r) => s + r.cantidad_despachada, 0);
    return prog.completadas >= o.cantidad_total && total < o.cantidad_total;
  }).length;

  const enProduccion = ordenes.filter(o => {
    const prog = calcularProgresoOrden(o);
    const total = remisiones.filter(r => r.orden_id === o.id).reduce((s, r) => s + r.cantidad_despachada, 0);
    return prog.completadas < o.cantidad_total && total < o.cantidad_total;
  }).length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-xs text-slate-500">Total Órdenes</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{ordenes.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">Despachadas</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{despachadas}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">Listas para Despacho</p>
          <p className="text-2xl font-bold text-violet-600 mt-1">{listasDespacho}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">En Producción</p>
          <p className="text-2xl font-bold text-brand-600 mt-1">{enProduccion}</p>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-brand-500" />
          <h2 className="text-sm font-bold text-slate-900">Trazabilidad Completa de Órdenes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Orden</th>
                <th>Prenda</th>
                <th>Cantidad</th>
                <th>Fecha Entrada</th>
                <th>Progreso</th>
                <th>Despachadas</th>
                <th>Tiempo Producción</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map(orden => {
                const prenda = prendas.find(p => p.id === orden.prenda_id);
                const progreso = calcularProgresoOrden(orden);
                const totalDespachado = remisiones
                  .filter(r => r.orden_id === orden.id)
                  .reduce((sum, r) => sum + r.cantidad_despachada, 0);
                const tiempo = calcularTiempoProduccion(orden);

                let estadoLabel = 'En Producción';
                let estadoCls = 'badge-blue';
                if (totalDespachado >= orden.cantidad_total) {
                  estadoLabel = 'Despachada'; estadoCls = 'badge-green';
                } else if (progreso.completadas >= orden.cantidad_total) {
                  estadoLabel = 'Lista Despacho'; estadoCls = 'badge';
                } else if (progreso.porcentaje === 0) {
                  estadoLabel = 'Sin Iniciar'; estadoCls = 'badge-slate';
                }

                const tiempoCls = !tiempo ? 'badge-slate'
                  : tiempo.totalDias > 15 ? 'badge-red'
                  : tiempo.totalDias > 10 ? 'badge-amber'
                  : 'badge-green';

                const tiempoTexto = !tiempo ? 'Sin iniciar'
                  : [
                      tiempo.dias > 0 ? `${tiempo.dias}d` : '',
                      `${tiempo.horas}h`,
                      tiempo.minutos > 0 ? `${tiempo.minutos}m` : ''
                    ].filter(Boolean).join(' ');

                return (
                  <tr key={orden.id}>
                    <td className="font-bold text-slate-900">{orden.numero_orden}</td>
                    <td>
                      <p className="font-medium text-slate-800">{prenda?.referencia}</p>
                      <p className="text-xs text-slate-400">{orden.color} · T{orden.talla}</p>
                    </td>
                    <td className="font-bold">{orden.cantidad_total}</td>
                    <td className="text-slate-500 text-xs">{formatearFecha(orden.fecha_entrada)}</td>
                    <td>
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full transition-all"
                            style={{ width: `${progreso.porcentaje}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 flex-shrink-0">{progreso.porcentaje}%</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{progreso.completadas}/{orden.cantidad_total}</p>
                    </td>
                    <td>
                      <span className="font-bold text-emerald-600">{totalDespachado}</span>
                      {totalDespachado > 0 && (
                        <p className="text-xs text-slate-400">
                          {Math.round((totalDespachado / orden.cantidad_total) * 100)}%
                        </p>
                      )}
                    </td>
                    <td><span className={`badge ${tiempoCls}`}>{tiempoTexto}</span></td>
                    <td><span className={`badge ${estadoCls}`}>{estadoLabel}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TablaTrazabilidad;
