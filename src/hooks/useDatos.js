import { useState, useEffect, useCallback } from 'react';
import { obtenerEmpleados } from '../services/empleadosService';
import { obtenerPrendas } from '../services/prendasService';
import { obtenerOperaciones } from '../services/operacionesService';
import { obtenerAsignaciones } from '../services/asignacionesService';
import { obtenerOrdenes } from '../services/ordenesService';
import { obtenerRemisiones } from '../services/remisionesService';


export const useDatos = (currentUser) => {
  const [datos, setDatos] = useState({
    empleados: [],
    prendas: [],
    operaciones: [],
    asignaciones: [],
    ordenes: [],
    remisiones: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarDatos = useCallback(async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [empleados, prendas, operaciones, asignaciones, ordenes, remisiones] = await Promise.all([
        obtenerEmpleados(),
        obtenerPrendas(),
        obtenerOperaciones(),
        obtenerAsignaciones(),
        obtenerOrdenes(),
        obtenerRemisiones()
      ]);

      setDatos({
        empleados,
        prendas,
        operaciones,
        asignaciones,
        ordenes,
        remisiones
      });
    } catch (err) {
      setError(err.message);
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  return {
    ...datos,
    loading,
    error,
    recargar: cargarDatos
  };
};