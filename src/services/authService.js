// src/services/authService.js
import { supabase } from '../supabaseClient';

/**
 * Inicia sesión con Supabase Auth
 */
export const iniciarSesion = async (username, password) => {
  try {
    // Convertir username a email
    const email = `${username}@tuempresa.com`;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Obtener info del usuario desde tabla usuarios
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_id', data.user.id)
      .single();

    if (userError) throw userError;

    return {
      success: true,
      user: userData,
      session: data.session
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Cierra sesión
 */
export const cerrarSesion = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Obtiene el usuario actual desde la sesión
 */
export const obtenerUsuarioActual = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return null;
    }
    
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_id', session.user.id)
      .single();

    if (userError) {
      console.error('Error al obtener datos del usuario:', userError);
      return null;
    }

    return userData;
  } catch (error) {
    console.error('Error en obtenerUsuarioActual:', error);
    return null;
  }
};

/**
 * Verifica si hay sesión activa
 */
export const verificarSesion = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};