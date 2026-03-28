import React from 'react';
import { ChevronDown, ChevronRight, Calendar, Clock, Printer, Trash2, MessageSquare } from 'lucide-react';

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

  const formatearFechaHora = (fecha) =>
    new Date(fecha).toLocaleString('es-CO', {
      weekday: 'long', year: 'numeric', month: 'long',
      day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

  const tiempoCls = tiempoProduccion
    ? tiempoProduccion.totalDias > 15 ? 'badge-red'
      : tiempoProduccion.totalDias > 10 ? 'badge-amber'
      : 'badge-green'
    : 'badge-slate';

  const tiempoTexto = tiempoProduccion
    ? [
        tiempoProduccion.dias > 0 ? `${tiempoProduccion.dias}d` : '',
        `${tiempoProduccion.horas}h`,
        tiempoProduccion.minutos > 0 ? `${tiempoProduccion.minutos}m` : ''
      ].filter(Boolean).join(' ')
    : 'Sin iniciar';

  return (
    <div className="card overflow-hidden hover:shadow-card-md transition-shadow">
      {/* Header */}
      <div
        className="px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {expandida
            ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900">{orden?.numero_orden}</h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {prenda?.referencia} · {orden?.color} · Talla {orden?.talla}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`badge ${tiempoCls}`}>{tiempoTexto}</span>
          <div className="text-right">
            <p className="text-lg font-bold text-brand-600">
              {remision.cantidad_despachada}
              <span className="text-slate-300 font-normal text-sm"> uds</span>
            </p>
            <p className="text-xs text-slate-400">despachadas</p>
          </div>
        </div>
      </div>

      {/* Detail */}
      {expandida && (
        <div className="border-t border-slate-100 p-4 bg-slate-50/50 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-500">Fecha Despacho</p>
                <p className="text-xs text-slate-700 mt-0.5">{formatearFechaHora(remision.fecha_despacho)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-500">Fecha Entrada Orden</p>
                <p className="text-xs text-slate-700 mt-0.5">{formatearFechaHora(orden.fecha_entrada)}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <p className="text-xs font-semibold text-slate-500">Tiempo de Producción:</p>
            <span className={`badge ${tiempoCls}`}>{tiempoTexto}</span>
          </div>

          {remision.observaciones && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-brand-50 border border-brand-100 rounded-xl">
              <MessageSquare className="w-3.5 h-3.5 text-brand-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-brand-700 italic">"{remision.observaciones}"</p>
            </div>
          )}

          <div className="flex gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={(e) => { e.stopPropagation(); onImprimir(); }}
              className="btn-secondary text-xs gap-1.5 py-1.5 px-3"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEliminar(); }}
              className="btn-danger text-xs gap-1.5 py-1.5 px-3"
            >
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TarjetaRemision;
