import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';

const TarjetaAlerta = ({ alerta }) => {
  const configuracion = {
    critico: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      textTitulo: 'text-red-900',
      textMensaje: 'text-red-700',
      icono: AlertTriangle,
      iconoColor: 'text-red-600'
    },
    advertencia: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      textTitulo: 'text-yellow-900',
      textMensaje: 'text-yellow-700',
      icono: AlertCircle,
      iconoColor: 'text-yellow-600'
    },
    exito: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      textTitulo: 'text-green-900',
      textMensaje: 'text-green-700',
      icono: CheckCircle,
      iconoColor: 'text-green-600'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      textTitulo: 'text-blue-900',
      textMensaje: 'text-blue-700',
      icono: Info,
      iconoColor: 'text-blue-600'
    }
  };

  const config = configuracion[alerta.tipo];
  const Icono = config.icono;

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-start gap-3">
        <Icono className={`w-5 h-5 ${config.iconoColor} mt-0.5 flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${config.textTitulo} mb-1`}>
            {alerta.titulo}
          </h4>
          <p className={`text-xs ${config.textMensaje}`}>
            {alerta.mensaje}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TarjetaAlerta;