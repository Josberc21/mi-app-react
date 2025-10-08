// src/services/remisionesService.js
import { supabase } from '../supabaseClient';

export const obtenerRemisiones = async () => {
  const { data, error } = await supabase
    .from('remisiones')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const crearRemision = async (remision) => {
  const { data, error } = await supabase
    .from('remisiones')
    .insert([{
      orden_id: parseInt(remision.orden_id),
      cantidad_despachada: parseInt(remision.cantidad_despachada),
      fecha_despacho: remision.fecha_despacho,
      observaciones: remision.observaciones || ''
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const eliminarRemision = async (id) => {
  const { error } = await supabase
    .from('remisiones')
    .update({ activo: false })
    .eq('id', id);
  
  if (error) throw error;
};