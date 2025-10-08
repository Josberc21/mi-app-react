// src/components/operaciones/TablaOperaciones.jsx
import React from 'react';
import { Edit, Trash2, Package } from 'lucide-react';

const TablaOperaciones = ({ 
  operaciones, 
  prendas = [],
  onEditar, 
  onEliminar 
}) => {
  if (operaciones.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No hay operaciones registradas</p>
        <p className="text-sm mt-2">Agrega la primera operación usando el formulario arriba o carga masiva</p>
      </div>
    );
  }

  // Obtener prenda por ID
  const obtenerPrenda = (prendaId) => {
    return prendas.find(p => p.id === prendaId);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Operación</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Costo</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Prenda</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {operaciones.map(operacion => {
            const prenda = obtenerPrenda(operacion.prenda_id);
            
            return (
              <tr key={operacion.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {operacion.id}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">
                  {operacion.nombre}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                    ${parseFloat(operacion.costo).toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {prenda?.referencia || 'Sin prenda'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditar(operacion)}
                      className="p-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEliminar(operacion.id)}
                      className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
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

export default TablaOperaciones;