// src/components/nomina/TablaDetalleEmpleado.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const TablaDetalleEmpleado = ({ empleado, asignaciones, operaciones, prendas }) => {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="mb-6 border rounded-lg overflow-hidden">
      {/* Header del empleado - SIEMPRE VISIBLE y CLICKEABLE */}
      <div 
        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-colors"
        onClick={() => setExpandido(!expandido)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Icono de expandir/colapsar */}
            <button className="text-white hover:scale-110 transition-transform">
              {expandido ? (
                <ChevronUp className="w-6 h-6" />
              ) : (
                <ChevronDown className="w-6 h-6" />
              )}
            </button>
            
            <div>
              <p className="text-sm opacity-90">Empleado ID: {empleado.id}</p>
              <h4 className="text-2xl font-bold">{empleado.nombre}</h4>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm opacity-90">Total a Pagar</p>
            <p className="text-3xl font-bold">${empleado.monto.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="mt-2 flex gap-4 text-sm">
          <span className="bg-white bg-opacity-20 px-3 py-1 rounded">
            {empleado.operaciones} operaciones
          </span>
          <span className="bg-white bg-opacity-20 px-3 py-1 rounded">
            {empleado.piezas} piezas totales
          </span>
          <span className="bg-white bg-opacity-30 px-3 py-1 rounded italic">
            {expandido ? 'Click para ocultar detalle' : 'Click para ver detalle'}
          </span>
        </div>
      </div>

      {/* Tabla de operaciones - COLAPSABLE */}
      {expandido && (
        <div className="bg-white animate-slideDown">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Fecha Asignada</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Fecha Terminada</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Prenda</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Operación</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Talla</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Cantidad</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Valor Unit.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {asignaciones.map(a => {
                  const op = operaciones.find(o => o.id === a.operacion_id);
                  const prenda = prendas.find(p => p.id === a.prenda_id);
                  return (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{new Date(a.fecha).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">
                        {a.fecha_terminado ? new Date(a.fecha_terminado).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">{prenda?.referencia || '-'}</td>
                      <td className="px-4 py-3 text-sm font-medium">{op?.nombre || '-'}</td>
                      <td className="px-4 py-3 text-sm">{a.talla}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{a.cantidad}</td>
                      <td className="px-4 py-3 text-sm">${op?.costo?.toLocaleString() || 0}</td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600">
                        ${parseFloat(a.monto || 0).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="7" className="px-4 py-3 text-right font-bold">
                    TOTAL {empleado.nombre}:
                  </td>
                  <td className="px-4 py-3 font-bold text-lg text-green-600">
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