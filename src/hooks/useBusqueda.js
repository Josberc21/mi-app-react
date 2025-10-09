import { useState, useMemo } from 'react';

export const useBusqueda = (datos, camposBusquedaOFuncion) => {
  const [busqueda, setBusqueda] = useState('');

  const datosFiltrados = useMemo(() => {
    // ✅ Protección: Si datos no es array, retornar array vacío
    if (!Array.isArray(datos)) {
      console.warn('useBusqueda: datos no es un array', datos);
      return [];
    }

    // Si no hay búsqueda, retornar todos los datos
    if (!busqueda.trim()) {
      return datos;
    }

    const terminoBusqueda = busqueda.trim().toLowerCase();

    return datos.filter(item => {
      try {
        // ✅ CASO 1: Si es una FUNCIÓN personalizada
        if (typeof camposBusquedaOFuncion === 'function') {
          return camposBusquedaOFuncion(item, terminoBusqueda);
        }

        // ✅ CASO 2: Si es un ARRAY de campos (comportamiento original)
        if (Array.isArray(camposBusquedaOFuncion)) {
          return camposBusquedaOFuncion.some(campo => {
            const valor = obtenerValorPorRuta(item, campo);
            return valor && valor.toString().toLowerCase().includes(terminoBusqueda);
          });
        }

        // ⚠️ Si no es ni función ni array, avisar pero no romper
        console.warn('useBusqueda: camposBusqueda debe ser un array o función', camposBusquedaOFuncion);
        return true;
      } catch (error) {
        console.error('Error al filtrar item:', error, item);
        return false;
      }
    });
  }, [datos, busqueda, camposBusquedaOFuncion]);

  return {
    busqueda,
    setBusqueda,
    datosFiltrados
  };
};

// Función auxiliar para acceder a propiedades anidadas
const obtenerValorPorRuta = (obj, ruta) => {
  if (!obj || !ruta) return null;
  
  try {
    return ruta.split('.').reduce((acc, parte) => acc?.[parte], obj);
  } catch (error) {
    console.error('Error al acceder a ruta:', ruta, error);
    return null;
  }
};