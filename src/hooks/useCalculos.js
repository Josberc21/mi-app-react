// src/hooks/useCalculos.js
import { useMemo, useCallback } from 'react';

export const useCalculos = (asignaciones, empleados, operaciones, ordenes, prendas) => {

  const calcularNominaEmpleado = useCallback((empleadoId) => {
    return asignaciones
      .filter(a => a.empleado_id === empleadoId && a.completado)
      .reduce((sum, a) => sum + parseFloat(a.monto || 0), 0);
  }, [asignaciones]);

  const calcularNominaTotal = useMemo(() => {
    return asignaciones
      .filter(a => a.completado)
      .reduce((sum, a) => sum + parseFloat(a.monto || 0), 0);
  }, [asignaciones]);

  const calcularProgresoOrden = useCallback((orden) => {
    const operacionesPrenda = operaciones.filter(op => op.prenda_id === orden.prenda_id);
    if (operacionesPrenda.length === 0) return { completadas: 0, porcentaje: 0, detalles: [] };

    // Construir mapa O(n) en lugar de filtrar O(n) por cada operación → O(n²) total
    const asigMap = new Map();
    for (const a of asignaciones) {
      if (a.orden_id === orden.id && a.completado) {
        asigMap.set(a.operacion_id, (asigMap.get(a.operacion_id) || 0) + Number(a.cantidad || 0));
      }
    }

    const detalles = operacionesPrenda.map(op => {
      const cantidadCompletada = asigMap.get(op.id) || 0;
      return {
        operacion: op.nombre,
        completadas: cantidadCompletada,
        total: orden.cantidad_total,
        porcentaje: Math.round((cantidadCompletada / orden.cantidad_total) * 100)
      };
    });

    const cantidadMinima = Math.min(...detalles.map(d => d.completadas));
    const porcentajeGeneral = Math.round((cantidadMinima / orden.cantidad_total) * 100);

    return { completadas: cantidadMinima, porcentaje: porcentajeGeneral, detalles };
  }, [asignaciones, operaciones]);

  const estadisticasDashboard = useMemo(() => {
    return {
      totalEmpleados: empleados.length,
      asignacionesPendientes: asignaciones.filter(a => !a.completado).length,
      asignacionesCompletadas: asignaciones.filter(a => a.completado).length,
      nominaTotal: calcularNominaTotal
    };
  }, [empleados, asignaciones, calcularNominaTotal]);

  return {
    calcularNominaEmpleado,
    calcularNominaTotal,
    calcularProgresoOrden,
    estadisticasDashboard
  };
};
