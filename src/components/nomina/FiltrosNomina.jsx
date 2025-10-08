// src/components/nomina/FiltrosNomina.jsx
import React from 'react';
import { Calendar, TrendingUp, X } from 'lucide-react';

const FiltrosNomina = ({
  filtroFechaInicio,
  filtroFechaFin,
  onChangeFechaInicio,
  onChangeFechaFin,
  onCalcular,
  onLimpiar,
  onRangoRapido
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">Seleccionar Período</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Fecha Inicio
          </label>
          <input
            type="date"
            value={filtroFechaInicio}
            onChange={(e) => onChangeFechaInicio(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Fecha Fin
          </label>
          <input
            type="date"
            value={filtroFechaFin}
            onChange={(e) => onChangeFechaFin(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={onCalcular}
            disabled={!filtroFechaInicio || !filtroFechaFin}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            <TrendingUp className="w-4 h-4 inline mr-1" />
            Calcular Nómina
          </button>
        </div>

        <div className="flex items-end">
          <button
            onClick={onLimpiar}
            className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 font-semibold transition-colors"
          >
            <X className="w-4 h-4 inline mr-1" />
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Rangos rápidos */}
      <div className="flex flex-wrap gap-2 items-center">
        <p className="text-sm font-medium text-gray-700">Rangos rápidos:</p>
        <button
          onClick={() => onRangoRapido(7)}
          className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300 transition-colors"
        >
          Últimos 7 días
        </button>
        <button
          onClick={() => onRangoRapido(10)}
          className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300 transition-colors"
        >
          Últimos 10 días
        </button>
        <button
          onClick={() => onRangoRapido(15)}
          className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300 transition-colors"
        >
          Últimos 15 días
        </button>
        <button
          onClick={() => onRangoRapido(30)}
          className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300 transition-colors"
        >
          Último mes
        </button>
      </div>

      {filtroFechaInicio && filtroFechaFin && (
        <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-sm text-blue-800">
            <strong>Período seleccionado:</strong> {new Date(filtroFechaInicio).toLocaleDateString()} al {new Date(filtroFechaFin).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default FiltrosNomina;