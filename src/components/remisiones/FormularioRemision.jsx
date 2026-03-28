import React from 'react';
import { Truck, Calendar, FileText, Save } from 'lucide-react';

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
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" /> Orden de Producción
          </label>
          <select
            value={formRemision.orden_id}
            onChange={(e) => onSeleccionarOrden(e.target.value)}
            className="input-base"
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
                    {o.numero_orden} - {prenda?.referencia} {o.color} T{o.talla} ({disponibles} disp.)
                  </option>
                );
              })}
          </select>
          {formRemision.orden_id && (() => {
            const orden = ordenes.find(o => o.id === parseInt(formRemision.orden_id));
            if (!orden) return null;
            const progreso = calcularProgresoOrden(orden);
            const yaDespachadas = remisiones
              .filter(r => r.orden_id === orden.id)
              .reduce((sum, r) => sum + r.cantidad_despachada, 0);
            const disponibles = progreso.completadas - yaDespachadas;
            return (
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span>Total: <strong className="text-slate-700">{orden.cantidad_total}</strong></span>
                <span>Completadas: <strong className="text-slate-700">{progreso.completadas}</strong></span>
                <span>Despachadas: <strong className="text-slate-700">{yaDespachadas}</strong></span>
                <span className="text-brand-600 font-semibold">Disponibles: {disponibles}</span>
              </div>
            );
          })()}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Cantidad a Despachar
          </label>
          <input
            type="number"
            value={formRemision.cantidad_despachada}
            onChange={(e) => setFormRemision({ ...formRemision, cantidad_despachada: e.target.value })}
            className="input-base"
            placeholder="0"
            min="1"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Fecha Despacho
          </label>
          <input
            type="date"
            value={formRemision.fecha_despacho}
            onChange={(e) => setFormRemision({ ...formRemision, fecha_despacho: e.target.value })}
            className="input-base"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> Observaciones <span className="font-normal text-slate-400">(opcional)</span>
        </label>
        <textarea
          value={formRemision.observaciones}
          onChange={(e) => setFormRemision({ ...formRemision, observaciones: e.target.value })}
          className="input-base resize-none"
          rows="2"
          placeholder="Notas adicionales sobre el despacho..."
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={!formRemision.orden_id || !formRemision.cantidad_despachada}
          className="btn-primary gap-2"
        >
          <Save className="w-4 h-4" />
          Crear Remisión
        </button>
      </div>
    </form>
  );
};

export default FormularioRemision;
