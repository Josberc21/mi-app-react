// src/components/taller/PantallaTallerTV.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Trophy, Target, Activity, X, Users, Scissors, Package } from "lucide-react";

const PantallaTallerTV = ({
  empleados = [],
  asignaciones = [],
  operaciones = [],
  prendas = [],
  metaDiaria = 1200,
  labelPreference = "prendas",
  rotationInterval = 10000,
  onSalir = null,
}) => {
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

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white flex flex-col items-center justify-center overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-20 backdrop-blur-sm"></div>

      {/* Botón de salir flotante */}
      {onSalir && (
        <button
          onClick={() => {
            onSalir();
            if (document.fullscreenElement) {
              document.exitFullscreen();
            }
          }}
          className="fixed top-2 right-2 md:top-4 md:right-4 z-50 p-2 md:p-3 bg-red-600 rounded-full hover:bg-red-700 shadow-2xl hover:scale-110 transition-all duration-300 flex items-center gap-2"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      )}

      <div className="relative z-10 w-full max-w-6xl px-3 md:px-6 py-4 md:py-8 text-center">
        <AnimatePresence mode="wait">
          {/* VISTA RANKING */}
          {vista === "ranking" && (
            <motion.div key="ranking" {...variantes}>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-8 flex items-center justify-center gap-2 md:gap-3">
                <Trophy className="w-6 h-6 md:w-10 md:h-10 text-yellow-400" />
                🏆 TOP 5 DEL DÍA
              </h1>
              <div className="space-y-3 md:space-y-4">
                {rankingHoy.length === 0 ? (
                  <p className="text-lg md:text-2xl opacity-70">No hay producción completada hoy</p>
                ) : (
                  rankingHoy.map((e, i) => (
                    <motion.div
                      key={e.id}
                      className="flex justify-between items-center bg-white bg-opacity-10 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-lg border-l-4"
                      style={{ borderColor: ['#FFD700', '#C0C0C0', '#CD7F32', '#4A90E2', '#9B59B6'][i] }}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15, type: "spring" }}
                    >
                      <div className="flex items-center gap-2 md:gap-4">
                        <span className="text-3xl md:text-5xl">
                          {['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]}
                        </span>
                        <div className="text-left">
                          <span className="font-bold text-lg md:text-2xl block">{e.nombre}</span>
                          <span className="text-sm md:text-lg opacity-75">ID: {e.id}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl md:text-4xl font-bold text-green-300 block">
                          {formatearNumero(e.prendas)} prendas
                        </span>
                        <span className="text-base md:text-xl text-yellow-300">
                          ${formatearNumero(e.monto)}
                        </span>
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
              <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-8 flex items-center justify-center gap-2 md:gap-3">
                <Target className="w-6 h-6 md:w-10 md:h-10 text-pink-400" />
                🎯 META DIARIA
              </h1>
              <div className="text-center">
                <div className="flex justify-center items-baseline gap-2 md:gap-4 mb-4 md:mb-6">
                  <motion.p 
                    className="text-4xl md:text-7xl font-black text-green-300"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    {formatearNumero(completadasHoy)}
                  </motion.p>
                  <p className="text-3xl md:text-5xl opacity-70">/ {formatearNumero(metaDiaria)}</p>
                </div>
                <p className="text-xl md:text-3xl mb-4 md:mb-8 opacity-90">
                  Progreso: {progresoMeta.toFixed(1)}%
                </p>
                <div className="w-full bg-white bg-opacity-20 h-8 md:h-12 rounded-full overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-8 md:h-12 rounded-full flex items-center justify-end pr-3 md:pr-6"
                    initial={{ width: 0 }}
                    animate={{ width: `${progresoMeta}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  >
                    <span className="text-base md:text-2xl font-bold">{Math.round(progresoMeta)}%</span>
                  </motion.div>
                </div>
                {progresoMeta >= 100 ? (
                  <motion.p 
                    className="text-3xl md:text-5xl mt-4 md:mt-8 font-bold"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    🎉 ¡META ALCANZADA! 🎉
                  </motion.p>
                ) : (
                  <p className="text-xl md:text-3xl mt-4 md:mt-8 opacity-75">
                    Faltan {formatearNumero(metaDiaria - completadasHoy)} prendas
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* VISTA TENDENCIA */}
          {vista === "tendencia" && (
            <motion.div key="tendencia" {...variantes}>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-8 flex items-center justify-center gap-2 md:gap-3">
                <Activity className="w-6 h-6 md:w-10 md:h-10 text-blue-300" />
                📊 ÚLTIMOS 7 DÍAS
              </h1>
              <div className="flex justify-center items-end h-60 md:h-80 gap-2 md:gap-4">
                {ultimos7Dias.map((dia, i) => {
                  const maxPrendas = Math.max(...ultimos7Dias.map(d => d.prendas), 1);
                  const altura = (dia.prendas / maxPrendas) * 100;
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <motion.div
                        className="text-xl md:text-3xl font-bold mb-1 md:mb-2 text-green-300"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        {dia.prendas}
                      </motion.div>
                      <motion.div
                        className="w-10 md:w-16 bg-gradient-to-t from-blue-500 to-purple-400 rounded-t-2xl"
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(altura, 10)}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                      />
                      <p className="text-base md:text-xl mt-1 md:mt-2 font-semibold">{dia.dia}</p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 md:mt-8 text-lg md:text-2xl opacity-80">
                Promedio: {formatearNumero(Math.round(ultimos7Dias.reduce((s, d) => s + d.prendas, 0) / 7))} prendas/día
              </p>
            </motion.div>
          )}

          {/* VISTA OPERACIONES */}
          {vista === "operaciones" && (
            <motion.div key="operaciones" {...variantes}>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-8 flex items-center justify-center gap-2 md:gap-3">
                <Scissors className="w-6 h-6 md:w-10 md:h-10 text-green-400" />
                ✂️ TOP OPERACIONES HOY
              </h1>
              {topOperaciones.length === 0 ? (
                <p className="text-lg md:text-2xl opacity-70">No hay operaciones completadas hoy</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {topOperaciones.map((op, i) => (
                    <motion.div
                      key={i}
                      className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-white bg-opacity-10 backdrop-blur-lg text-left border-l-4 border-purple-400"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-xl md:text-3xl mb-1 md:mb-2">{op.nombre}</p>
                          <p className="opacity-75 text-base md:text-xl">{op.prenda}</p>
                        </div>
                        <span className="text-2xl md:text-4xl font-black text-blue-300">
                          {op.cantidad}
                        </span>
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
              <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-8 flex items-center justify-center gap-2 md:gap-3">
                <Trophy className="w-6 h-6 md:w-10 md:h-10 text-yellow-400" />
                👑 EMPLEADO DEL MES
              </h1>
              {!empleadoMes ? (
                <p className="text-lg md:text-2xl opacity-70">Sin datos del mes actual</p>
              ) : (
                <div className="flex flex-col items-center">
                  <motion.div
                    className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-yellow-400 via-orange-500 to-yellow-600 rounded-full flex items-center justify-center text-5xl md:text-7xl shadow-2xl mb-4 md:mb-6"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 150 }}
                  >
                    🏆
                  </motion.div>
                  <motion.h2 
                    className="text-3xl md:text-5xl font-black text-yellow-300 mb-2 md:mb-4"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    {empleadoMes.nombre}
                  </motion.h2>
                  <p className="text-lg md:text-2xl opacity-80 mb-4 md:mb-8">ID: {empleadoMes.id}</p>
                  <div className="grid grid-cols-3 gap-3 md:gap-8 w-full">
                    <div className="text-center bg-white bg-opacity-10 rounded-xl md:rounded-2xl p-3 md:p-6">
                      <p className="text-3xl md:text-5xl font-black text-green-300">
                        {formatearNumero(empleadoMes.prendas)}
                      </p>
                      <p className="text-sm md:text-xl mt-1 md:mt-2 opacity-75">Prendas</p>
                    </div>
                    <div className="text-center bg-white bg-opacity-10 rounded-xl md:rounded-2xl p-3 md:p-6">
                      <p className="text-3xl md:text-5xl font-black text-blue-300">
                        {empleadoMes.operaciones}
                      </p>
                      <p className="text-sm md:text-xl mt-1 md:mt-2 opacity-75">Operaciones</p>
                    </div>
                    <div className="text-center bg-white bg-opacity-10 rounded-xl md:rounded-2xl p-3 md:p-6">
                      <p className="text-3xl md:text-5xl font-black text-yellow-300">
                        ${formatearNumero(empleadoMes.monto)}
                      </p>
                      <p className="text-sm md:text-xl mt-1 md:mt-2 opacity-75">Ganado</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* VISTA ASIGNACIONES PANTALLA 1 */}
          {vista === "asignaciones1" && (
            <motion.div key="asignaciones1" {...variantes}>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-8 flex items-center justify-center gap-2 md:gap-3">
                <Package className="w-6 h-6 md:w-10 md:h-10 text-cyan-400" />
                📋 ASIGNACIONES ACTIVAS (1/2)
              </h1>
              {asignacionesPantalla1.length === 0 ? (
                <p className="text-xl md:text-3xl opacity-70">No hay asignaciones pendientes</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                  {asignacionesPantalla1.map((asig, i) => (
                    <motion.div
                      key={asig.id}
                      className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl md:rounded-3xl p-4 md:p-8 text-left shadow-2xl border-4 border-white border-opacity-20"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex-1 w-full">
                          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                            <Users className="w-5 h-5 md:w-8 md:h-8 text-yellow-300" />
                            <span className="text-2xl md:text-4xl font-black">{asig.empleado}</span>
                            <span className="text-base md:text-2xl opacity-75">ID: {asig.empleado_id}</span>
                          </div>
                          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                            <Scissors className="w-5 h-5 md:w-7 md:h-7 text-green-300" />
                            <span className="text-xl md:text-3xl font-bold text-green-200">{asig.operacion}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 md:gap-4 mt-2 md:mt-4">
                            <div className="bg-white bg-opacity-10 rounded-lg md:rounded-xl p-2 md:p-4">
                              <p className="text-xs md:text-sm opacity-75 mb-1">Referencia</p>
                              <p className="text-base md:text-2xl font-bold">{asig.referencia}</p>
                            </div>
                            <div className="bg-white bg-opacity-10 rounded-lg md:rounded-xl p-2 md:p-4">
                              <p className="text-xs md:text-sm opacity-75 mb-1">Color</p>
                              <p className="text-base md:text-2xl font-bold">{asig.color}</p>
                            </div>
                            <div className="bg-white bg-opacity-10 rounded-lg md:rounded-xl p-2 md:p-4">
                              <p className="text-xs md:text-sm opacity-75 mb-1">Talla</p>
                              <p className="text-base md:text-2xl font-bold">{asig.talla}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right w-full md:w-auto md:ml-6">
                          <motion.div
                            className="bg-yellow-400 text-gray-900 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          >
                            <p className="text-4xl md:text-6xl font-black">{asig.cantidad}</p>
                            <p className="text-sm md:text-lg font-bold mt-1">PRENDAS</p>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* VISTA ASIGNACIONES PANTALLA 2 */}
          {vista === "asignaciones2" && (
            <motion.div key="asignaciones2" {...variantes}>
              <h1 className="text-5xl font-bold mb-8 flex items-center justify-center gap-3">
                <Package className="w-10 h-10 text-cyan-400" />
                📋 ASIGNACIONES ACTIVAS (2/2)
              </h1>
              {asignacionesPantalla2.length === 0 ? (
                <p className="text-3xl opacity-70">No hay más asignaciones pendientes</p>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {asignacionesPantalla2.map((asig, i) => (
                    <motion.div
                      key={asig.id}
                      className="bg-gradient-to-r from-purple-600 to-pink-700 rounded-3xl p-8 text-left shadow-2xl border-4 border-white border-opacity-20"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <Users className="w-8 h-8 text-yellow-300" />
                            <span className="text-4xl font-black">{asig.empleado}</span>
                            <span className="text-2xl opacity-75">ID: {asig.empleado_id}</span>
                          </div>
                          <div className="flex items-center gap-3 mb-4">
                            <Scissors className="w-7 h-7 text-green-300" />
                            <span className="text-3xl font-bold text-green-200">{asig.operacion}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <div className="bg-white bg-opacity-10 rounded-xl p-4">
                              <p className="text-sm opacity-75 mb-1">Referencia</p>
                              <p className="text-2xl font-bold">{asig.referencia}</p>
                            </div>
                            <div className="bg-white bg-opacity-10 rounded-xl p-4">
                              <p className="text-sm opacity-75 mb-1">Color</p>
                              <p className="text-2xl font-bold">{asig.color}</p>
                            </div>
                            <div className="bg-white bg-opacity-10 rounded-xl p-4">
                              <p className="text-sm opacity-75 mb-1">Talla</p>
                              <p className="text-2xl font-bold">{asig.talla}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-6">
                          <motion.div
                            className="bg-yellow-400 text-gray-900 rounded-2xl p-6 shadow-lg"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          >
                            <p className="text-6xl font-black">{asig.cantidad}</p>
                            <p className="text-lg font-bold mt-1">PIEZAS</p>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-10 text-sm opacity-70">
          Última actualización:{" "}
          {fechaActual.toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};

export default PantallaTallerTV;