import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { calcularCambio } from '../../utils/timeUtils';

const ICON_COLORS = {
  blue:   'bg-blue-50 text-blue-600',
  green:  'bg-emerald-50 text-emerald-600',
  red:    'bg-rose-50 text-rose-600',
  purple: 'bg-brand-50 text-brand-600',
  yellow: 'bg-amber-50 text-amber-600',
};

const TarjetaMetricaComparativa = ({
  titulo,
  valorActual,
  valorAnterior,
  icono: Icono,
  color = 'blue',
  formato = 'numero',
  subtitulo,
  invertirColores = false,
}) => {
  const iconCls = ICON_COLORS[color] || ICON_COLORS.blue;
  const cambio  = calcularCambio(valorActual, valorAnterior);

  const tendenciaBuena =
    (cambio.direccion === 'up' && !invertirColores) ||
    (cambio.direccion === 'down' && invertirColores);
  const tendenciaMala  =
    (cambio.direccion === 'down' && !invertirColores) ||
    (cambio.direccion === 'up' && invertirColores);

  const pillCls = tendenciaBuena
    ? 'bg-emerald-50 text-emerald-700'
    : tendenciaMala
    ? 'bg-rose-50 text-rose-700'
    : 'bg-slate-100 text-slate-500';

  const IconoTendencia =
    cambio.direccion === 'up' ? TrendingUp :
    cambio.direccion === 'down' ? TrendingDown : Minus;

  const fmt = (v) => {
    if (v === null || v === undefined) return '—';
    switch (formato) {
      case 'moneda':     return `$${v.toLocaleString('es-CO')}`;
      case 'porcentaje': return `${Math.round(v)}%`;
      case 'decimal':    return v.toFixed(2);
      default:           return v.toLocaleString('es-CO');
    }
  };

  return (
    <div className="card p-5 hover:shadow-card-md transition-shadow duration-200 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide leading-snug">
          {titulo}
        </p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconCls}`}>
          <Icono className="w-4 h-4" />
        </div>
      </div>

      {/* Valor */}
      <div>
        <p className="text-3xl font-bold text-slate-900 tracking-tight">{fmt(valorActual)}</p>
        {subtitulo && <p className="text-xs text-slate-400 mt-0.5">{subtitulo}</p>}
      </div>

      {/* Comparación */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${pillCls}`}>
          <IconoTendencia className="w-3 h-3" />
          {cambio.porcentaje}%
        </div>
        <p className="text-xs text-slate-400">
          ant: <span className="font-medium text-slate-600">{fmt(valorAnterior)}</span>
        </p>
      </div>
    </div>
  );
};

export default TarjetaMetricaComparativa;
