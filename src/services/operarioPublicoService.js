// src/services/operarioPublicoService.js
import { supabase } from '../supabaseClient';

/**
 * Obtiene datos de un empleado (público - sin auth)
 */
export const obtenerEmpleadoPublico = async (empleadoId) => {
  const { data, error } = await supabase
    .from('empleados')
    .select('id, nombre, telefono')
    .eq('id', parseInt(empleadoId))
    .eq('activo', true)
    .limit(1); // 👈 evita error 406

  if (error) throw error;
  return data?.[0] || null; // 👈 devuelve null si no existe
};

/**
 * Obtiene asignaciones de un empleado específico (público - sin auth)
 */
export const obtenerAsignacionesEmpleadoPublico = async (empleadoId) => {
  const { data, error } = await supabase
    .from('asignaciones')
    .select(`
      *,
      operacion:operaciones!asignaciones_operacion_id_fkey(nombre, costo),
      prenda:prendas!asignaciones_prenda_id_fkey(referencia),
      orden:ordenes_produccion!asignaciones_orden_id_fkey(color, talla, numero_orden)
    `)
    .eq('empleado_id', parseInt(empleadoId))
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  
  return data.map(a => ({
    id: a.id,
    cantidad: a.cantidad,
    talla: a.talla || a.orden?.talla,
    color: a.color || a.orden?.color,
    monto: a.monto,
    completado: a.completado,
    fecha: a.fecha,
    fecha_terminado: a.fecha_terminado,
    operacion_nombre: a.operacion?.nombre || 'Sin nombre',
    operacion_costo: a.operacion?.costo || 0,
    prenda_ref: a.prenda?.referencia || 'Sin ref',
    numero_orden: a.orden?.numero_orden || '-'
  }));
};

/**
 * Obtiene estadísticas del día para el operario
 */
export const obtenerEstadisticasDiaOperario = async (empleadoId) => {
  const hoy = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('asignaciones')
    .select('cantidad, monto, completado')
    .eq('empleado_id', parseInt(empleadoId))
    .eq('completado', true)
    .gte('fecha_terminado', hoy)
    .lte('fecha_terminado', hoy + 'T23:59:59');
  
  if (error) throw error;
  
  const totalPiezas = data.reduce((sum, a) => sum + (a.cantidad || 0), 0);
  const totalMonto = data.reduce((sum, a) => sum + parseFloat(a.monto || 0), 0);
  const totalOperaciones = data.length;
  
  return { totalPiezas, totalMonto, totalOperaciones };
};
