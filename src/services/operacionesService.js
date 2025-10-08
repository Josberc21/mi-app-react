// src/services/operacionesService.js
import { supabase } from '../supabaseClient';

export const obtenerOperaciones = async () => {
  const { data, error } = await supabase
    .from('operaciones')
    .select('*')
    .eq('activo', true)
    .order('id');
  
  if (error) throw error;
  return data;
};

export const crearOperacion = async (operacion) => {
  const { data, error } = await supabase
    .from('operaciones')
    .insert([operacion])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const actualizarOperacion = async (id, operacion) => {
  const { data, error } = await supabase
    .from('operaciones')
    .update(operacion)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const eliminarOperacion = async (id) => {
  const { error } = await supabase
    .from('operaciones')
    .update({ activo: false })
    .eq('id', id);
  
  if (error) throw error;
};