// src/components/dashboard/TarjetaMetricaComparativa.jsx
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { calcularCambio } from '../../utils/timeUtils';

const TarjetaMetricaComparativa = ({ 
  titulo, 
  valorActual, 
  valorAnterior, 
  icono: Icono, 
  color,
  formato = 'numero', // 'numero', 'moneda', 'porcentaje', 'decimal'
  subtitulo,
  invertirColores = false // true si menos es mejor (ej: días de retraso)
}) => {
  const colores = {
    blue: { 
      bg: 'bg-blue-50', 
      text: 'text-blue-600', 
      icon: 'text-blue-600',
      up: 'bg-green-100 text-green-700',
      down: 'bg-red-100 text-red-700'
    },
    green: { 
      bg: 'bg-green-50', 
      text: 'text-green-600', 
      icon: 'text-green-600',
      up: 'bg-green-100 text-green-700',
      down: 'bg-red-100 text-red-700'
    },
    red: { 
      bg: 'bg-red-50', 
      text: 'text-red-600', 
      icon: 'text-red-600',
      up: 'bg-red-100 text-red-700',
      down: 'bg-green-100 text-green-700'
    },
    purple: { 
      bg: 'bg-purple-50', 
      text: 'text-purple-600', 
      icon: 'text-purple-600',
      up: 'bg-green-100 text-green-700',
      down: 'bg-red-100 text-red-700'
    },
    yellow: { 
      bg: 'bg-yellow-50', 
      text: 'text-yellow-600', 
      icon: 'text-yellow-600',
      up: 'bg-green-100 text-green-700',
      down: 'bg-red-100 text-red-700'
    }
  };

  const config = colores[color] || colores.blue;
  const cambio = calcularCambio(valorActual, valorAnterior);

  // Si invertirColores es true, intercambiamos los colores de up y down
  const colorTendencia = invertirColores 
    ? (cambio.direccion === 'up' ? config.down : cambio.direccion === 'down' ? config.up : 'bg-gray-100 text-gray-700')
    : (cambio.direccion === 'up' ? config.up : cambio.direccion === 'down' ? config.down : 'bg-gray-100 text-gray-700');

  const formatearValor = (valor) => {
    if (valor === null || valor === undefined) return '—';
    
    switch (formato) {
      case 'moneda':
        return `$${valor.toLocaleString('es-CO')}`;
      case 'porcentaje':
        return `${Math.round(valor)}%`;
      case 'decimal':
        return valor.toFixed(2);
      default:
        return valor.toLocaleString('es-CO');
    }
  };

  const IconoTendencia = cambio.direccion === 'up' ? TrendingUp : cambio.direccion === 'down' ? TrendingDown : Minus;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      <div className="p-6">
        {/* Header con ícono */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{titulo}</p>
          </div>
          <div className={`p-3 rounded-lg ${config.bg}`}>
            <Icono className={`w-6 h-6 ${config.icon}`} />
          </div>
        </div>

        {/* Valor principal */}
        <div className="mb-3">
          <p className={`text-4xl font-bold ${config.text}`}>
            {formatearValor(valorActual)}
          </p>
          {subtitulo && (
            <p className="text-xs text-gray-500 mt-1">{subtitulo}</p>
          )}
        </div>

        {/* Comparación */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${colorTendencia}`}>
            <IconoTendencia className="w-3 h-3" />
            <span>{cambio.porcentaje}%</span>
          </div>
          <div className="text-xs text-gray-500">
            vs anterior: <span className="font-medium text-gray-700">{formatearValor(valorAnterior)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TarjetaMetricaComparativa;