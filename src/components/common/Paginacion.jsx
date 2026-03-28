import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { ITEMS_POR_PAGINA } from '../../constants';

const Paginacion = ({
  paginaActual,
  totalPaginas,
  totalItems,
  primeraPagina,
  paginaAnterior,
  paginaSiguiente,
  ultimaPagina,
}) => {
  if (totalPaginas <= 1) return null;

  const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA + 1;
  const fin    = Math.min(paginaActual * ITEMS_POR_PAGINA, totalItems);

  const BtnNav = ({ onClick, disabled, children, title }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500
                 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 transition-all
                 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );

  return (
    <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
      <p className="text-xs text-slate-500">
        Mostrando <span className="font-medium text-slate-700">{inicio}–{fin}</span> de{' '}
        <span className="font-medium text-slate-700">{totalItems}</span> registros
      </p>

      <div className="flex items-center gap-1.5">
        <BtnNav onClick={primeraPagina} disabled={paginaActual === 1} title="Primera página">
          <ChevronsLeft className="w-4 h-4" />
        </BtnNav>
        <BtnNav onClick={paginaAnterior} disabled={paginaActual === 1} title="Anterior">
          <ChevronLeft className="w-4 h-4" />
        </BtnNav>

        <span className="px-3 py-1 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg">
          {paginaActual} / {totalPaginas}
        </span>

        <BtnNav onClick={paginaSiguiente} disabled={paginaActual >= totalPaginas} title="Siguiente">
          <ChevronRight className="w-4 h-4" />
        </BtnNav>
        <BtnNav onClick={ultimaPagina} disabled={paginaActual >= totalPaginas} title="Última página">
          <ChevronsRight className="w-4 h-4" />
        </BtnNav>
      </div>
    </div>
  );
};

export default Paginacion;
