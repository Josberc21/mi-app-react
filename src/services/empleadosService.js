// src/services/empleadosService.js
import { supabase } from '../supabaseClient';

export const obtenerEmpleados = async () => {
  const { data, error } = await supabase
    .from('empleados')
    .select('*')
    .eq('activo', true)
    .order('id');
  
  if (error) throw error;
  return data;
};

export const crearEmpleado = async (empleado) => {
  const { data, error } = await supabase
    .from('empleados')
    .insert([empleado])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const actualizarEmpleado = async (id, empleado) => {
  const { data, error } = await supabase
    .from('empleados')
    .update(empleado)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const eliminarEmpleado = async (id) => {
  const { error } = await supabase
    .from('empleados')
    .update({ activo: false })
    .eq('id', id);
  
  if (error) throw error;
};