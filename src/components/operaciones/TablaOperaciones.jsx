// src/components/operaciones/TablaOperaciones.jsx
import React from 'react';
import { Edit, Trash2, Package, ArrowUpDown, Settings } from 'lucide-react';

const TablaOperaciones = ({
  operaciones,
  prendas = [],
  onEditar,
  onEliminar,
  ordenCosto,
  onCambiarOrdenCosto
}) => {
  if (operaciones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <Settings className="w-7 h-7 text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium">No hay operaciones registradas</p>
        <p className="text-slate-400 text-sm mt-1">Agrega la primera o usa la carga masiva</p>
      </div>
    );
  }

  const obtenerPrenda = (prendaId) => prendas.find(p => p.id === prendaId);

  return (
    <div className="overflow-x-auto">
      <table className="table-base">
        <thead>
          <tr>
            <th>ID</th>
            <th>Operación</th>
            <th className="cursor-pointer hover:bg-slate-100 select-none" onClick={onCambiarOrdenCosto} title="Ordenar por costo">
              <div className="flex items-center gap-1.5">
                Costo <ArrowUpDown className="w-3 h-3" />
                {ordenCosto && <span className="text-brand-600">{ordenCosto === 'menor' ? '↑' : '↓'}</span>}
              </div>
            </th>
            <th>Prenda</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {operaciones.map(operacion => {
            const prenda = obtenerPrenda(operacion.prenda_id);
            return (
              <tr key={operacion.id}>
                <td className="text-slate-400 font-mono text-xs">{operacion.id}</td>
                <td className="font-bold text-slate-900">{operacion.nombre}</td>
                <td>
                  <span className="badge-green font-semibold">
                    ${parseFloat(operacion.costo).toLocaleString()}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm">{prenda?.referencia || 'Sin prenda'}</span>
                  </div>
                </td>
                <td>
                  <div className="flex gap-1.5">
                    <button onClick={() => onEditar(operacion)}
                      className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors" title="Editar">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onEliminar(operacion.id)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors" title="Eliminar">
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

export default TablaOperaciones;
