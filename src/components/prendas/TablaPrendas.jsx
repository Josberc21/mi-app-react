// src/components/prendas/TablaPrendas.jsx
import React from 'react';
import { Edit, Trash2, Settings, Package } from 'lucide-react';

const TablaPrendas = ({
  prendas,
  operaciones = [],
  onEditar,
  onEliminar
}) => {
  if (prendas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <Package className="w-7 h-7 text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium">No hay prendas registradas</p>
        <p className="text-slate-400 text-sm mt-1">Agrega la primera usando el formulario</p>
      </div>
    );
  }

  const contarOperaciones = (prendaId) =>
    operaciones.filter(op => op.prenda_id === prendaId).length;

  return (
    <div className="overflow-x-auto">
      <table className="table-base">
        <thead>
          <tr>
            <th>ID</th>
            <th>Referencia</th>
            <th>Descripción</th>
            <th>Operaciones</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {prendas.map(prenda => {
            const totalOperaciones = contarOperaciones(prenda.id);
            return (
              <tr key={prenda.id}>
                <td className="text-slate-400 font-mono text-xs">{prenda.id}</td>
                <td className="font-bold text-slate-900">{prenda.referencia}</td>
                <td className="text-slate-500">{prenda.descripcion || '—'}</td>
                <td>
                  <span className="badge-blue inline-flex items-center gap-1">
                    <Settings className="w-3 h-3" />{totalOperaciones}
                  </span>
                </td>
                <td>
                  <div className="flex gap-1.5">
                    <button onClick={() => onEditar(prenda)}
                      className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors" title="Editar">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onEliminar(prenda.id)}
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

export default TablaPrendas;
