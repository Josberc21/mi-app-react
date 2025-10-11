import React from 'react';

const FormularioRemision = ({ 
  formRemision, 
  setFormRemision, 
  ordenes, 
  prendas, 
  remisiones,
  calcularProgresoOrden,
  onSeleccionarOrden,
  onSubmit 
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Orden de Producción
          </label>
          <select
            value={formRemision.orden_id}
            onChange={(e) => onSeleccionarOrden(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Seleccione orden</option>
            {ordenes
              .filter(o => {
                const progreso = calcularProgresoOrden(o);
                const yaDespachadas = remisiones
                  .filter(r => r.orden_id === o.id)
                  .reduce((sum, r) => sum + r.cantidad_despachada, 0);
                return (progreso.completadas - yaDespachadas) > 0;
              })
              .map(o => {
                const prenda = prendas.find(p => p.id === o.prenda_id);
                const progreso = calcularProgresoOrden(o);
                const yaDespachadas = remisiones
                  .filter(r => r.orden_id === o.id)
                  .reduce((sum, r) => sum + r.cantidad_despachada, 0);
                const disponibles = progreso.completadas - yaDespachadas;

                return (
  <option key={o.id} value={o.id}>
    {o.numero_orden} - {prenda?.referencia} {o.color} - Talla {o.talla} ({disponibles} disponibles)
  </option>
);
              })}
          </select>
          {formRemision.orden_id && (() => {
            const orden = ordenes.find(o => o.id === parseInt(formRemision.orden_id));
            const progreso = calcularProgresoOrden(orden);
            const yaDespachadas = remisiones
              .filter(r => r.orden_id === orden.id)
              .reduce((sum, r) => sum + r.cantidad_despachada, 0);
            const disponibles = progreso.completadas - yaDespachadas;
            return (
              <p className="text-xs text-gray-600 mt-1">
                Total orden: {orden.cantidad_total} | Completadas: {progreso.completadas} |
                Ya despachadas: {yaDespachadas} | <strong>Disponibles: {disponibles}</strong>
              </p>
            );
          })()}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cantidad a Despachar
          </label>
          <input
            type="number"
            value={formRemision.cantidad_despachada}
            onChange={(e) => setFormRemision({ ...formRemision, cantidad_despachada: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            placeholder="0"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha Despacho
          </label>
          <input
            type="date"
            value={formRemision.fecha_despacho}
            onChange={(e) => setFormRemision({ ...formRemision, fecha_despacho: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observaciones (opcional)
        </label>
        <textarea
          value={formRemision.observaciones}
          onChange={(e) => setFormRemision({ ...formRemision, observaciones: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          rows="2"
          placeholder="Notas adicionales sobre el despacho..."
        />
      </div>

      <div className="mt-4">
        <button
          type="submit"
          disabled={!formRemision.orden_id || !formRemision.cantidad_despachada}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          Crear Remisión
        </button>
      </div>
    </form>
  );
};

export default FormularioRemision;