import React from 'react';
import { Search } from 'lucide-react';

const CampoBusqueda = ({ 
  valor, 
  onChange, 
  placeholder = "🔍 Buscar...",
  totalResultados,
  totalItems
}) => {
  return (
    <div className="mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={placeholder}
        />
      </div>
      {valor && totalResultados !== undefined && totalItems !== undefined && (
        <p className="text-sm text-gray-600 mt-2">
          Mostrando {totalResultados} de {totalItems} resultados
        </p>
      )}
    </div>
  );
};

export default CampoBusqueda;