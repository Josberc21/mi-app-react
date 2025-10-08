// src/services/prendasService.js
import { supabase } from '../supabaseClient';

export const obtenerPrendas = async () => {
  const { data, error } = await supabase
    .from('prendas')
    .select('*')
    .eq('activo', true)
    .order('id');
  
  if (error) throw error;
  return data;
};

export const crearPrenda = async (prenda) => {
  const { data, error } = await supabase
    .from('prendas')
    .insert([prenda])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const actualizarPrenda = async (id, prenda) => {
  const { data, error } = await supabase
    .from('prendas')
    .update(prenda)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const eliminarPrenda = async (id) => {
  const { error } = await supabase
    .from('prendas')
    .update({ activo: false })
    .eq('id', id);
  
  if (error) throw error;
};

export const buscarOCrearPrenda = async (referencia, descripcion = '') => {
  // Normalizar referencia
  const refNormalizada = referencia.trim().toUpperCase();

  // Buscar si existe (case insensitive)
  const { data: existente, error: errorBuscar } = await supabase
    .from('prendas')
    .select('*')
    .ilike('referencia', refNormalizada)
    .eq('activo', true)
    .maybeSingle();

  if (errorBuscar) throw errorBuscar;

  // Si existe, devolverla
  if (existente) return { prenda: existente, esNueva: false };

  // Si no existe, crearla
  const { data: nueva, error: errorCrear } = await supabase
    .from('prendas')
    .insert([{
      referencia: refNormalizada,
      descripcion: descripcion.trim()
    }])
    .select()
    .single();

  if (errorCrear) throw errorCrear;
  return { prenda: nueva, esNueva: true };
};