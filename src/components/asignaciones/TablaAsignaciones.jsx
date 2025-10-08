// src/components/asignaciones/TablaAsignaciones.jsx
import React from 'react';
import { Trash2, ArrowUpDown } from 'lucide-react';

const TablaAsignaciones = ({ 
  asignaciones, 
  empleados, 
  operaciones, 
  prendas, 
  onCompletar, 
  onRevertir, 
  onEliminar,
  ordenEstado,
  onCambiarOrdenEstado
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-2 text-left">ID Emp</th>
            <th className="px-2 py-2 text-left">Empleado</th>
            <th className="px-3 py-2 text-left">Prenda</th>
            <th className="px-2 py-2 text-left">Color</th>
            <th className="px-2 py-2 text-left">Operación</th>
            <th className="px-2 py-2 text-left">Cant</th>
            <th className="px-2 py-2 text-left">Talla</th>
            <th className="px-2 py-2 text-left">Monto</th>
            <th 
              className="px-2 py-2 text-left cursor-pointer hover:bg-gray-100 select-none"
              onClick={onCambiarOrdenEstado}
              title="Clic para ordenar"
            >
              <div className="flex items-center gap-1">
                Estado
                <ArrowUpDown className="w-3 h-3" />
                {ordenEstado && (
                  <span className="text-blue-600 font-bold">
                    {ordenEstado === 'pendientes' ? '↑' : ordenEstado === 'completadas' ? '↓' : ''}
                  </span>
                )}
              </div>
            </th>
            <th className="px-2 py-2 text-left">Acción</th>
          </tr>
        </thead>
        <tbody>
          {asignaciones.length === 0 ? (
            <tr>
              <td colSpan="10" className="text-center py-8 text-gray-500">
                No hay asignaciones que mostrar
              </td>
            </tr>
          ) : (
            asignaciones.map(a => {
              const emp = empleados.find(e => e.id === a.empleado_id);
              const op = operaciones.find(o => o.id === a.operacion_id);
              const prenda = prendas.find(p => p.id === a.prenda_id);
              
              return (
                <tr key={a.id} className="border-t hover:bg-gray-50">
                  <td className="px-2 py-2">{emp?.id}</td>
                  <td className="px-2 py-2">{emp?.nombre}</td>
                  <td className="px-3 py-2">{prenda?.referencia}</td>
                  <td className="px-2 py-2">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold">
                      {a.color || '-'}
                    </span>
                  </td>
                  <td className="px-2 py-2">{op?.nombre}</td>
                  <td className="px-2 py-2">{a.cantidad}</td>
                  <td className="px-2 py-2">{a.talla}</td>
                  <td className="px-2 py-2 font-bold">
                    ${parseFloat(a.monto).toLocaleString()}
                  </td>
                  <td className="px-2 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      a.completado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {a.completado ? 'OK' : 'Pend'}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => a.completado ? onRevertir(a) : onCompletar(a)}
                      className={`px-3 py-1 rounded text-xs font-semibold mr-1 ${
                        a.completado
                          ? 'bg-gray-500 text-white hover:bg-gray-600'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {a.completado ? 'Revertir' : 'Completar'}
                    </button>
                    <button
                      onClick={() => onEliminar(a)}
                      className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                    >
                      <Trash2 className="w-3 h-3 inline" />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TablaAsignaciones;