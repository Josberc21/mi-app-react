import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const TarjetaOrden = ({ 
  orden, 
  prenda, 
  progreso, 
  expandida, 
  onToggleExpandir, 
  onEditar, 
  onEliminar 
}) => {
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* HEADER */}
      <div
        className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onToggleExpandir}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 flex-1">
            <button className="text-gray-600 hover:text-gray-900">
              {expandida ? '▼' : '▶'}
            </button>
            <div>
              <h3 className="text-lg font-bold">{orden.numero_orden}</h3>
              <p className="text-gray-600 text-sm">
                {prenda?.referencia} • {orden.color} • Talla {orden.talla}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                {progreso.completadas} / {orden.cantidad_total}
              </p>
              <p className="text-xs text-gray-500">piezas completas</p>
            </div>
            <span className={`px-4 py-2 rounded font-semibold text-sm ${
              progreso.porcentaje === 100 ? 'bg-green-100 text-green-800' :
              progreso.porcentaje >= 50 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {progreso.porcentaje}%
            </span>
          </div>
        </div>
      </div>

      {/* DETALLE EXPANDIBLE */}
      {expandida && (
        <div className="p-4 bg-white border-t">
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Fecha entrada: {new Date(orden.fecha_entrada).toLocaleDateString()}
            </p>
          </div>

          <h4 className="font-semibold mb-3 text-sm">Progreso por Operación:</h4>
          <div className="space-y-3 mb-4">
            {progreso.detalles.map((det, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded">
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-sm font-medium flex-1">{det.operacion}</p>
                  <p className="text-sm font-bold">
                    {det.completadas}/{det.total}
                  </p>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    det.porcentaje === 100 ? 'bg-green-100 text-green-800' :
                    det.porcentaje >= 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {det.porcentaje}%
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      det.porcentaje === 100 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${det.porcentaje}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-3 border-t">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditar();
              }}
              className="px-4 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" /> Editar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEliminar();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TarjetaOrden;