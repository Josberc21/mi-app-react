import React from 'react';

const TarjetaMetrica = ({ titulo, valor, icono: Icono, color, subtitulo }) => {
  const colores = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    purple: 'text-purple-600 bg-purple-50',
    yellow: 'text-yellow-600 bg-yellow-50'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-gray-600 text-sm mb-1">{titulo}</p>
          <p className="text-3xl font-bold text-gray-900">{valor}</p>
          {subtitulo && (
            <p className="text-xs text-gray-500 mt-1">{subtitulo}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colores[color]}`}>
          <Icono className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
};

export default TarjetaMetrica;