import React, { useMemo } from 'react';

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
  // Calcular disponibilidad de cada operación para la orden seleccionada
  const disponibilidadOperaciones = useMemo(() => {
    if (!formAsig.orden_id || !formAsig.prenda_id) return {};

    const orden = ordenes.find(o => o.id === parseInt(formAsig.orden_id));
    if (!orden) return {};

    const operacionesPrenda = operaciones.filter(op => op.prenda_id === parseInt(formAsig.prenda_id));
    
    const disponibilidad = {};
    
    operacionesPrenda.forEach(op => {
      const asignacionesOp = asignaciones.filter(a =>
        a.orden_id === orden.id && a.operacion_id === op.id
      );
      
      const yaAsignadas = asignacionesOp.reduce((sum, a) => sum + Number(a.cantidad || 0), 0);
      const disponibles = orden.cantidad_total - yaAsignadas;
      
      disponibilidad[op.id] = {
        asignadas: yaAsignadas,
        disponibles: disponibles,
        total: orden.cantidad_total
      };
    });
    
    return disponibilidad;
  }, [formAsig.orden_id, formAsig.prenda_id, ordenes, operaciones, asignaciones]);

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
              
              // Calcular progreso simple (piezas completamente terminadas)
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
                 {o.numero_orden} - {prenda?.referencia} - {o.color} - Talla {o.talla} ({completadas}/{o.cantidad_total} completas)
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
            className="w-full px-3 py-2 border rounded-lg text-sm"
            disabled={!formAsig.prenda_id}
          >
            <option value="">Seleccione</option>
            {operaciones
              .filter(op => op.prenda_id === parseInt(formAsig.prenda_id))
              .map(op => {
                const disp = disponibilidadOperaciones[op.id];
                const disponibles = disp?.disponibles || 0;
                const asignadas = disp?.asignadas || 0;
                const total = disp?.total || 0;
                
                return (
                  <option 
                    key={op.id} 
                    value={op.id}
                    disabled={disponibles === 0}
                  >
                    {op.nombre} - ${op.costo} 
                    {disp && ` | ${asignadas}/${total} asignadas (${disponibles} disponibles)`}
                  </option>
                );
              })}
          </select>
          
          {/* Info visual de disponibilidad */}
          {formAsig.operacion_id && disponibilidadOperaciones[formAsig.operacion_id] && (
            <div className="mt-1 p-2 bg-green-50 rounded text-xs">
              <div className="flex justify-between">
                <span className="font-semibold text-green-800">Disponibles:</span>
                <span className="font-bold text-green-600">
                  {disponibilidadOperaciones[formAsig.operacion_id].disponibles} piezas
                </span>
              </div>
              <div className="flex justify-between text-gray-600 mt-1">
                <span>Ya asignadas:</span>
                <span>
                  {disponibilidadOperaciones[formAsig.operacion_id].asignadas} de {disponibilidadOperaciones[formAsig.operacion_id].total}
                </span>
              </div>
            </div>
          )}
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
            max={formAsig.operacion_id ? disponibilidadOperaciones[formAsig.operacion_id]?.disponibles : undefined}
            disabled={!formAsig.operacion_id}
          />
          {formAsig.operacion_id && disponibilidadOperaciones[formAsig.operacion_id] && (
            <p className="text-xs text-gray-500 mt-1">
              Máximo: {disponibilidadOperaciones[formAsig.operacion_id].disponibles}
            </p>
          )}
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