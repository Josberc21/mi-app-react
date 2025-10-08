import { create } from 'zustand';
import { supabase } from './supabaseClient';

export const useDataStore = create((set, get) => ({
  // =================================================================
  // === 1. ESTADO (STATE) ===
  // Aquí vive TODA la información que antes tenías en useState en App.jsx
  // =================================================================

  // --- Datos de las tablas principales ---
  empleados: [],
  prendas: [],
  operaciones: [],
  asignaciones: [],
  ordenes: [],
  remisiones: [],

  // --- Estado de la Interfaz de Usuario (UI State) ---
  nominaFiltrada: null,
  filtroFechaInicio: '',
  filtroFechaFin: '',

  // --- Estados de Carga (Loading States) ---
  // Un objeto para manejar todos los estados de carga de forma centralizada
  loading: {
    empleados: false,
    prendas: false,
    operaciones: false,
    asignaciones: false,
    ordenes: false,
    remisiones: false,
    nomina: false,
  },

  // =================================================================
  // === 2. ACCIONES (ACTIONS) ===
  // Funciones para buscar y modificar el estado.
  // =================================================================

  // --- Acciones de Carga (Fetchers) ---
  // Cada función se encarga de una sola cosa.
  
  // setLoading es una función helper para no repetir código
  setLoading: (key, value) => set((state) => ({ loading: { ...state.loading, [key]: value } })),

  fetchInitialData: async () => {
    // Esta función puede traer los datos esenciales que se usan en muchas vistas
    // como empleados y prendas, para tenerlos disponibles rápidamente.
    const { fetchEmpleados, fetchPrendas } = get();
    await Promise.all([fetchEmpleados(), fetchPrendas()]);
  },

  fetchEmpleados: async () => {
    if (get().empleados.length > 0) return;
    get().setLoading('empleados', true);
    const { data } = await supabase.from('empleados').select('*').eq('activo', true).order('id');
    set({ empleados: data || [] });
    get().setLoading('empleados', false);
  },

  fetchPrendas: async () => {
    if (get().prendas.length > 0) return;
    get().setLoading('prendas', true);
    const { data } = await supabase.from('prendas').select('*').eq('activo', true).order('id');
    set({ prendas: data || [] });
    get().setLoading('prendas', false);
  },
  
  fetchOperaciones: async () => {
    if (get().operaciones.length > 0) return;
    get().setLoading('operaciones', true);
    const { data } = await supabase.from('operaciones').select('*').eq('activo', true).order('id');
    set({ operaciones: data || [] });
    get().setLoading('operaciones', false);
  },

  fetchAsignaciones: async () => {
    // Las asignaciones pueden ser muchas, así que las recargamos cada vez para tener datos frescos.
    get().setLoading('asignaciones', true);
    const { data } = await supabase.from('asignaciones').select('*').order('created_at', { ascending: false }).limit(1000);
    set({ asignaciones: data || [] });
    get().setLoading('asignaciones', false);
  },

  // ... Aquí irían `fetchOrdenes` y `fetchRemisiones` siguiendo el mismo patrón.

  // --- Acciones de Nómina ---
  
  setFiltroFechas: ({ inicio, fin }) => {
    set({ filtroFechaInicio: inicio, filtroFechaFin: fin });
  },

  limpiarFiltrosNomina: () => {
    set({ filtroFechaInicio: '', filtroFechaFin: '', nominaFiltrada: null });
  },

  generarReporteNomina: () => {
    // ¡Aquí está la magia! La lógica de negocio vive en el store.
    // Puede acceder a otros datos del store (empleados, asignaciones) usando get().
    get().setLoading('nomina', true);
    const { empleados, asignaciones, filtroFechaInicio, filtroFechaFin } = get();

    if (!filtroFechaInicio || !filtroFechaFin) {
      // Aquí podrías usar tu sistema de toast para advertir al usuario
      console.warn("Seleccione un rango de fechas");
      get().setLoading('nomina', false);
      return;
    }

    const fechaInicio = new Date(filtroFechaInicio);
    const fechaFin = new Date(filtroFechaFin);

    const reporte = empleados.map(emp => {
      const asignacionesEmp = asignaciones.filter(a => {
        if (!a.completado || !a.fecha_terminado || a.empleado_id !== emp.id) return false;
        const fechaTerm = new Date(a.fecha_terminado);
        return fechaTerm >= fechaInicio && fechaTerm <= fechaFin;
      });

      const totalMonto = asignacionesEmp.reduce((sum, a) => sum + parseFloat(a.monto), 0);
      
      return {
        id: emp.id,
        nombre: emp.nombre,
        operaciones: asignacionesEmp.length,
        piezas: asignacionesEmp.reduce((sum, a) => sum + a.cantidad, 0),
        monto: totalMonto
      };
    }).filter(r => r.monto > 0);

    set({ nominaFiltrada: reporte });
    get().setLoading('nomina', false);
  },

}));