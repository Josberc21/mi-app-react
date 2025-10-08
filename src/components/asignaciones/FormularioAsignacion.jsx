import React from 'react';

const FormularioAsignacion = ({ 
  formAsig, 
  setFormAsig, 
  empleados, 
  prendas, 
  operaciones, 
  ordenes,
  asignaciones,
  onSeleccionarOrden,
  onSubmit 
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          1. Seleccionar Orden de Producción
        </label>
        <select
          value={formAsig.orden_id}
          onChange={(e) => onSeleccionarOrden(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">-- Seleccione una orden --</option>
          {ordenes
            .filter(o => o.activo)
            .map(o => {
              const prenda = prendas.find(p => p.id === o.prenda_id);
              const operacionesRequeridas = operaciones.filter(op => op.prenda_id === o.prenda_id);
              
              // Calcular progreso simple
              const completadas = Math.min(
                ...operacionesRequeridas.map(op => {
                  const asigs = asignaciones.filter(a => 
                    a.orden_id === o.id && 
                    a.operacion_id === op.id && 
                    a.completado
                  );
                  return asigs.reduce((sum, a) => sum + Number(a.cantidad || 0), 0);
                })
              );

              return (
                <option key={o.id} value={o.id}>
                  {o.numero_orden} - {prenda?.referencia} {o.color} {o.talla} 
                  ({completadas}/{o.cantidad_total} completas)
                </option>
              );
            })}
        </select>
        {formAsig.orden_id && (
          <p className="text-xs text-gray-600 mt-2">
            ✓ Prenda, color y talla se asignan automáticamente según la orden
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            2. Empleado
          </label>
          <select
            value={formAsig.empleado_id}
            onChange={(e) => setFormAsig({ ...formAsig, empleado_id: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            disabled={!formAsig.orden_id}
          >
            <option value="">Seleccione</option>
            {empleados.map(emp => (
              <option key={emp.id} value={emp.id}>
                ID:{emp.id} {emp.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            3. Prenda
          </label>
          <input
            type="text"
            value={prendas.find(p => p.id === parseInt(formAsig.prenda_id))?.referencia || ''}
            className="w-full px-3 py-2 border rounded-lg bg-gray-100"
            disabled
            placeholder="Se asigna por orden"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            4. Operación
          </label>
          <select
            value={formAsig.operacion_id}
            onChange={(e) => setFormAsig({ ...formAsig, operacion_id: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            disabled={!formAsig.prenda_id}
          >
            <option value="">Seleccione</option>
            {operaciones
              .filter(op => op.prenda_id === parseInt(formAsig.prenda_id))
              .map(op => (
                <option key={op.id} value={op.id}>
                  {op.nombre} - ${op.costo}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            5. Cantidad
          </label>
          <input
            type="number"
            value={formAsig.cantidad}
            onChange={(e) => setFormAsig({ ...formAsig, cantidad: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="50"
            min="1"
            disabled={!formAsig.operacion_id}
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={!formAsig.orden_id}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            Asignar
          </button>
        </div>
      </div>

      {formAsig.orden_id && (
        <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
          <p><strong>Color:</strong> {formAsig.color}</p>
          <p><strong>Talla:</strong> {formAsig.talla}</p>
        </div>
      )}
    </form>
  );
};

export default FormularioAsignacion;