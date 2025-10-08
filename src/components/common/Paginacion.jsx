// src/components/common/Paginacion.jsx
import React from 'react';
import { ITEMS_POR_PAGINA } from '../../constants';

const Paginacion = ({ 
  paginaActual, 
  totalPaginas, 
  totalItems,
  primeraPagina,    
  paginaAnterior,   
  paginaSiguiente, 
  ultimaPagina      
}) => {
  if (totalPaginas <= 1) return null;

  const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA + 1;
  const fin = Math.min(paginaActual * ITEMS_POR_PAGINA, totalItems);

  return (
    <div className="flex justify-between items-center mt-4 px-4 py-3 bg-gray-50 rounded-lg">
      <div className="text-sm text-gray-600">
        Mostrando {inicio} - {fin} de {totalItems} registros
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={primeraPagina}
          disabled={paginaActual === 1}
          className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Primera
        </button>
        <button
          onClick={paginaAnterior}
          disabled={paginaActual === 1}
          className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <span className="text-sm font-medium px-3">
          Página {paginaActual} de {totalPaginas}
        </span>
        <button
          onClick={paginaSiguiente}
          disabled={paginaActual >= totalPaginas}
          className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
        <button
          onClick={ultimaPagina}
          disabled={paginaActual >= totalPaginas}
          className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Última
        </button>
      </div>
    </div>
  );
};

export default Paginacion;