import { create } from 'zustand';
import { supabase } from './supabaseClient';

export const useDataStore = create((set, get) => ({
  // ==================== ESTADO ====================
  empleados: [],
  prendas: [],
  operaciones: [],
  asignaciones: [],
  ordenes: [],
  remisiones: [],

  // Estado de conexión
  isOnline: navigator.onLine,
  lastSync: null,
  pendingChanges: [],

  // Loading states
  loading: {
    empleados: false,
    prendas: false,
    operaciones: false,
    asignaciones: false,
    ordenes: false,
    remisiones: false,
  },

  // ==================== ACCIONES ====================
  
  setLoading: (key, value) => 
    set((state) => ({ 
      loading: { ...state.loading, [key]: value } 
    })),

  setOnlineStatus: (status) => set({ isOnline: status }),

  // Cargar todos los datos iniciales
  fetchAllData: async () => {
    const { 
      fetchEmpleados, 
      fetchPrendas, 
      fetchOperaciones, 
      fetchAsignaciones, 
      fetchOrdenes, 
      fetchRemisiones 
    } = get();

    await Promise.allSettled([
      fetchEmpleados(),
      fetchPrendas(),
      fetchOperaciones(),
      fetchAsignaciones(),
      fetchOrdenes(),
      fetchRemisiones(),
    ]);

    set({ lastSync: new Date() });
  },

  fetchEmpleados: async () => {
    get().setLoading('empleados', true);
    try {
      const { data, error } = await supabase
        .from('empleados')
        .select('*')
        .eq('activo', true)
        .order('id');
      
      if (error) throw error;
      set({ empleados: data || [] });
    } catch (error) {
      console.error('Error fetching empleados:', error);
    } finally {
      get().setLoading('empleados', false);
    }
  },

  fetchPrendas: async () => {
    get().setLoading('prendas', true);
    try {
      const { data, error } = await supabase
        .from('prendas')
        .select('*')
        .eq('activo', true)
        .order('id');
      
      if (error) throw error;
      set({ prendas: data || [] });
    } catch (error) {
      console.error('Error fetching prendas:', error);
    } finally {
      get().setLoading('prendas', false);
    }
  },

  fetchOperaciones: async () => {
    get().setLoading('operaciones', true);
    try {
      const { data, error } = await supabase
        .from('operaciones')
        .select('*')
        .eq('activo', true)
        .order('id');
      
      if (error) throw error;
      set({ operaciones: data || [] });
    } catch (error) {
      console.error('Error fetching operaciones:', error);
    } finally {
      get().setLoading('operaciones', false);
    }
  },

  fetchAsignaciones: async () => {
    get().setLoading('asignaciones', true);
    try {
      const { data, error } = await supabase
        .from('asignaciones')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);
      
      if (error) throw error;
      set({ asignaciones: data || [] });
    } catch (error) {
      console.error('Error fetching asignaciones:', error);
    } finally {
      get().setLoading('asignaciones', false);
    }
  },

  fetchOrdenes: async () => {
    get().setLoading('ordenes', true);
    try {
      const { data, error } = await supabase
        .from('ordenes_produccion')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      
      if (error) throw error;
      set({ ordenes: data || [] });
    } catch (error) {
      console.error('Error fetching ordenes:', error);
    } finally {
      get().setLoading('ordenes', false);
    }
  },

  fetchRemisiones: async () => {
    get().setLoading('remisiones', true);
    try {
      const { data, error } = await supabase
        .from('remisiones')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      
      if (error) throw error;
      set({ remisiones: data || [] });
    } catch (error) {
      console.error('Error fetching remisiones:', error);
    } finally {
      get().setLoading('remisiones', false);
    }
  },

  // Sincronizar cambios pendientes
  syncPendingChanges: async () => {
    const { pendingChanges, isOnline } = get();
    
    if (!isOnline || pendingChanges.length === 0) return;

    // Aquí implementarás la lógica de sincronización
    console.log('Sincronizando cambios pendientes...', pendingChanges);
    
    // Por ahora solo limpiamos
    set({ pendingChanges: [] });
  },
}));