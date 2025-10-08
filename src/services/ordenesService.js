// src/services/ordenesService.js
import { supabase } from '../supabaseClient';

export const obtenerOrdenes = async () => {
  const { data, error } = await supabase
    .from('ordenes_produccion')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const generarNumeroOrden = async () => {
  const { data } = await supabase
    .from('ordenes_produccion')
    .select('numero_orden')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!data || !data.numero_orden) {
    return `ORD-${new Date().getFullYear()}-001`;
  }

  const match = data.numero_orden.match(/ORD-(\d{4})-(\d{3})/);
  if (!match) return `ORD-${new Date().getFullYear()}-001`;

  const año = parseInt(match[1]);
  const num = parseInt(match[2]);
  const añoActual = new Date().getFullYear();

  if (año === añoActual) {
    return `ORD-${añoActual}-${String(num + 1).padStart(3, '0')}`;
  } else {
    return `ORD-${añoActual}-001`;
  }
};

export const crearOrden = async (orden) => {
  const numeroOrden = await generarNumeroOrden();
  
  const { data, error } = await supabase
    .from('ordenes_produccion')
    .insert([{
      numero_orden: numeroOrden,
      prenda_id: parseInt(orden.prenda_id),
      color: orden.color,
      talla: orden.talla,
      cantidad_total: parseInt(orden.cantidad_total),
      fecha_entrada: orden.fecha_entrada
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const actualizarOrden = async (id, orden) => {
  const { data, error } = await supabase
    .from('ordenes_produccion')
    .update({
      prenda_id: parseInt(orden.prenda_id),
      color: orden.color,
      talla: orden.talla,
      cantidad_total: parseInt(orden.cantidad_total),
      fecha_entrada: orden.fecha_entrada
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const eliminarOrden = async (id) => {
  const { error } = await supabase
    .from('ordenes_produccion')
    .update({ activo: false })
    .eq('id', id);
  
  if (error) throw error;
};

export const obtenerDisponibilidadOrden = async (ordenId) => {
  const { data, error } = await supabase
    .rpc('get_disponibilidad_orden', { orden_id_param: ordenId });
  
  if (error) throw error;
  return data;
};