import React from 'react';
import { Search, X } from 'lucide-react';

const CampoBusqueda = ({
  valor,
  onChange,
  placeholder = 'Buscar...',
  totalResultados,
  totalItems,
}) => {
  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className="input-base pl-10 pr-9"
          placeholder={placeholder}
        />
        {valor && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {valor && totalResultados !== undefined && totalItems !== undefined && (
        <p className="text-xs text-slate-500 px-1">
          {totalResultados === 0
            ? 'Sin resultados'
            : `${totalResultados} de ${totalItems} resultados`}
        </p>
      )}
    </div>
  );
};

export default CampoBusqueda;
