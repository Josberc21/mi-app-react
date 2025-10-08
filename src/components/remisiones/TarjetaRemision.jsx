import React from 'react';

const TarjetaRemision = ({ 
  remision, 
  orden, 
  prenda, 
  expandida, 
  onToggle, 
  onImprimir, 
  onEliminar 
}) => {
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* HEADER - Siempre visible */}
      <div
        className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onToggle}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 flex-1">
            <button className="text-gray-600 hover:text-gray-900">
              {expandida ? '▼' : '▶'}
            </button>
            <div>
              <h3 className="font-bold text-lg">{orden?.numero_orden}</h3>
              <p className="text-gray-600 text-sm">
                {prenda?.referencia} - {orden?.color} - Talla {orden?.talla}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-green-600">
              {remision.cantidad_despachada}
            </p>
            <p className="text-xs text-gray-500">unidades</p>
          </div>
        </div>
      </div>

      {/* DETALLE - Colapsable */}
      {expandida && (
        <div className="p-4 bg-white border-t">
          <div className="space-y-2 mb-4">
            <p className="text-sm">
              <span className="font-semibold">Fecha despacho:</span>{' '}
              {new Date(remision.fecha_despacho).toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Fecha entrada orden:</span>{' '}
              {new Date(orden.fecha_entrada).toLocaleDateString('es-CO')}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Días de producción:</span>{' '}
              {Math.ceil((new Date(remision.fecha_despacho) - new Date(orden.fecha_entrada)) / (1000 * 60 * 60 * 24))} días
            </p>
            {remision.observaciones && (
              <div className="bg-blue-50 p-3 rounded mt-3">
                <p className="text-sm font-semibold text-gray-700">Observaciones:</p>
                <p className="text-sm text-gray-600 mt-1 italic">"{remision.observaciones}"</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-3 border-t">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onImprimir();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-2"
            >
              🖨️ Imprimir
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEliminar();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TarjetaRemision;