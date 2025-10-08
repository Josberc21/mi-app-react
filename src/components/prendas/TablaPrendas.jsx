// src/components/prendas/TablaPrendas.jsx
import React from 'react';
import { Edit, Trash2, Settings } from 'lucide-react';

const TablaPrendas = ({ 
  prendas, 
  operaciones = [],
  onEditar, 
  onEliminar 
}) => {
  if (prendas.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No hay prendas registradas</p>
        <p className="text-sm mt-2">Agrega la primera prenda usando el formulario arriba</p>
      </div>
    );
  }

  // Contar operaciones por prenda
  const contarOperaciones = (prendaId) => {
    return operaciones.filter(op => op.prenda_id === prendaId).length;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Referencia</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Descripción</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Operaciones</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {prendas.map(prenda => {
            const totalOperaciones = contarOperaciones(prenda.id);
            
            return (
              <tr key={prenda.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {prenda.id}
                </td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">
                  {prenda.referencia}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {prenda.descripcion || '-'}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    <Settings className="w-4 h-4 mr-1" />
                    {totalOperaciones}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditar(prenda)}
                      className="p-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEliminar(prenda.id)}
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

export default TablaPrendas;