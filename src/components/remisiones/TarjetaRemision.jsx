import React from 'react';

const TarjetaRemision = ({
  remision,
  orden,
  prenda,
  asignaciones,
  expandida,
  onToggle,
  onImprimir,
  onEliminar
}) => {
  // Calcular días reales de producción
  const calcularTiempoProduccion = () => {
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

const tiempoProduccion = calcularTiempoProduccion();

  // Formatear fecha con hora
  const formatearFechaHora = (fecha) => {
    return new Date(fecha).toLocaleString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
              {formatearFechaHora(remision.fecha_despacho)}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Fecha entrada orden:</span>{' '}
              {formatearFechaHora(orden.fecha_entrada)}
            </p>
            <p className="text-sm">
  <span className="font-semibold">Tiempo de producción:</span>{' '}
  {tiempoProduccion ? (
    <span className={`px-2 py-1 rounded font-semibold ${
      tiempoProduccion.totalDias > 15 ? 'bg-red-100 text-red-800' :
      tiempoProduccion.totalDias > 10 ? 'bg-yellow-100 text-yellow-800' :
      'bg-green-100 text-green-800'
    }`}>
      {tiempoProduccion.dias > 0 && `${tiempoProduccion.dias}d `}
      {tiempoProduccion.horas}h {tiempoProduccion.minutos}m
    </span>
  ) : (
    <span className="px-2 py-1 rounded font-semibold bg-gray-100 text-gray-600">
      Sin iniciar
    </span>
  )}
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