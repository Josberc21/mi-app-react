import React from 'react';
import { formatearFecha, calcularDiasEntre } from '../../utils/dateUtils';

const TablaTrazabilidad = ({ ordenes, prendas, remisiones, calcularProgresoOrden, asignaciones }) => {
  
  // Función para calcular el tiempo real de producción
  const calcularTiempoProduccion = (orden) => {
    const asignacionesOrden = asignaciones.filter(a => 
      a.orden_id === orden.id && a.completado && a.fecha_terminado
    );

    if (asignacionesOrden.length === 0) {
      return null;
    }

    const fechasTerminadas = asignacionesOrden.map(a => new Date(a.fecha_terminado));
    const fechaUltimaTerminacion = new Date(Math.max(...fechasTerminadas));
    const fechaEntrada = new Date(orden.fecha_entrada);
    
    const diffMs = fechaUltimaTerminacion - fechaEntrada;
    
    const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { dias, horas, minutos, totalDias: dias };
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">📊 Trazabilidad Completa de Órdenes</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Orden</th>
              <th className="px-4 py-3 text-left">Prenda</th>
              <th className="px-4 py-3 text-left">Cantidad</th>
              <th className="px-4 py-3 text-left">Fecha Entrada</th>
              <th className="px-4 py-3 text-left">Progreso</th>
              <th className="px-4 py-3 text-left">Despachadas</th>
              <th className="px-4 py-3 text-left">Tiempo de Producción</th>
              <th className="px-4 py-3 text-left">Estado</th>
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

              let estado = 'En Producción';
              let colorEstado = 'bg-blue-100 text-blue-800';

              if (totalDespachado >= orden.cantidad_total) {
                estado = 'Despachada';
                colorEstado = 'bg-green-100 text-green-800';
              } else if (progreso.completadas >= orden.cantidad_total) {
                estado = 'Lista para Despacho';
                colorEstado = 'bg-purple-100 text-purple-800';
              } else if (progreso.porcentaje === 0) {
                estado = 'Sin Iniciar';
                colorEstado = 'bg-gray-100 text-gray-800';
              }

              return (
                <tr key={orden.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">{orden.numero_orden}</td>
                  <td className="px-4 py-3">
                    <div>{prenda?.referencia}</div>
                    <div className="text-xs text-gray-500">{orden.color} - {orden.talla}</div>
                  </td>
                  <td className="px-4 py-3 font-bold">{orden.cantidad_total}</td>
                  <td className="px-4 py-3">
                    {formatearFecha(orden.fecha_entrada)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${progreso.porcentaje}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold">{progreso.porcentaje}%</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {progreso.completadas} / {orden.cantidad_total} completas
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-green-600">{totalDespachado}</span>
                    {totalDespachado > 0 && (
                      <div className="text-xs text-gray-500">
                        {Math.round((totalDespachado / orden.cantidad_total) * 100)}% despachado
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      if (!tiempo) {
                        return (
                          <span className="px-3 py-1 rounded font-semibold bg-gray-100 text-gray-600">
                            Sin iniciar
                          </span>
                        );
                      }
                      
                      const textoTiempo = [
                        tiempo.dias > 0 ? `${tiempo.dias}d` : '',
                        `${tiempo.horas}h`,
                        tiempo.minutos > 0 ? `${tiempo.minutos}m` : ''
                      ].filter(Boolean).join(' ');

                      return (
                        <span className={`px-3 py-1 rounded font-semibold ${
                          tiempo.totalDias > 15 ? 'bg-red-100 text-red-800' :
                          tiempo.totalDias > 10 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {textoTiempo}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded text-xs font-semibold ${colorEstado}`}>
                      {estado}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-600">Total Órdenes</p>
          <p className="text-2xl font-bold">{ordenes.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded">
          <p className="text-sm text-gray-600">Completamente Despachadas</p>
          <p className="text-2xl font-bold text-green-600">
            {ordenes.filter(o => {
              const totalDesp = remisiones
                .filter(r => r.orden_id === o.id)
                .reduce((sum, r) => sum + r.cantidad_despachada, 0);
              return totalDesp >= o.cantidad_total;
            }).length}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded">
          <p className="text-sm text-gray-600">Listas para Despacho</p>
          <p className="text-2xl font-bold text-purple-600">
            {ordenes.filter(o => {
              const prog = calcularProgresoOrden(o);
              const totalDesp = remisiones
                .filter(r => r.orden_id === o.id)
                .reduce((sum, r) => sum + r.cantidad_despachada, 0);
              return prog.completadas >= o.cantidad_total && totalDesp < o.cantidad_total;
            }).length}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded">
          <p className="text-sm text-gray-600">En Producción</p>
          <p className="text-2xl font-bold text-blue-600">
            {ordenes.filter(o => {
              const prog = calcularProgresoOrden(o);
              const totalDesp = remisiones
                .filter(r => r.orden_id === o.id)
                .reduce((sum, r) => sum + r.cantidad_despachada, 0);
              return prog.completadas < o.cantidad_total && totalDesp < o.cantidad_total;
            }).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TablaTrazabilidad;