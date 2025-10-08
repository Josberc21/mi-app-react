// src/services/asignacionesService.js
import { supabase } from '../supabaseClient';

export const obtenerAsignaciones = async (limite = 1000) => {
  const { data, error } = await supabase
    .from('asignaciones')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limite);
  
  if (error) throw error;
  return data;
};

export const crearAsignacion = async (asignacion) => {
  const { data, error } = await supabase
    .from('asignaciones')
    .insert([{
      empleado_id: parseInt(asignacion.empleado_id),
      prenda_id: parseInt(asignacion.prenda_id),
      operacion_id: parseInt(asignacion.operacion_id),
      cantidad: parseInt(asignacion.cantidad),
      talla: asignacion.talla,
      color: asignacion.color,
      orden_id: parseInt(asignacion.orden_id),
      fecha: asignacion.fecha,
      completado: asignacion.completado || false,
      monto: parseFloat(asignacion.monto)
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const actualizarAsignacion = async (id, campos) => {
  const { data, error } = await supabase
    .from('asignaciones')
    .update(campos)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const completarAsignacion = async (id, cantidad) => {
  const { data, error } = await supabase
    .from('asignaciones')
    .update({
      cantidad: parseInt(cantidad),
      completado: true,
      fecha_terminado: new Date().toISOString().split('T')[0]
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const revertirAsignacion = async (id) => {
  const { data, error } = await supabase
    .from('asignaciones')
    .update({
      completado: false,
      fecha_terminado: null
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const eliminarAsignacion = async (id) => {
  const { error } = await supabase
    .from('asignaciones')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};