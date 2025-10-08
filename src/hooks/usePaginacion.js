import { useState, useMemo } from 'react';
import { ITEMS_POR_PAGINA } from '../constants';

export const usePaginacion = (datos, itemsPorPagina = ITEMS_POR_PAGINA) => {
  const [paginaActual, setPaginaActual] = useState(1);

  const totalPaginas = Math.ceil(datos.length / itemsPorPagina);

  const datosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    return datos.slice(inicio, fin);
  }, [datos, paginaActual, itemsPorPagina]);

  const irAPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  };

  const paginaAnterior = () => irAPagina(paginaActual - 1);
  const paginaSiguiente = () => irAPagina(paginaActual + 1);
  const primeraPagina = () => irAPagina(1);
  const ultimaPagina = () => irAPagina(totalPaginas);

  // Reiniciar a página 1 cuando cambien los datos
  useMemo(() => {
    setPaginaActual(1);
  }, [datos.length]);

  return {
    paginaActual,
    totalPaginas,
    datosPaginados,
    irAPagina,
    paginaAnterior,
    paginaSiguiente,
    primeraPagina,
    ultimaPagina
  };
};