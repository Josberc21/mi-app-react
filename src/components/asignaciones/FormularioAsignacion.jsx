import React, { useMemo } from 'react';
import { Plus, Info, Loader2 } from 'lucide-react';

const FormularioAsignacion = ({
  formAsig,
  setFormAsig,
  empleados,
  prendas,
  operaciones,
  ordenes,
  asignaciones,
  onSeleccionarOrden,
  onSubmit,
  loading = false,
}) => {
  const disponibilidadOperaciones = useMemo(() => {
    if (!formAsig.orden_id || !formAsig.prenda_id) return {};
    const orden = ordenes.find((o) => o.id === parseInt(formAsig.orden_id));
    if (!orden) return {};

    const operacionesPrenda = operaciones.filter((op) => op.prenda_id === parseInt(formAsig.prenda_id));
    const disponibilidad = {};

    operacionesPrenda.forEach((op) => {
      const asignacionesOp = asignaciones.filter(
        (a) => a.orden_id === orden.id && a.operacion_id === op.id
      );
      const yaAsignadas = asignacionesOp.reduce((sum, a) => sum + Number(a.cantidad || 0), 0);
      disponibilidad[op.id] = {
        asignadas: yaAsignadas,
        disponibles: orden.cantidad_total - yaAsignadas,
        total: orden.cantidad_total,
      };
    });

    return disponibilidad;
  }, [formAsig.orden_id, formAsig.prenda_id, ordenes, operaciones, asignaciones]);

  const dispOp = formAsig.operacion_id ? disponibilidadOperaciones[formAsig.operacion_id] : null;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Paso 1 — Orden */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">1</span>
          Orden de producción
        </label>
        <select
          value={formAsig.orden_id}
          onChange={(e) => onSeleccionarOrden(e.target.value)}
          className="input-base"
        >
          <option value="">— Selecciona una orden —</option>
          {ordenes
            .filter((o) => o.activo)
            .map((o) => {
              const prenda = prendas.find((p) => p.id === o.prenda_id);
              const ops = operaciones.filter((op) => op.prenda_id === o.prenda_id);
              const completadas = ops.length > 0
                ? Math.min(...ops.map((op) => {
                    const asigs = asignaciones.filter(
                      (a) => a.orden_id === o.id && a.operacion_id === op.id && a.completado
                    );
                    return asigs.reduce((s, a) => s + Number(a.cantidad || 0), 0);
                  }))
                : 0;
              return (
                <option key={o.id} value={o.id}>
                  {o.numero_orden} · {prenda?.referencia} · {o.color} · T{o.talla} ({completadas}/{o.cantidad_total})
                </option>
              );
            })}
        </select>

        {formAsig.orden_id && (
          <div className="flex items-center gap-2 px-3 py-2 bg-brand-50 border border-brand-100 rounded-xl text-xs text-brand-700">
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            Prenda, color y talla se autocompletaron desde la orden
            {formAsig.color && (
              <span className="ml-auto flex gap-2">
                <span className="badge-blue">{formAsig.talla}</span>
                <span className="badge-slate">{formAsig.color}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Pasos 2–5 en grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Empleado */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">2</span>
            Empleado
          </label>
          <select
            value={formAsig.empleado_id}
            onChange={(e) => setFormAsig({ ...formAsig, empleado_id: e.target.value })}
            className="input-base"
            disabled={!formAsig.orden_id}
          >
            <option value="">Selecciona</option>
            {empleados.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Prenda (readonly) */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-slate-300 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">3</span>
            Prenda
          </label>
          <input
            type="text"
            value={prendas.find((p) => p.id === parseInt(formAsig.prenda_id))?.referencia || ''}
            className="input-base bg-slate-50 text-slate-500 cursor-not-allowed"
            disabled
            placeholder="De la orden"
          />
        </div>

        {/* Operación */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">4</span>
            Operación
          </label>
          <select
            value={formAsig.operacion_id}
            onChange={(e) => setFormAsig({ ...formAsig, operacion_id: e.target.value })}
            className="input-base"
            disabled={!formAsig.prenda_id}
          >
            <option value="">Selecciona</option>
            {operaciones
              .filter((op) => op.prenda_id === parseInt(formAsig.prenda_id))
              .map((op) => {
                const disp = disponibilidadOperaciones[op.id];
                const disponibles = disp?.disponibles ?? 0;
                return (
                  <option key={op.id} value={op.id} disabled={disponibles === 0}>
                    {op.nombre} · ${op.costo}
                    {disp ? ` (${disponibles} disp.)` : ''}
                  </option>
                );
              })}
          </select>
          {dispOp && (
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-slate-500">Disponibles:</span>
              <span className={`font-semibold ${dispOp.disponibles > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {dispOp.disponibles} / {dispOp.total}
              </span>
            </div>
          )}
        </div>

        {/* Cantidad */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">5</span>
            Cantidad
          </label>
          <input
            type="number"
            value={formAsig.cantidad}
            onChange={(e) => setFormAsig({ ...formAsig, cantidad: e.target.value })}
            className="input-base"
            placeholder="50"
            min="1"
            max={formAsig.operacion_id ? disponibilidadOperaciones[formAsig.operacion_id]?.disponibles : undefined}
            disabled={!formAsig.operacion_id}
          />
          {dispOp && (
            <p className="text-xs text-slate-400 px-1">Máx: {dispOp.disponibles}</p>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-end">
          <button
            type="submit"
            disabled={!formAsig.orden_id || loading}
            className="btn-primary w-full"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Plus className="w-4 h-4" />
            }
            {loading ? 'Asignando...' : 'Asignar'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default FormularioAsignacion;
