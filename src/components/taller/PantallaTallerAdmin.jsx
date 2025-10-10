// src/components/taller/PantallaTallerAdmin.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock, TrendingUp, AlertCircle, Users, Package,
  Activity, ChevronDown, ChevronUp, Target, Zap,
  AlertTriangle, CheckCircle, ArrowUpDown
} from 'lucide-react';
import { calcularDiasEntre } from '../../utils/dateUtils';

const PantallaTallerAdmin = ({
  empleados,
  asignaciones,
  operaciones,
  prendas,
  ordenes
}) => {
  const [actualizar, setActualizar] = useState(0);
  const [filtroOperarios, setFiltroOperarios] = useState('hoy');
  const [ordenOperarios, setOrdenOperarios] = useState({ campo: null, direccion: 'asc' });
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({
    operarios: true,
    ordenes: true,
    metricas: true,
    alertas: true
  });

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setActualizar(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleSeccion = (seccion) => {
    setSeccionesAbiertas(prev => ({
      ...prev,
      [seccion]: !prev[seccion]
    }));
  };

  // ========== UTILIDADES ==========
  const extraerSoloFecha = (fecha) => {
    if (!fecha) return null;
    if (typeof fecha === 'string') {
      return fecha.split('T')[0].split(' ')[0];
    }
    const d = new Date(fecha);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const esMismaFecha = (fecha1, fecha2) => {
    if (!fecha1 || !fecha2) return false;
    return extraerSoloFecha(fecha1) === extraerSoloFecha(fecha2);
  };

  const calcularTiempoTranscurrido = (fechaInicio, createdAt) => {
    if (!fechaInicio) return '—';
    let inicio;
    if (createdAt) {
      inicio = new Date(createdAt);
    } else {
      inicio = new Date(extraerSoloFecha(fechaInicio) + 'T00:00:00');
    }
    const ahora = new Date();
    const diffMs = ahora - inicio;
    if (diffMs < 0) return '0m';

    const totalMinutos = Math.floor(diffMs / (1000 * 60));
    const dias = Math.floor(totalMinutos / (60 * 24));
    const horas = Math.floor((totalMinutos % (60 * 24)) / 60);
    const minutos = totalMinutos % 60;

    if (dias > 0) return `${dias}d ${horas}h`;
    if (horas > 0) return `${horas}h ${minutos}m`;
    return `${minutos}m`;
  };
  const parseTiempo = (texto) => {
    if (!texto || texto === '—') return 0;
    const match = texto.match(/(?:(\d+)d)?\s*(?:(\d+)h)?\s*(?:(\d+)m)?/);
    if (!match) return 0;
    const [, d = 0, h = 0, m = 0] = match.map(Number);
    return (d || 0) * 1440 + (h || 0) * 60 + (m || 0);
  };;
  // ========== FECHA DE HOY ==========
  const hoy = new Date();
  const hoyStr = extraerSoloFecha(hoy);

  // ========== ASIGNACIONES DEL DÍA ==========
  const { asignacionesHoy, asignacionesPendientes, asignacionesCompletadasHoy } = useMemo(() => {
    const hoyCreadas = asignaciones.filter(a => esMismaFecha(a.fecha, hoy));
    const pendientes = asignaciones.filter(a => !a.completado);
    const completadasHoy = asignaciones.filter(a =>
      a.completado && a.fecha_terminado && esMismaFecha(a.fecha_terminado, hoy)
    );

    return {
      asignacionesHoy: hoyCreadas,
      asignacionesPendientes: pendientes,
      asignacionesCompletadasHoy: completadasHoy
    };
  }, [asignaciones, hoy]);

  // ========== META DEL DÍA ==========
  const metaDiaria = useMemo(() => {
    const metaTotal = asignacionesHoy.reduce((sum, a) => sum + (a.cantidad || 0), 0);
    const completadasDeHoy = asignacionesHoy
      .filter(a => a.completado)
      .reduce((sum, a) => sum + (a.cantidad || 0), 0);
    const pendientesDeHoy = asignacionesHoy
      .filter(a => !a.completado)
      .reduce((sum, a) => sum + (a.cantidad || 0), 0);

    const progreso = metaTotal > 0 ? (completadasDeHoy / metaTotal) * 100 : 0;

    return {
      meta: metaTotal,
      completadas: completadasDeHoy,
      progreso: Math.min(progreso, 100),
      pendientes: pendientesDeHoy
    };
  }, [asignacionesHoy]);

  // ========== VELOCIDAD Y PROYECCIÓN (SIN LÍMITE 6PM) ==========
  const velocidad = useMemo(() => {
    if (metaDiaria.completadas === 0) {
      return { prendasPorHora: 0, proyeccion: 0, alcanzaraMeta: false };
    }

    const horasDesdeInicio = asignacionesCompletadasHoy.length > 0
      ? (() => {
        const primeraCompletada = new Date(
          Math.min(...asignacionesCompletadasHoy.map(a => new Date(a.fecha_terminado).getTime()))
        );
        const ahora = new Date();
        return Math.max(0.5, (ahora - primeraCompletada) / (1000 * 60 * 60));
      })()
      : 1;

    const prendasPorHora = Math.round(metaDiaria.completadas / horasDesdeInicio);
    const ahora = new Date();
    const finDelDia = new Date();
    finDelDia.setHours(23, 59, 59, 999);
    const horasRestantes = Math.max(0, (finDelDia - ahora) / (1000 * 60 * 60));
    const proyeccion = Math.round(metaDiaria.completadas + (prendasPorHora * horasRestantes));

    return {
      prendasPorHora,
      proyeccion,
      alcanzaraMeta: proyeccion >= metaDiaria.meta
    };
  }, [metaDiaria, asignacionesCompletadasHoy]);

  // ========== MÉTRICAS GLOBALES ==========
  const metricasGlobales = useMemo(() => {
    const totalMontoHoy = asignacionesCompletadasHoy.reduce((sum, a) => sum + parseFloat(a.monto || 0), 0);
    const operariosQueTrabajaronHoy = new Set(asignacionesHoy.map(a => a.empleado_id)).size;
    const eficienciaPromedio = operariosQueTrabajaronHoy > 0
      ? Math.round((metaDiaria.completadas / operariosQueTrabajaronHoy) * 100) / 100
      : 0;

    return {
      totalMontoHoy,
      eficienciaPromedio,
      operariosActivos: empleados.filter(e =>
        asignacionesPendientes.some(a => a.empleado_id === e.id)
      ).length,
      operariosDisponibles: empleados.length - empleados.filter(e =>
        asignacionesPendientes.some(a => a.empleado_id === e.id)
      ).length,
      operariosQueTrabajaronHoy
    };
  }, [asignacionesCompletadasHoy, asignacionesHoy, empleados, metaDiaria, asignacionesPendientes]);

  // ========== ALERTAS CRÍTICAS ==========
  const alertasCriticas = useMemo(() => {
    const alertas = [];

    empleados.forEach(emp => {
      const pendientesEmp = asignacionesPendientes.filter(a => a.empleado_id === emp.id);
      if (pendientesEmp.length > 0) {
        const masAntigua = pendientesEmp.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0];
        const dias = calcularDiasEntre(masAntigua.fecha, new Date());
        if (dias > 2) {
          const op = operaciones.find(o => o.id === masAntigua.operacion_id);
          alertas.push({
            tipo: 'atascado',
            nivel: 'critico',
            mensaje: `${emp.nombre} lleva ${dias} días en "${op?.nombre}"`,
            operario: emp.nombre,
            dias
          });
        }
      }
    });

    ordenes.forEach(orden => {
      const dias = calcularDiasEntre(orden.fecha_entrada, new Date());
      if (dias > 15) {
        alertas.push({
          tipo: 'orden_atrasada',
          nivel: 'urgente',
          mensaje: `Orden ${orden.numero_orden} lleva ${dias} días en proceso`,
          orden: orden.numero_orden,
          dias
        });
      }
    });

    const horaActual = new Date().getHours();
    if (horaActual >= 12 && metaDiaria.progreso < 50 && metaDiaria.meta > 0) {
      alertas.push({
        tipo: 'baja_produccion',
        nivel: 'atencion',
        mensaje: `Producción al ${metaDiaria.progreso.toFixed(0)}% a media jornada`,
        progreso: metaDiaria.progreso
      });
    }

    return alertas.sort((a, b) => {
      const prioridad = { critico: 0, urgente: 1, atencion: 2 };
      return prioridad[a.nivel] - prioridad[b.nivel];
    });
  }, [empleados, asignacionesPendientes, operaciones, ordenes, metaDiaria]);

  // ========== ESTADO DE OPERARIOS ==========
  const estadoOperarios = useMemo(() => {
    return empleados.map(emp => {
      const asignacionesPendientesEmp = asignacionesPendientes.filter(a => a.empleado_id === emp.id);
      const asignacionesCompletadasHoyEmp = asignacionesCompletadasHoy.filter(a => a.empleado_id === emp.id);

      if (asignacionesPendientesEmp.length === 0) {
        return {
          ...emp,
          estado: 'disponible',
          operacionActual: null,
          avance: null,
          tiempoEnOperacion: null,
          totalPendientes: 0,
          totalCompletadas: asignacionesCompletadasHoyEmp.reduce((sum, a) => sum + (a.cantidad || 0), 0),
          carga: 0
        };
      }

      const operacionActual = asignacionesPendientesEmp.sort((a, b) =>
        new Date(a.created_at || a.fecha) - new Date(b.created_at || b.fecha)
      )[0];

      const op = operaciones.find(o => o.id === operacionActual.operacion_id);
      const todasAsignacionesOperacion = asignaciones.filter(a =>
        a.empleado_id === emp.id &&
        a.operacion_id === operacionActual.operacion_id &&
        a.orden_id === operacionActual.orden_id
      );

      const totalOperacion = todasAsignacionesOperacion.reduce((sum, a) => sum + (a.cantidad || 0), 0);
      const completadasOperacion = todasAsignacionesOperacion
        .filter(a => a.completado)
        .reduce((sum, a) => sum + (a.cantidad || 0), 0);

      const tiempoEnOperacion = calcularTiempoTranscurrido(
        operacionActual.fecha,
        operacionActual.created_at
      );

      const diasEnOperacion = calcularDiasEntre(operacionActual.fecha, new Date());
      let estado = 'trabajando';
      if (diasEnOperacion > 2) {
        estado = 'atascado';
      } else if (totalOperacion > 0 && completadasOperacion / totalOperacion > 0.8) {
        estado = 'finalizando';
      }

      const totalPendientes = asignacionesPendientesEmp.reduce((sum, a) => sum + (a.cantidad || 0), 0);
      const totalCompletadas = asignacionesCompletadasHoyEmp.reduce((sum, a) => sum + (a.cantidad || 0), 0);

      return {
        ...emp,
        estado,
        operacionActual: op?.nombre || 'Sin nombre',
        avance: `${completadasOperacion}/${totalOperacion}`,
        tiempoEnOperacion,
        totalPendientes,
        totalCompletadas,
        carga: totalPendientes,
        orden: operacionActual.orden_id
      };
    }).sort((a, b) => {
      const prioridad = { atascado: 0, trabajando: 1, finalizando: 2, disponible: 3 };
      if (prioridad[a.estado] !== prioridad[b.estado]) {
        return prioridad[a.estado] - prioridad[b.estado];
      }
      return b.carga - a.carga;
    });
  }, [empleados, asignacionesPendientes, asignacionesCompletadasHoy, operaciones, asignaciones]);

  // ========== CONTADORES ==========
  const contadores = useMemo(() => {
    const empleadosConPendientesHoy = new Set(
      asignacionesHoy.filter(a => !a.completado).map(a => a.empleado_id)
    );
    return {
      hoy: estadoOperarios.filter(op => empleadosConPendientesHoy.has(op.id)).length,
      atrasados: estadoOperarios.filter(op =>
        asignacionesPendientes.some(a =>
          a.empleado_id === op.id &&
          calcularDiasEntre(a.fecha, new Date()) > 1
        )
      ).length,
      disponibles: estadoOperarios.filter(op => op.estado === 'disponible').length
    };
  }, [estadoOperarios, asignacionesHoy, asignacionesPendientes]);

  // ========== FILTRADO DE OPERARIOS ==========
  const operariosFiltrados = useMemo(() => {
    if (filtroOperarios === 'hoy') {
      const empleadosConPendientesHoy = new Set(
        asignacionesHoy.filter(a => !a.completado).map(a => a.empleado_id)
      );
      return estadoOperarios.filter(op => empleadosConPendientesHoy.has(op.id));
    }
    if (filtroOperarios === 'atrasados') {
      return estadoOperarios.filter(op =>
        asignacionesPendientes.some(a =>
          a.empleado_id === op.id &&
          calcularDiasEntre(a.fecha, new Date()) > 1
        )
      );
    }
    if (filtroOperarios === 'disponibles') {
      return estadoOperarios.filter(op => op.estado === 'disponible');
    }
    return estadoOperarios;
  }, [estadoOperarios, filtroOperarios, asignacionesHoy, asignacionesPendientes]);

  const operariosOrdenados = useMemo(() => {
    if (!ordenOperarios.campo) return operariosFiltrados;

    return [...operariosFiltrados].sort((a, b) => {
      const dir = ordenOperarios.direccion === 'asc' ? 1 : -1;
      let valA = a[ordenOperarios.campo];
      let valB = b[ordenOperarios.campo];

      if (ordenOperarios.campo === 'tiempoEnOperacion') {
        valA = parseTiempo(valA);
        valB = parseTiempo(valB);
      }

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });
  }, [operariosFiltrados, ordenOperarios]);


  // ========== ÓRDENES CRÍTICAS ==========
  const ordenesCriticas = useMemo(() => {
    return ordenes.map(orden => {
      const diasDesdeEntrada = calcularDiasEntre(orden.fecha_entrada, new Date());
      const operacionesRequeridas = operaciones.filter(op => op.prenda_id === orden.prenda_id);
      const totalOperaciones = operacionesRequeridas.length;

      let operacionesCompletadas = 0;
      operacionesRequeridas.forEach(op => {
        const asignacionesOp = asignaciones.filter(a =>
          a.orden_id === orden.id &&
          a.operacion_id === op.id &&
          a.completado
        );
        const completadas = asignacionesOp.reduce((sum, a) => sum + (a.cantidad || 0), 0);
        if (completadas >= orden.cantidad_total) operacionesCompletadas++;
      });

      const progreso = totalOperaciones > 0 ? Math.round((operacionesCompletadas / totalOperaciones) * 100) : 0;

      let criticidad = 'normal';
      if (diasDesdeEntrada > 15 && progreso < 50) {
        criticidad = 'critico';
      } else if (diasDesdeEntrada > 10 && progreso < 70) {
        criticidad = 'urgente';
      } else if (diasDesdeEntrada > 7 && progreso < 80) {
        criticidad = 'atencion';
      }

      return {
        ...orden,
        diasDesdeEntrada,
        progreso,
        criticidad,
        operacionesCompletadas,
        totalOperaciones
      };
    })
      .filter(o => o.criticidad !== 'normal')
      .sort((a, b) => {
        const prioridad = { critico: 0, urgente: 1, atencion: 2 };
        return prioridad[a.criticidad] - prioridad[b.criticidad];
      })
      .slice(0, 5);
  }, [ordenes, operaciones, asignaciones]);

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">🎯 Torre de Control - Taller</h1>
              <p className="text-blue-100 mt-2">
                {new Date().toLocaleDateString('es-CO', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xl font-mono font-bold">
                  {new Date().toLocaleTimeString('es-CO', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-1">Actualización automática cada 30s</p>
            </div>
          </div>
        </div>

        {/* PANEL DE MÉTRICAS HERO */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Meta del día */}
          <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-blue-500" />
              <span className={`text-3xl font-bold ${metaDiaria.progreso >= 100 ? 'text-green-600' :
                metaDiaria.progreso >= 50 ? 'text-blue-600' : 'text-amber-600'
                }`}>
                {metaDiaria.progreso.toFixed(0)}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase">Meta del Día</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {metaDiaria.completadas}/{metaDiaria.meta}
            </p>
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${metaDiaria.progreso >= 100 ? 'bg-green-500' :
                  metaDiaria.progreso >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                style={{ width: `${Math.min(metaDiaria.progreso, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Pendientes: {metaDiaria.pendientes} ops
            </p>
          </div>

          {/* Velocidad */}
          <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-8 h-8 text-green-500" />
              <Activity className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase">Velocidad</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {velocidad.prendasPorHora} <span className="text-lg text-gray-500">ops/h</span>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Proyección: <span className={`font-bold ${velocidad.alcanzaraMeta ? 'text-green-600' : 'text-amber-600'}`}>
                {velocidad.proyeccion} ops
              </span>
            </p>
          </div>

          {/* Operarios */}
          <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-purple-500" />
              <span className="text-3xl font-bold text-purple-600">
                {metricasGlobales.operariosActivos}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase">Operarios Activos</h3>
            <p className="text-lg text-gray-700 mt-1">
              {metricasGlobales.operariosDisponibles} disponibles
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {metricasGlobales.operariosQueTrabajaronHoy} trabajaron hoy
            </p>
          </div>

          {/* Producción monetaria */}
          <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-amber-500">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-amber-500" />
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase">Producción Hoy</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ${metricasGlobales.totalMontoHoy.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Promedio: {metricasGlobales.eficienciaPromedio} ops/operario
            </p>
          </div>
        </div>

        {/* ALERTAS CRÍTICAS */}
        {alertasCriticas.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSeccion('alertas')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-200"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                <h2 className="text-lg font-bold text-gray-900">🚨 Alertas Críticas</h2>
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-semibold">
                  {alertasCriticas.length}
                </span>
              </div>
              {seccionesAbiertas.alertas ?
                <ChevronUp className="w-5 h-5 text-gray-400" /> :
                <ChevronDown className="w-5 h-5 text-gray-400" />
              }
            </button>

            {seccionesAbiertas.alertas && (
              <div className="p-4 space-y-3">
                {alertasCriticas.map((alerta, idx) => {
                  const config = {
                    critico: { bg: 'bg-red-50', border: 'border-red-500', icon: '🔴', text: 'text-red-800' },
                    urgente: { bg: 'bg-orange-50', border: 'border-orange-500', icon: '🟠', text: 'text-orange-800' },
                    atencion: { bg: 'bg-yellow-50', border: 'border-yellow-500', icon: '🟡', text: 'text-yellow-800' }
                  };
                  const c = config[alerta.nivel];

                  return (
                    <div key={idx} className={`${c.bg} border-l-4 ${c.border} p-4 rounded`}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{c.icon}</span>
                        <div className="flex-1">
                          <p className={`font-semibold ${c.text}`}>{alerta.mensaje}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Tipo: {alerta.tipo.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TABLA DE OPERARIOS EN LÍNEA */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSeccion('operarios')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-200"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-bold text-gray-900">👷 Operarios en Línea</h2>
              <span className="px-2 py-1 bg-gray-100 rounded text-sm font-semibold text-gray-700">
                {operariosFiltrados.length}
              </span>
            </div>
            {seccionesAbiertas.operarios ?
              <ChevronUp className="w-5 h-5 text-gray-400" /> :
              <ChevronDown className="w-5 h-5 text-gray-400" />
            }
          </button>

          {seccionesAbiertas.operarios && (
            <>
              {/* Filtros */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex gap-2">
                  <button
                    onClick={() => setFiltroOperarios('hoy')}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${filtroOperarios === 'hoy'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                      }`}
                  >
                    Hoy ({contadores.hoy})
                  </button>
                  <button
                    onClick={() => setFiltroOperarios('atrasados')}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${filtroOperarios === 'atrasados'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                      }`}
                  >
                    Más de 1 día ({contadores.atrasados})
                  </button>
                  <button
                    onClick={() => setFiltroOperarios('disponibles')}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${filtroOperarios === 'disponibles'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                      }`}
                  >
                    Disponibles ({contadores.disponibles})
                  </button>
                </div>
              </div>

              {/* Tabla */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Operario
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Operación Actual
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Avance
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setOrdenOperarios(prev => ({
                            campo: 'tiempoEnOperacion',
                            direccion: prev.campo === 'tiempoEnOperacion' && prev.direccion === 'asc' ? 'desc' : 'asc'
                          }));
                        }}
                      >
                        <div className="flex items-center gap-1">
                          Tiempo
                          {ordenOperarios.campo === 'tiempoEnOperacion' && (
                            <span className="text-gray-500">
                              {ordenOperarios.direccion === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Pendientes
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Completadas Hoy
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {operariosOrdenados.map(op => {
                      const estadoConfig = {
                        atascado: {
                          border: 'border-l-4 border-red-500',
                          bg: 'bg-red-50',
                          badge: 'bg-red-100 text-red-800',
                          icon: '🔴',
                          texto: 'Atascado'
                        },
                        trabajando: {
                          border: 'border-l-4 border-green-500',
                          bg: 'hover:bg-green-50',
                          badge: 'bg-green-100 text-green-800',
                          icon: '🟢',
                          texto: 'Trabajando'
                        },
                        finalizando: {
                          border: 'border-l-4 border-yellow-500',
                          bg: 'hover:bg-yellow-50',
                          badge: 'bg-yellow-100 text-yellow-800',
                          icon: '🟡',
                          texto: 'Finalizando'
                        },
                        disponible: {
                          border: 'border-l-4 border-gray-300',
                          bg: 'hover:bg-gray-50',
                          badge: 'bg-gray-100 text-gray-800',
                          icon: '⚪',
                          texto: 'Disponible'
                        }
                      };

                      const config = estadoConfig[op.estado];

                      return (
                        <tr key={op.id} className={`${config.border} ${config.bg} transition-colors`}>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-semibold text-gray-900">{op.nombre}</p>
                              <p className="text-xs text-gray-500">ID: {op.id}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-900 font-medium">
                              {op.operacionActual || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono font-semibold text-gray-900">
                              {op.avance || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-700 font-medium">
                              {op.tiempoEnOperacion || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-gray-900 text-lg">
                              {op.totalPendientes}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-green-600 text-lg">
                              {op.totalCompletadas}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${config.badge}`}>
                              <span className="text-base">{config.icon}</span>
                              {config.texto}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* ÓRDENES CRÍTICAS */}
        {ordenesCriticas.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSeccion('ordenes')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-200"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 animate-pulse" />
                <h2 className="text-lg font-bold text-gray-900">⚠️ Órdenes Críticas</h2>
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-semibold">
                  {ordenesCriticas.length}
                </span>
              </div>
              {seccionesAbiertas.ordenes ?
                <ChevronUp className="w-5 h-5 text-gray-400" /> :
                <ChevronDown className="w-5 h-5 text-gray-400" />
              }
            </button>

            {seccionesAbiertas.ordenes && (
              <div className="divide-y divide-gray-200">
                {ordenesCriticas.map(orden => {
                  const prenda = prendas.find(p => p.id === orden.prenda_id);

                  const criticidadConfig = {
                    critico: {
                      border: 'border-l-4 border-red-600',
                      bg: 'bg-red-50',
                      badge: 'bg-red-600 text-white',
                      icon: '🔴'
                    },
                    urgente: {
                      border: 'border-l-4 border-orange-500',
                      bg: 'bg-orange-50',
                      badge: 'bg-orange-600 text-white',
                      icon: '🟠'
                    },
                    atencion: {
                      border: 'border-l-4 border-yellow-500',
                      bg: 'bg-yellow-50',
                      badge: 'bg-yellow-600 text-white',
                      icon: '🟡'
                    }
                  };

                  const config = criticidadConfig[orden.criticidad];

                  return (
                    <div key={orden.id} className={`${config.border} ${config.bg} p-5 hover:bg-opacity-80 transition-colors`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{config.icon}</span>
                            <h3 className="font-bold text-gray-900 text-lg">{orden.numero_orden}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${config.badge}`}>
                              {orden.criticidad}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">
                            <span className="font-semibold">{prenda?.referencia}</span> • {orden.color} • {orden.talla}
                          </p>

                          {/* Barra de progreso */}
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Progreso de operaciones</span>
                              <span className="font-bold text-gray-900">
                                {orden.operacionesCompletadas}/{orden.totalOperaciones} operaciones
                              </span>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${orden.progreso >= 80 ? 'bg-green-500' :
                                  orden.progreso >= 50 ? 'bg-blue-500' :
                                    orden.progreso >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                style={{ width: `${orden.progreso}%` }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mt-3">
                            <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                              <Clock className="w-5 h-5 mx-auto text-gray-500 mb-1" />
                              <p className="text-xs text-gray-500">Días en proceso</p>
                              <p className="text-xl font-bold text-gray-900">{orden.diasDesdeEntrada}</p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                              <Package className="w-5 h-5 mx-auto text-gray-500 mb-1" />
                              <p className="text-xs text-gray-500">Cantidad</p>
                              <p className="text-xl font-bold text-gray-900">{orden.cantidad_total}</p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                              <TrendingUp className="w-5 h-5 mx-auto text-gray-500 mb-1" />
                              <p className="text-xs text-gray-500">Progreso</p>
                              <p className={`text-xl font-bold ${orden.progreso >= 80 ? 'text-green-600' :
                                orden.progreso >= 50 ? 'text-blue-600' :
                                  orden.progreso >= 30 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                {orden.progreso}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PANEL DE EFICIENCIA */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSeccion('metricas')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-200"
          >
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">📊 Métricas de Eficiencia</h2>
            </div>
            {seccionesAbiertas.metricas ?
              <ChevronUp className="w-5 h-5 text-gray-400" /> :
              <ChevronDown className="w-5 h-5 text-gray-400" />
            }
          </button>

          {seccionesAbiertas.metricas && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Eficiencia promedio */}
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                  <div className="w-16 h-16 mx-auto mb-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Eficiencia Promedio</p>
                  <p className="text-4xl font-bold text-blue-600 mb-1">
                    {metricasGlobales.eficienciaPromedio}
                  </p>
                  <p className="text-xs text-gray-500">ops por operario activo</p>
                </div>

                {/* Carga de trabajo */}
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
                  <div className="w-16 h-16 mx-auto mb-3 bg-purple-500 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Carga de Trabajo</p>
                  <p className="text-4xl font-bold text-purple-600 mb-1">
                    {Math.round((metricasGlobales.operariosActivos / empleados.length) * 100)}%
                  </p>
                  <p className="text-xs text-gray-500">capacidad utilizada</p>
                </div>

                {/* Producción monetaria */}
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                  <div className="w-16 h-16 mx-auto mb-3 bg-green-500 rounded-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Valor Producido Hoy</p>
                  <p className="text-4xl font-bold text-green-600 mb-1">
                    ${Math.round(metricasGlobales.totalMontoHoy).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">ingresos del día</p>
                </div>
              </div>

              {/* Resumen estadístico */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-3">📈 Resumen del Día</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Asignaciones del día</p>
                    <p className="text-2xl font-bold text-gray-900">{asignacionesHoy.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Completadas hoy</p>
                    <p className="text-2xl font-bold text-green-600">{asignacionesCompletadasHoy.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Pendientes totales</p>
                    <p className="text-2xl font-bold text-amber-600">{asignacionesPendientes.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Órdenes activas</p>
                    <p className="text-2xl font-bold text-blue-600">{ordenes.filter(o => o.activo).length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-gray-100 rounded-lg p-4 text-center text-sm text-gray-600">
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Sistema operativo
            </span>
            <span>•</span>
            <span>
              Última actualización: {new Date().toLocaleTimeString('es-CO')}
            </span>
            <span>•</span>
            <span>
              {empleados.length} operarios • {ordenes.length} órdenes • {asignaciones.length} asignaciones
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PantallaTallerAdmin;