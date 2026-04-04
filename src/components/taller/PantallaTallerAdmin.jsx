// src/components/taller/PantallaTallerAdmin.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock, TrendingUp, AlertCircle, Users, Package,
  Activity, ChevronDown, ChevronUp, Target, Zap,
  AlertTriangle, CheckCircle, ArrowUpDown, Hand, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { calcularDiasEntre } from '../../utils/dateUtils';
import { aprobarReporte, rechazarReporte } from '../../services/operarioService';

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
    reportes: true,
    operarios: true,
    ordenes: true,
    metricas: true,
    alertas: true,
  });
  const [accionReporte, setAccionReporte] = useState(null); // id del reporte en proceso

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

  // ========== REPORTES PENDIENTES DE OPERARIOS ==========
  const reportesPendientes = useMemo(() => {
    return asignaciones
      .filter(a => a.estado_reporte === 'pendiente')
      .map(a => {
        const emp = empleados.find(e => e.id === a.empleado_id);
        const op  = operaciones.find(o => o.id === a.operacion_id);
        const pr  = prendas.find(p => p.id === a.prenda_id);
        return { ...a, empleado_nombre: emp?.nombre || '—', operacion_nombre: op?.nombre || '—', operacion_costo: op?.costo || 0, prenda_ref: pr?.referencia || '—' };
      })
      .sort((a, b) => new Date(a.fecha_reporte) - new Date(b.fecha_reporte));
  }, [asignaciones, empleados, operaciones, prendas]);

  const handleAprobarReporte = async (rep) => {
    try {
      setAccionReporte(rep.id);
      await aprobarReporte(rep);
      mostrarExito(`Aprobado: ${rep.cantidad_reportada} pzs de ${rep.empleado_nombre}`);
    } catch (err) {
      mostrarError(err.message || 'Error al aprobar');
    } finally {
      setAccionReporte(null);
    }
  };

  const handleRechazarReporte = async (rep) => {
    try {
      setAccionReporte(rep.id);
      await rechazarReporte(rep.id);
      mostrarError(`Reporte rechazado. ${rep.empleado_nombre} será notificado.`);
    } catch (err) {
      mostrarError(err.message || 'Error al rechazar');
    } finally {
      setAccionReporte(null);
    }
  };

  // ========== RENDER ==========
  return (
    <div className="space-y-6 animate-slide-up">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Torre de Control — Taller</h1>
          <p className="text-slate-500 text-sm mt-0.5 capitalize">
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse inline-block" />
          <span className="font-mono">{new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          <span className="text-slate-300">· auto 30s</span>
        </div>
      </div>

      {/* ── REPORTES PENDIENTES DE OPERARIOS ── */}
      {reportesPendientes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleSeccion('reportes')}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-amber-100/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-amber-200 rounded-lg flex items-center justify-center">
                <Hand className="w-4 h-4 text-amber-700" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-amber-900">Operarios levantaron la mano</p>
                <p className="text-xs text-amber-600">{reportesPendientes.length} reporte{reportesPendientes.length !== 1 ? 's' : ''} esperando aprobación</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {reportesPendientes.length}
              </span>
              {seccionesAbiertas.reportes ? <ChevronUp className="w-4 h-4 text-amber-600" /> : <ChevronDown className="w-4 h-4 text-amber-600" />}
            </div>
          </button>

          {seccionesAbiertas.reportes && (
            <div className="border-t border-amber-200 divide-y divide-amber-100">
              {reportesPendientes.map(rep => (
                <div key={rep.id} className="px-5 py-4 flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-9 h-9 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-800 text-sm font-bold">{rep.empleado_nombre.charAt(0)}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900">{rep.empleado_nombre}</p>
                    <p className="text-xs text-slate-500 truncate">{rep.operacion_nombre} · {rep.prenda_ref}</p>
                    <p className="text-xs text-amber-700 font-semibold mt-0.5">
                      Reporta {rep.cantidad_reportada} de {rep.cantidad} piezas
                      <span className="text-slate-400 font-normal ml-2">
                        → ${(rep.operacion_costo * rep.cantidad_reportada).toLocaleString()}
                      </span>
                    </p>
                  </div>

                  {/* Hora del reporte */}
                  <div className="hidden sm:block text-right flex-shrink-0">
                    <p className="text-[11px] text-slate-400">
                      {rep.fecha_reporte
                        ? new Date(rep.fecha_reporte).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAprobarReporte(rep)}
                      disabled={accionReporte === rep.id}
                      title="Aprobar"
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                    >
                      {accionReporte === rep.id
                        ? <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        : <ThumbsUp className="w-3.5 h-3.5" />
                      }
                      <span className="hidden sm:inline">Aprobar</span>
                    </button>
                    <button
                      onClick={() => handleRechazarReporte(rep)}
                      disabled={accionReporte === rep.id}
                      title="Rechazar"
                      className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Rechazar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MÉTRICAS HERO */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Meta del día */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
              <Target className="w-4 h-4 text-brand-600" />
            </div>
            <span className={`text-2xl font-bold ${metaDiaria.progreso >= 100 ? 'text-emerald-600' : metaDiaria.progreso >= 50 ? 'text-brand-600' : 'text-amber-600'}`}>
              {metaDiaria.progreso.toFixed(0)}%
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Meta del Día</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{metaDiaria.completadas}/{metaDiaria.meta}</p>
          <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${metaDiaria.progreso >= 100 ? 'bg-emerald-500' : metaDiaria.progreso >= 50 ? 'bg-brand-500' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(metaDiaria.progreso, 100)}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-2">Pendientes: {metaDiaria.pendientes} ops</p>
        </div>

        {/* Velocidad */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-600" />
            </div>
            <Activity className="w-4 h-4 text-slate-300" />
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Velocidad</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{velocidad.prendasPorHora} <span className="text-sm font-normal text-slate-400">ops/h</span></p>
          <p className="text-xs text-slate-500 mt-2">
            Proyección: <span className={`font-semibold ${velocidad.alcanzaraMeta ? 'text-emerald-600' : 'text-amber-600'}`}>{velocidad.proyeccion} ops</span>
          </p>
        </div>

        {/* Operarios */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-purple-600">{metricasGlobales.operariosActivos}</span>
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Operarios Activos</p>
          <p className="text-lg font-semibold text-slate-700 mt-1">{metricasGlobales.operariosDisponibles} disponibles</p>
          <p className="text-xs text-slate-400 mt-2">{metricasGlobales.operariosQueTrabajaronHoy} trabajaron hoy</p>
        </div>

        {/* Producción monetaria */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <Package className="w-4 h-4 text-amber-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Producción Hoy</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">${metricasGlobales.totalMontoHoy.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-2">Promedio: {metricasGlobales.eficienciaPromedio} ops/operario</p>
        </div>
      </div>

      {/* ALERTAS CRÍTICAS */}
      {alertasCriticas.length > 0 && (
        <div className="card overflow-hidden">
          <button onClick={() => toggleSeccion('alertas')} className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
              <h2 className="text-sm font-semibold text-slate-800">Alertas Críticas</h2>
              <span className="badge-red">{alertasCriticas.length}</span>
            </div>
            {seccionesAbiertas.alertas ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          {seccionesAbiertas.alertas && (
            <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-2.5">
              {alertasCriticas.map((alerta, idx) => {
                const configs = {
                  critico:  { bg: 'bg-rose-50',   border: 'border-rose-200',   bar: 'bg-rose-500',   title: 'text-rose-900',   msg: 'text-rose-700'   },
                  urgente:  { bg: 'bg-orange-50',  border: 'border-orange-200', bar: 'bg-orange-500', title: 'text-orange-900', msg: 'text-orange-700' },
                  atencion: { bg: 'bg-amber-50',   border: 'border-amber-200',  bar: 'bg-amber-500',  title: 'text-amber-900',  msg: 'text-amber-700'  }
                };
                const c = configs[alerta.nivel] || configs.atencion;
                return (
                  <div key={idx} className={`relative flex items-start gap-3 px-4 py-3 rounded-xl border overflow-hidden ${c.bg} ${c.border}`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.bar}`} />
                    <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${c.bar.replace('bg-', 'text-')}`} />
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${c.title}`}>{alerta.mensaje}</p>
                      <p className={`text-xs mt-0.5 ${c.msg}`}>{alerta.tipo.replace('_', ' ')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TABLA DE OPERARIOS EN LÍNEA */}
      <div className="card overflow-hidden">
        <button onClick={() => toggleSeccion('operarios')} className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-800">Operarios en Línea</h2>
            <span className="badge-slate">{operariosFiltrados.length}</span>
          </div>
          {seccionesAbiertas.operarios ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {seccionesAbiertas.operarios && (
          <>
            {/* Filtros */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
              <div className="flex items-center gap-1 flex-wrap">
                <button onClick={() => setFiltroOperarios('hoy')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filtroOperarios === 'hoy' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
                  Hoy ({contadores.hoy})
                </button>
                <button onClick={() => setFiltroOperarios('atrasados')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filtroOperarios === 'atrasados' ? 'bg-rose-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
                  +1 día ({contadores.atrasados})
                </button>
                <button onClick={() => setFiltroOperarios('disponibles')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filtroOperarios === 'disponibles' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
                  Disponibles ({contadores.disponibles})
                </button>
                <button onClick={() => setFiltroOperarios('todos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filtroOperarios === 'todos' ? 'bg-slate-700 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
                  Todos
                </button>
              </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Operario</th>
                    <th>Operación Actual</th>
                    <th>Avance</th>
                    <th className="cursor-pointer hover:bg-slate-100"
                      onClick={() => setOrdenOperarios(prev => ({ campo: 'tiempoEnOperacion', direccion: prev.campo === 'tiempoEnOperacion' && prev.direccion === 'asc' ? 'desc' : 'asc' }))}>
                      <div className="flex items-center gap-1">
                        Tiempo <ArrowUpDown className="w-3 h-3" />
                        {ordenOperarios.campo === 'tiempoEnOperacion' && <span>{ordenOperarios.direccion === 'asc' ? '↑' : '↓'}</span>}
                      </div>
                    </th>
                    <th>Pendientes</th>
                    <th>Completadas hoy</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {operariosOrdenados.map(op => {
                    const estadoConfig = {
                      atascado:   { leftBorder: 'border-l-4 border-rose-500',    badgeCls: 'badge-red',   texto: 'Atascado'   },
                      trabajando: { leftBorder: 'border-l-4 border-emerald-500', badgeCls: 'badge-green', texto: 'Trabajando' },
                      finalizando:{ leftBorder: 'border-l-4 border-amber-400',   badgeCls: 'badge-amber', texto: 'Finalizando'},
                      disponible: { leftBorder: 'border-l-4 border-slate-200',   badgeCls: 'badge-slate', texto: 'Disponible' }
                    };
                    const config = estadoConfig[op.estado] || estadoConfig.disponible;

                    return (
                      <tr key={op.id} className={config.leftBorder}>
                        <td>
                          <div>
                            <p className="font-semibold text-slate-900">{op.nombre}</p>
                            <p className="text-xs text-slate-400">ID: {op.id}</p>
                          </div>
                        </td>
                        <td className="font-medium text-slate-700">{op.operacionActual || '—'}</td>
                        <td className="font-mono font-semibold text-slate-800">{op.avance || '—'}</td>
                        <td className="text-slate-600">{op.tiempoEnOperacion || '—'}</td>
                        <td className="font-bold text-slate-900">{op.totalPendientes}</td>
                        <td className="font-bold text-emerald-600">{op.totalCompletadas}</td>
                        <td><span className={`badge ${config.badgeCls}`}>{config.texto}</span></td>
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
        <div className="card overflow-hidden">
          <button onClick={() => toggleSeccion('ordenes')} className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />
              <h2 className="text-sm font-semibold text-slate-800">Órdenes Críticas</h2>
              <span className="badge-red">{ordenesCriticas.length}</span>
            </div>
            {seccionesAbiertas.ordenes ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          {seccionesAbiertas.ordenes && (
            <div className="border-t border-slate-100 divide-y divide-slate-100">
              {ordenesCriticas.map(orden => {
                const prenda = prendas.find(p => p.id === orden.prenda_id);
                const cfgs = {
                  critico:  { bar: 'bg-rose-500',   badge: 'badge-red'   },
                  urgente:  { bar: 'bg-orange-500',  badge: 'badge-amber' },
                  atencion: { bar: 'bg-amber-400',   badge: 'badge-amber' }
                };
                const c = cfgs[orden.criticidad] || cfgs.atencion;
                return (
                  <div key={orden.id} className="relative px-5 py-4">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.bar}`} />
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900">{orden.numero_orden}</h3>
                          <span className={`badge ${c.badge} capitalize`}>{orden.criticidad}</span>
                        </div>
                        <p className="text-sm text-slate-500">
                          <span className="font-medium text-slate-700">{prenda?.referencia}</span> · {orden.color} · {orden.talla}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 text-xs text-slate-400">
                        {orden.operacionesCompletadas}/{orden.totalOperaciones} ops
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                      <div className={`h-full rounded-full transition-all ${orden.progreso >= 80 ? 'bg-emerald-500' : orden.progreso >= 50 ? 'bg-brand-500' : orden.progreso >= 30 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${orden.progreso}%` }} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span><Clock className="w-3 h-3 inline mr-1" />{orden.diasDesdeEntrada} días</span>
                      <span><Package className="w-3 h-3 inline mr-1" />{orden.cantidad_total} pzs</span>
                      <span><TrendingUp className="w-3 h-3 inline mr-1" />{orden.progreso}% progreso</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PANEL DE EFICIENCIA */}
      <div className="card overflow-hidden">
        <button onClick={() => toggleSeccion('metricas')} className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-semibold text-slate-800">Métricas de Eficiencia</h2>
          </div>
          {seccionesAbiertas.metricas ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        {seccionesAbiertas.metricas && (
          <div className="border-t border-slate-100 p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <div className="text-center p-5 bg-blue-50 rounded-2xl">
                <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-xs text-slate-500 mb-1">Eficiencia Promedio</p>
                <p className="text-3xl font-bold text-blue-600">{metricasGlobales.eficienciaPromedio}</p>
                <p className="text-xs text-slate-400 mt-1">ops por operario activo</p>
              </div>
              <div className="text-center p-5 bg-brand-50 rounded-2xl">
                <div className="w-12 h-12 mx-auto mb-3 bg-brand-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-brand-600" />
                </div>
                <p className="text-xs text-slate-500 mb-1">Carga de Trabajo</p>
                <p className="text-3xl font-bold text-brand-600">{Math.round((metricasGlobales.operariosActivos / Math.max(empleados.length, 1)) * 100)}%</p>
                <p className="text-xs text-slate-400 mt-1">capacidad utilizada</p>
              </div>
              <div className="text-center p-5 bg-emerald-50 rounded-2xl">
                <div className="w-12 h-12 mx-auto mb-3 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-500 mb-1">Valor Producido Hoy</p>
                <p className="text-3xl font-bold text-emerald-600">${Math.round(metricasGlobales.totalMontoHoy).toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">ingresos del día</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="text-xs text-slate-400">Asignaciones hoy</p>
                <p className="text-xl font-bold text-slate-900">{asignacionesHoy.length}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Completadas hoy</p>
                <p className="text-xl font-bold text-emerald-600">{asignacionesCompletadasHoy.length}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Pendientes totales</p>
                <p className="text-xl font-bold text-amber-600">{asignacionesPendientes.length}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Órdenes activas</p>
                <p className="text-xl font-bold text-brand-600">{ordenes.filter(o => o.activo).length}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="text-center py-3 border-t border-slate-100">
        <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          Sistema operativo · {new Date().toLocaleTimeString('es-CO')} · {empleados.length} operarios · {ordenes.length} órdenes · {asignaciones.length} asignaciones
        </p>
      </div>
    </div>
  );
};

export default PantallaTallerAdmin;