// src/services/operarioService.js
import { supabase } from '../supabaseClient';

// ─── WORKER (operario autenticado) ────────────────────────────────────────────

export const obtenerMiEmpleado = async (empleadoId) => {
  const { data, error } = await supabase
    .from('empleados')
    .select('id, nombre, telefono, activo')
    .eq('id', empleadoId)
    .single();
  if (error) throw error;
  return data;
};

export const obtenerMisAsignaciones = async (empleadoId) => {
  const { data, error } = await supabase
    .from('asignaciones')
    .select(`
      *,
      operacion:operaciones!asignaciones_operacion_id_fkey(nombre, costo),
      prenda:prendas!asignaciones_prenda_id_fkey(referencia),
      orden:ordenes_produccion!asignaciones_orden_id_fkey(color, talla, numero_orden)
    `)
    .eq('empleado_id', empleadoId)
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return data.map(a => ({
    id: a.id,
    empleado_id: a.empleado_id,
    operacion_id: a.operacion_id,
    prenda_id: a.prenda_id,
    orden_id: a.orden_id,
    cantidad: a.cantidad,
    cantidad_reportada: a.cantidad_reportada,
    estado_reporte: a.estado_reporte,
    fecha_reporte: a.fecha_reporte,
    talla: a.talla || a.orden?.talla,
    color: a.color || a.orden?.color,
    monto: a.monto,
    completado: a.completado,
    fecha: a.fecha,
    fecha_terminado: a.fecha_terminado,
    created_at: a.created_at,
    operacion_nombre: a.operacion?.nombre || 'Sin nombre',
    operacion_costo: a.operacion?.costo || 0,
    prenda_ref: a.prenda?.referencia || 'Sin ref',
    numero_orden: a.orden?.numero_orden || '-',
  }));
};

export const obtenerMisEstadisticasHoy = async (empleadoId) => {
  const hoy = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('asignaciones')
    .select('cantidad, monto, completado')
    .eq('empleado_id', empleadoId)
    .eq('completado', true)
    .gte('fecha_terminado', hoy)
    .lte('fecha_terminado', hoy + 'T23:59:59');
  if (error) throw error;
  const totalPiezas = data.reduce((sum, a) => sum + (a.cantidad || 0), 0);
  const totalMonto = data.reduce((sum, a) => sum + parseFloat(a.monto || 0), 0);
  return { totalPiezas, totalMonto, totalOperaciones: data.length };
};

export const obtenerMiNomina = async (empleadoId) => {
  // Calculamos directo desde asignaciones — no usamos vista_nomina
  // porque la vista puede incluir datos históricos de otras fuentes
  const { data, error } = await supabase
    .from('asignaciones')
    .select('cantidad, monto, fecha_terminado')
    .eq('empleado_id', empleadoId)
    .eq('completado', true)
    .not('fecha_terminado', 'is', null)
    .order('fecha_terminado', { ascending: false });
  if (error) throw error;

  // Agrupar por mes (YYYY-MM)
  const porMes = {};
  for (const a of data) {
    const mes = a.fecha_terminado.substring(0, 7);
    if (!porMes[mes]) porMes[mes] = { mes, total_nomina: 0, operaciones_completadas: 0 };
    porMes[mes].total_nomina        += parseFloat(a.monto || 0);
    porMes[mes].operaciones_completadas += 1;
  }

  return Object.values(porMes)
    .sort((a, b) => b.mes.localeCompare(a.mes))
    .slice(0, 6);
};

// Actualizar nombre y teléfono del empleado
export const actualizarMiPerfil = async (empleadoId, { nombre, telefono }) => {
  const { data, error } = await supabase
    .from('empleados')
    .update({ nombre: nombre.trim(), telefono: telefono.trim() })
    .eq('id', empleadoId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Cambiar contraseña vía Supabase Auth (usuario autenticado)
export const cambiarMiContrasena = async (nuevaContrasena) => {
  const { error } = await supabase.auth.updateUser({ password: nuevaContrasena });
  if (error) throw error;
};

// Operario reporta cuántas terminó (levantar la mano)
export const reportarProgreso = async (asignacionId, cantidadReportada) => {
  const { data, error } = await supabase
    .from('asignaciones')
    .update({
      cantidad_reportada: cantidadReportada,
      estado_reporte: 'pendiente',
      fecha_reporte: new Date().toISOString(),
    })
    .eq('id', asignacionId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ─── ADMIN — gestión de reportes ──────────────────────────────────────────────

export const obtenerReportesPendientes = async () => {
  const { data, error } = await supabase
    .from('asignaciones')
    .select(`
      *,
      empleado:empleados!asignaciones_empleado_id_fkey(nombre),
      operacion:operaciones!asignaciones_operacion_id_fkey(nombre, costo),
      prenda:prendas!asignaciones_prenda_id_fkey(referencia),
      orden:ordenes_produccion!asignaciones_orden_id_fkey(numero_orden)
    `)
    .eq('estado_reporte', 'pendiente')
    .order('fecha_reporte', { ascending: true });
  if (error) throw error;
  return data.map(a => ({
    id: a.id,
    empleado_id: a.empleado_id,
    empleado_nombre: a.empleado?.nombre || 'Sin nombre',
    operacion_id: a.operacion_id,
    prenda_id: a.prenda_id,
    orden_id: a.orden_id,
    cantidad: a.cantidad,
    cantidad_reportada: a.cantidad_reportada,
    operacion_nombre: a.operacion?.nombre || 'Sin nombre',
    operacion_costo: a.operacion?.costo || 0,
    prenda_ref: a.prenda?.referencia || 'Sin ref',
    numero_orden: a.orden?.numero_orden || '-',
    talla: a.talla,
    color: a.color,
    fecha: a.fecha,
    fecha_reporte: a.fecha_reporte,
    monto: a.monto,
  }));
};

// Admin aprueba: completa la asignación con la cantidad reportada
// Si es parcial, crea una fila nueva con el resto (igual que completarAsignacion en asignacionesService)
export const aprobarReporte = async (asignacion) => {
  const { cantidad_reportada, cantidad, operacion_costo } = asignacion;

  const { data, error } = await supabase
    .from('asignaciones')
    .update({
      completado: true,
      cantidad: cantidad_reportada,
      monto: operacion_costo * cantidad_reportada,
      fecha_terminado: new Date().toISOString().split('T')[0],
      estado_reporte: 'aprobado',
    })
    .eq('id', asignacion.id)
    .select()
    .single();
  if (error) throw error;

  // Crear fila con el resto si fue reporte parcial
  if (cantidad_reportada < cantidad) {
    const resto = cantidad - cantidad_reportada;
    const { error: errInsert } = await supabase
      .from('asignaciones')
      .insert([{
        empleado_id: asignacion.empleado_id,
        prenda_id: asignacion.prenda_id,
        operacion_id: asignacion.operacion_id,
        cantidad: resto,
        talla: asignacion.talla,
        color: asignacion.color,
        orden_id: asignacion.orden_id,
        fecha: asignacion.fecha,
        monto: operacion_costo * resto,
        completado: false,
      }]);
    if (errInsert) throw errInsert;
  }
  return data;
};

// Admin rechaza: limpia el reporte, el operario puede volver a reportar
export const rechazarReporte = async (asignacionId) => {
  const { data, error } = await supabase
    .from('asignaciones')
    .update({
      cantidad_reportada: null,
      estado_reporte: 'rechazado',
      fecha_reporte: null,
    })
    .eq('id', asignacionId)
    .select()
    .single();
  if (error) throw error;
  return data;
};
