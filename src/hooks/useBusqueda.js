import { useState, useMemo } from 'react';

export const useBusqueda = (datos, camposBusqueda) => {
  const [busqueda, setBusqueda] = useState('');

  const datosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return datos;

    const terminoBusqueda = busqueda.toLowerCase();
    
    return datos.filter(item => {
      return camposBusqueda.some(campo => {
        const valor = obtenerValorPorRuta(item, campo);
        return valor && valor.toString().toLowerCase().includes(terminoBusqueda);
      });
    });
  }, [datos, busqueda, camposBusqueda]);

  return {
    busqueda,
    setBusqueda,
    datosFiltrados
  };
};

// Función auxiliar para acceder a propiedades anidadas
const obtenerValorPorRuta = (obj, ruta) => {
  return ruta.split('.').reduce((acc, parte) => acc?.[parte], obj);
};