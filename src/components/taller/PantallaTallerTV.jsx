// src/components/taller/PantallaTallerTV.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Trophy, Target, Activity, X, Users, Scissors, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PantallaTallerTV = ({
  empleados = [],
  asignaciones = [],
  operaciones = [],
  prendas = [],
  metaDiaria = 0,
  labelPreference = "prendas",
  rotationInterval = 10000,
  onSalir = null,
}) => {
  const navigate = useNavigate();
  const vistas = ["ranking", "meta", "tendencia", "operaciones", "empleadoMes", "asignaciones1", "asignaciones2"];
  const [vistaActual, setVistaActual] = useState(0);
  const [fechaActual, setFechaActual] = useState(new Date());

  // Rotación automática
  useEffect(() => {
    const rotacion = setInterval(() => {
      setVistaActual((prev) => (prev + 1) % vistas.length);
    }, rotationInterval);
    return () => clearInterval(rotacion);
  }, [rotationInterval, vistas.length]);

  // Refresco de fecha
  useEffect(() => {
    const reloj = setInterval(() => setFechaActual(new Date()), 30000);
    return () => clearInterval(reloj);
  }, []);

  // Normalizar fechas para comparación
  const normalizarFecha = (fecha) => {
    if (!fecha) return null;
    const match = fecha.toString().match(/(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
  };

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const hoyStr = hoy.toISOString().split('T')[0];

  // Asignaciones completadas HOY
  const asignacionesHoy = asignaciones.filter(a => {
    if (!a.completado || !a.fecha_terminado) return false;
    const fechaTerm = normalizarFecha(a.fecha_terminado);
    return fechaTerm === hoyStr;
  });

  // Completadas hoy (para meta)
  const completadasHoy = asignacionesHoy.reduce((sum, a) => sum + Number(a.cantidad || 0), 0);
  const progresoMeta = Math.min((completadasHoy / metaDiaria) * 100, 100);

  // Ranking de empleados HOY
  const rankingHoy = empleados.map(emp => {
    const asigs = asignacionesHoy.filter(a => Number(a.empleado_id) === Number(emp.id));
    const prendas = asigs.reduce((sum, a) => sum + Number(a.cantidad || 0), 0);
    const monto = asigs.reduce((sum, a) => sum + Number(a.monto || 0), 0);
    return { ...emp, prendas, monto, operaciones: asigs.length };
  }).filter(e => e.prendas > 0)
    .sort((a, b) => b.prendas - a.prendas)
    .slice(0, 5);

  // Últimos 7 días
  const ultimos7Dias = [];
  for (let i = 6; i >= 0; i--) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - i);
    fecha.setHours(0, 0, 0, 0);
    const fechaStr = fecha.toISOString().split('T')[0];

    const asigsDia = asignaciones.filter(a => {
      if (!a.completado || !a.fecha_terminado) return false;
      const fechaTerm = normalizarFecha(a.fecha_terminado);
      return fechaTerm === fechaStr;
    });

    const prendas = asigsDia.reduce((sum, a) => sum + Number(a.cantidad || 0), 0);
    ultimos7Dias.push({
      dia: fecha.toLocaleDateString('es-CO', { weekday: 'short' }),
      prendas
    });
  }

  // Top operaciones del día
  const topOperaciones = operaciones.map(op => {
    const cantidad = asignaciones.filter(a => {
      if (!a.completado || !a.fecha_terminado) return false;
      const fechaTerm = normalizarFecha(a.fecha_terminado);
      return fechaTerm === hoyStr && Number(a.operacion_id) === Number(op.id);
    }).reduce((s, a) => s + Number(a.cantidad || 0), 0);

    const prenda = prendas.find(p => Number(p.id) === Number(op.prenda_id));
    return { nombre: op.nombre, prenda: prenda?.referencia || '', cantidad };
  }).filter(o => o.cantidad > 0)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 6);

  // Empleado del mes
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const inicioMesStr = inicioMes.toISOString().split('T')[0];

  const asignacionesMes = asignaciones.filter(a => {
    if (!a.completado || !a.fecha_terminado) return false;
    const fechaTerm = normalizarFecha(a.fecha_terminado);
    return fechaTerm && fechaTerm >= inicioMesStr;
  });

  const empleadoMes = empleados.map(emp => {
    const asigs = asignacionesMes.filter(a => Number(a.empleado_id) === Number(emp.id));
    const prendas = asigs.reduce((sum, a) => sum + Number(a.cantidad || 0), 0);
    const monto = asigs.reduce((sum, a) => sum + Number(a.monto || 0), 0);
    return { ...emp, prendas, monto, operaciones: asigs.length };
  }).filter(e => e.prendas > 0)
    .sort((a, b) => b.prendas - a.prendas)[0];

  // Asignaciones activas (NO completadas) para mostrar en TV
  const asignacionesActivas = asignaciones
    .filter(a => !a.completado)
    .map(a => {
      const emp = empleados.find(e => Number(e.id) === Number(a.empleado_id));
      const op = operaciones.find(o => Number(o.id) === Number(a.operacion_id));
      const prenda = op ? prendas.find(p => Number(p.id) === Number(op.prenda_id)) : null;

      return {
        id: a.id,
        empleado: emp?.nombre || 'Sin asignar',
        operacion: op?.nombre || 'Sin operación',
        referencia: prenda?.referencia || 'N/A',
        color: a.color || 'N/A',
        talla: a.talla || 'N/A',
        cantidad: a.cantidad || 0,
        empleado_id: a.empleado_id
      };
    });

  // Dividir en 2 pantallas (mitad cada una)
  const mitad = Math.ceil(asignacionesActivas.length / 2);
  const asignacionesPantalla1 = asignacionesActivas.slice(0, mitad);
  const asignacionesPantalla2 = asignacionesActivas.slice(mitad);

  const vista = vistas[vistaActual];

  const variantes = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5 } },
  };

  const formatearNumero = (num) =>
    num?.toLocaleString("es-CO", { minimumFractionDigits: 0 }) ?? "0";

  // 🎯 ASIGNACIONES AGRUPADAS POR OPERARIO (movido fuera del JSX)
  const asignacionesPorOperario = empleados.map(emp => {
    const asigsPendientes = asignaciones
      .filter(a => !a.completado && Number(a.empleado_id) === Number(emp.id))
      .map(a => {
        const op = operaciones.find(o => Number(o.id) === Number(a.operacion_id));
        const prenda = op ? prendas.find(p => Number(p.id) === Number(op.prenda_id)) : null;
        return {
          id: a.id,
          operacion: op?.nombre || 'Sin operación',
          referencia: prenda?.referencia || 'N/A',
          color: a.color || 'N/A',
          talla: a.talla || 'N/A',
          cantidad: a.cantidad || 0
        };
      });

    return {
      empleado_id: emp.id,
      empleado_nombre: emp.nombre,
      asignaciones: asigsPendientes,
      totalPendiente: asigsPendientes.reduce((sum, a) => sum + a.cantidad, 0)
    };
  }).filter(e => e.asignaciones.length > 0)
    .sort((a, b) => b.totalPendiente - a.totalPendiente);

  // Dividir operarios en 2 pantallas
  const mitadOperarios = Math.ceil(asignacionesPorOperario.length / 2);
  const operariosPantalla1 = asignacionesPorOperario.slice(0, mitadOperarios);
  const operariosPantalla2 = asignacionesPorOperario.slice(mitadOperarios);

  // Helper: renderiza el bloque de asignaciones por operario (shared between pantalla1 y pantalla2)
  const renderOperarioCard = (operario, idx) => (
    <motion.div
      key={operario.empleado_id}
      className="bg-white/[0.06] border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 text-left backdrop-blur-sm"
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.08, type: "spring", stiffness: 180 }}
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-600/40 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-brand-300" />
          </div>
          <span className="text-xl md:text-3xl font-black tracking-tight">{operario.empleado_nombre}</span>
        </div>
        <div className="bg-amber-400 text-slate-900 rounded-xl px-3 md:px-4 py-1.5 md:py-2 text-center">
          <p className="text-xl md:text-3xl font-black leading-none">{operario.totalPendiente}</p>
          <p className="text-xs font-bold uppercase tracking-wider">total</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {operario.asignaciones.map((asig) => (
          <div key={asig.id} className="flex items-center justify-between gap-3 bg-white/5 rounded-xl p-3 md:p-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Scissors className="w-4 h-4 md:w-5 md:h-5 text-emerald-400 flex-shrink-0" />
                <p className="text-lg md:text-2xl font-black text-white leading-tight truncate">{asig.operacion}</p>
              </div>
              <p className="text-xs md:text-sm text-white/50 ml-6">{asig.referencia}</p>
              <div className="flex gap-2 mt-2 ml-6">
                <span className="text-xs md:text-sm font-semibold bg-white/10 rounded-lg px-2 py-0.5">T. {asig.talla}</span>
                <span className="text-xs md:text-sm font-semibold bg-white/10 rounded-lg px-2 py-0.5">{asig.color}</span>
              </div>
            </div>
            <div className="bg-brand-500 rounded-xl px-3 md:px-4 py-2 md:py-3 flex-shrink-0">
              <p className="text-2xl md:text-4xl font-black leading-none text-center">{asig.cantidad}</p>
              <p className="text-xs text-white/70 text-center">pzs</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="w-full min-h-screen bg-sidebar-bg text-white flex flex-col items-center justify-center overflow-hidden relative">
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />

      {/* Botón de salir flotante */}
      <button
        onClick={() => {
          if (onSalir) { onSalir(); } else { navigate('/dashboard'); }
          if (document.fullscreenElement) document.exitFullscreen();
        }}
        className="fixed top-3 right-3 md:top-5 md:right-5 z-50 w-10 h-10 bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center justify-center shadow-2xl transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative z-10 w-full max-w-6xl px-4 md:px-8 py-6 md:py-10 text-center">
        <AnimatePresence mode="wait">
          {/* VISTA RANKING */}
          {vista === "ranking" && (
            <motion.div key="ranking" {...variantes}>
              <div className="flex items-center justify-center gap-3 mb-6 md:mb-10">
                <Trophy className="w-8 h-8 md:w-12 md:h-12 text-amber-400" />
                <h1 className="text-3xl md:text-5xl font-black tracking-tight">TOP 5 DEL DÍA</h1>
              </div>
              <div className="space-y-3 md:space-y-4">
                {rankingHoy.length === 0 ? (
                  <p className="text-lg md:text-2xl text-white/50">No hay producción completada hoy</p>
                ) : (
                  rankingHoy.map((e, i) => (
                    <motion.div
                      key={e.id}
                      className="flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 backdrop-blur-sm"
                      style={{ borderLeftWidth: '4px', borderLeftColor: ['#f59e0b', '#94a3b8', '#f97316', '#4f46e5', '#8b5cf6'][i] }}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.12, type: "spring" }}
                    >
                      <div className="flex items-center gap-3 md:gap-5">
                        <span className="text-3xl md:text-5xl font-black" style={{ color: ['#f59e0b','#94a3b8','#f97316','#4f46e5','#8b5cf6'][i] }}>
                          {i + 1}
                        </span>
                        <div className="text-left">
                          <span className="font-black text-lg md:text-3xl block">{e.nombre}</span>
                          <span className="text-xs md:text-base text-white/50">ID {e.id}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl md:text-4xl font-black text-emerald-400 block">{formatearNumero(e.prendas)}</span>
                        <span className="text-sm md:text-lg text-amber-400">${formatearNumero(e.monto)}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* VISTA META */}
          {vista === "meta" && (
            <motion.div key="meta" {...variantes}>
              <div className="flex items-center justify-center gap-3 mb-6 md:mb-10">
                <Target className="w-8 h-8 md:w-12 md:h-12 text-brand-400" />
                <h1 className="text-3xl md:text-5xl font-black tracking-tight">META DIARIA</h1>
              </div>
              <div className="text-center">
                <div className="flex justify-center items-baseline gap-3 md:gap-5 mb-4 md:mb-6">
                  <motion.p className="text-5xl md:text-8xl font-black text-emerald-400"
                    animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                    {formatearNumero(completadasHoy)}
                  </motion.p>
                  <p className="text-3xl md:text-5xl text-white/40">/ {formatearNumero(metaDiaria)}</p>
                </div>
                <p className="text-xl md:text-3xl mb-6 md:mb-10 text-white/70">{progresoMeta.toFixed(1)}% completado</p>
                <div className="w-full bg-white/10 h-8 md:h-14 rounded-full overflow-hidden border border-white/10">
                  <motion.div
                    className="bg-emerald-500 h-full rounded-full flex items-center justify-end pr-4 md:pr-6"
                    initial={{ width: 0 }}
                    animate={{ width: `${progresoMeta}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  >
                    {progresoMeta > 10 && <span className="text-base md:text-2xl font-bold">{Math.round(progresoMeta)}%</span>}
                  </motion.div>
                </div>
                {progresoMeta >= 100 ? (
                  <motion.p className="text-3xl md:text-5xl mt-8 font-black text-emerald-400"
                    animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                    META ALCANZADA
                  </motion.p>
                ) : (
                  <p className="text-xl md:text-3xl mt-8 text-white/60">
                    Faltan {formatearNumero(metaDiaria - completadasHoy)} prendas
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* VISTA TENDENCIA */}
          {vista === "tendencia" && (
            <motion.div key="tendencia" {...variantes}>
              <div className="flex items-center justify-center gap-3 mb-6 md:mb-10">
                <TrendingUp className="w-8 h-8 md:w-12 md:h-12 text-brand-400" />
                <h1 className="text-3xl md:text-5xl font-black tracking-tight">ÚLTIMOS 7 DÍAS</h1>
              </div>
              <div className="flex justify-center items-end h-56 md:h-80 gap-2 md:gap-5">
                {ultimos7Dias.map((dia, i) => {
                  const maxPrendas = Math.max(...ultimos7Dias.map(d => d.prendas), 1);
                  const altura = (dia.prendas / maxPrendas) * 100;
                  return (
                    <div key={i} className="flex flex-col items-center flex-1">
                      <motion.p className="text-lg md:text-3xl font-bold mb-1 text-emerald-400"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}>
                        {dia.prendas}
                      </motion.p>
                      <motion.div className="w-full bg-brand-600 rounded-t-xl"
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(altura, 8)}%` }}
                        transition={{ duration: 0.7, delay: i * 0.08 }} />
                      <p className="text-sm md:text-xl mt-2 font-semibold capitalize text-white/70">{dia.dia}</p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-6 md:mt-8 text-lg md:text-2xl text-white/60">
                Promedio: <span className="text-white font-bold">{formatearNumero(Math.round(ultimos7Dias.reduce((s, d) => s + d.prendas, 0) / 7))}</span> prendas/día
              </p>
            </motion.div>
          )}

          {/* VISTA OPERACIONES */}
          {vista === "operaciones" && (
            <motion.div key="operaciones" {...variantes}>
              <div className="flex items-center justify-center gap-3 mb-6 md:mb-10">
                <Scissors className="w-8 h-8 md:w-12 md:h-12 text-brand-400" />
                <h1 className="text-3xl md:text-5xl font-black tracking-tight">TOP OPERACIONES HOY</h1>
              </div>
              {topOperaciones.length === 0 ? (
                <p className="text-lg md:text-2xl text-white/50">No hay operaciones completadas hoy</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-left">
                  {topOperaciones.map((op, i) => (
                    <motion.div key={i}
                      className="p-5 md:p-7 rounded-2xl bg-white/5 border-l-4 border-brand-500 backdrop-blur-sm"
                      initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-black text-xl md:text-3xl mb-1">{op.nombre}</p>
                          <p className="text-white/50 text-sm md:text-lg">{op.prenda}</p>
                        </div>
                        <span className="text-3xl md:text-5xl font-black text-brand-400 ml-4">{op.cantidad}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* VISTA EMPLEADO DEL MES */}
          {vista === "empleadoMes" && (
            <motion.div key="empleadoMes" {...variantes}>
              <div className="flex items-center justify-center gap-3 mb-6 md:mb-10">
                <Trophy className="w-8 h-8 md:w-12 md:h-12 text-amber-400" />
                <h1 className="text-3xl md:text-5xl font-black tracking-tight">EMPLEADO DEL MES</h1>
              </div>
              {!empleadoMes ? (
                <p className="text-lg md:text-2xl text-white/50">Sin datos del mes actual</p>
              ) : (
                <div className="flex flex-col items-center">
                  <motion.div
                    className="w-28 h-28 md:w-44 md:h-44 bg-amber-500/20 border-4 border-amber-400 rounded-full flex items-center justify-center text-4xl md:text-6xl shadow-2xl mb-5 md:mb-8 font-black text-amber-400"
                    initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 160 }}>
                    {empleadoMes.nombre?.charAt(0)?.toUpperCase()}
                  </motion.div>
                  <motion.h2 className="text-3xl md:text-6xl font-black text-amber-400 mb-2 md:mb-4 tracking-tight"
                    animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                    {empleadoMes.nombre}
                  </motion.h2>
                  <p className="text-base md:text-xl text-white/50 mb-6 md:mb-10">ID {empleadoMes.id}</p>
                  <div className="grid grid-cols-3 gap-4 md:gap-8 w-full">
                    <div className="text-center bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6">
                      <p className="text-3xl md:text-5xl font-black text-emerald-400">{formatearNumero(empleadoMes.prendas)}</p>
                      <p className="text-sm md:text-lg mt-2 text-white/50">Prendas</p>
                    </div>
                    <div className="text-center bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6">
                      <p className="text-3xl md:text-5xl font-black text-brand-400">{empleadoMes.operaciones}</p>
                      <p className="text-sm md:text-lg mt-2 text-white/50">Operaciones</p>
                    </div>
                    <div className="text-center bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6">
                      <p className="text-3xl md:text-5xl font-black text-amber-400">${formatearNumero(empleadoMes.monto)}</p>
                      <p className="text-sm md:text-lg mt-2 text-white/50">Ganado</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* VISTA ASIGNACIONES PANTALLA 1 */}
          {vista === "asignaciones1" && (
            <motion.div key="asignaciones1" {...variantes}>
              <div className="flex items-center justify-center gap-3 mb-6 md:mb-8">
                <Package className="w-7 h-7 md:w-10 md:h-10 text-brand-400" />
                <h1 className="text-2xl md:text-4xl font-black tracking-tight">ASIGNACIONES ACTIVAS (1/2)</h1>
              </div>
              {operariosPantalla1.length === 0 ? (
                <p className="text-xl md:text-3xl text-white/50">No hay asignaciones pendientes</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                  {operariosPantalla1.map((operario, idx) => renderOperarioCard(operario, idx))}
                </div>
              )}
            </motion.div>
          )}

          {/* VISTA ASIGNACIONES PANTALLA 2 */}
          {vista === "asignaciones2" && (
            <motion.div key="asignaciones2" {...variantes}>
              <div className="flex items-center justify-center gap-3 mb-6 md:mb-8">
                <Package className="w-7 h-7 md:w-10 md:h-10 text-brand-400" />
                <h1 className="text-2xl md:text-4xl font-black tracking-tight">ASIGNACIONES ACTIVAS (2/2)</h1>
              </div>
              {operariosPantalla2.length === 0 ? (
                <p className="text-xl md:text-3xl text-white/50">No hay más asignaciones pendientes</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                  {operariosPantalla2.map((operario, idx) => renderOperarioCard(operario, idx))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-8 text-xs text-white/30">
          {fechaActual.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })} · auto-refresh 30s
        </p>
      </div>
    </div>
  );
};

export default PantallaTallerTV;
