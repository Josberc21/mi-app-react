import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
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

      setDatos({ empleados, prendas, operaciones, asignaciones, ordenes, remisiones });
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

  // ── Supabase Realtime ─────────────────────────────────────────────
  // Cada tabla recarga solo su slice de estado cuando hay cambios.
  // asignaciones y ordenes son las más críticas (cambios frecuentes en taller).
  useEffect(() => {
    if (!currentUser) return;

    const makeChannel = (table, fetchFn, key) =>
      supabase
        .channel(`rt-${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, async () => {
          try {
            const data = await fetchFn();
            setDatos(prev => ({ ...prev, [key]: data }));
          } catch (err) {
            console.error(`Realtime reload error [${table}]:`, err);
          }
        })
        .subscribe();

    const channels = [
      makeChannel('asignaciones', obtenerAsignaciones, 'asignaciones'),
      makeChannel('ordenes',      obtenerOrdenes,      'ordenes'),
      makeChannel('remisiones',   obtenerRemisiones,   'remisiones'),
      makeChannel('empleados',    obtenerEmpleados,    'empleados'),
      makeChannel('operaciones',  obtenerOperaciones,  'operaciones'),
      makeChannel('prendas',      obtenerPrendas,      'prendas'),
    ];

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [currentUser]);

  return {
    ...datos,
    loading,
    error,
    recargar: cargarDatos
  };
};
