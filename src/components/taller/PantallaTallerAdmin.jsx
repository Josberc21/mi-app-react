// src/components/taller/PantallaTallerAdmin.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Package, Zap, TrendingUp, Clock, AlertTriangle, 
  ChevronDown, ChevronUp, Activity, Target, CheckCircle 
} from 'lucide-react';

const PantallaTallerAdmin = ({ 
  empleados, 
  asignaciones, 
  operaciones, 
  prendas, 
  ordenes,
  mostrarInfo 
}) => {
  const [actualizar, setActualizar] = useState(0);
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({
    velocimetro: true,
    empleados: true,
    ordenes: true,
    operaciones: false,
    timeline: false
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

  // ========== CÁLCULOS CORE ==========
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const hoyStr = hoy.toISOString().split('T')[0];

  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);
  const ayerStr = ayer.toISOString().split('T')[0];

  const hace7Dias = new Date(hoy);
  hace7Dias.setDate(hace7Dias.getDate() - 7);

  // Asignaciones por período
  const asignacionesHoy = asignaciones.filter(a => {
    const fechaAsig = new Date(a.fecha);
    fechaAsig.setHours(0, 0, 0, 0);
    return fechaAsig.toISOString().split('T')[0] === hoyStr;
  });

  const asignacionesAyer = asignaciones.filter(a => {
    const fechaAsig = new Date(a.fecha);
    fechaAsig.setHours(0, 0, 0, 0);
    return fechaAsig.toISOString().split('T')[0] === ayerStr;
  });

  const asignacionesSemana = asignaciones.filter(a => {
    const fechaAsig = new Date(a.fecha);
    return fechaAsig >= hace7Dias;
  });

  const completadasHoy = asignacionesHoy.filter(a => a.completado).reduce((sum, a) => sum + a.cantidad, 0);
  const completadasAyer = asignacionesAyer.filter(a => a.completado).reduce((sum, a) => sum + a.cantidad, 0);
  const completadasSemana = asignacionesSemana.filter(a => a.completado).reduce((sum, a) => sum + a.cantidad, 0);

  const metaDiaria = 1000;
  const progresoMeta = Math.min((completadasHoy / metaDiaria) * 100, 100);

  // Velocidad (piezas por hora) - estimación basada en hora actual
  const horaActual = new Date().getHours();
  const horasTranscurridas = Math.max(1, horaActual - 7); // Asumiendo inicio a las 7am
  const velocidadActual = Math.round(completadasHoy / horasTranscurridas);

  // Proyección de meta
  const horasRestantes = Math.max(1, 18 - horaActual); // Hasta las 6pm
  const proyeccionFinal = completadasHoy + (velocidadActual * horasRestantes);
  const alcanzaraMeta = proyeccionFinal >= metaDiaria;

  // ========== MAPA DE CALOR DE EMPLEADOS ==========
  const empleadosConEstado = useMemo(() => {
    return empleados.map(emp => {
      const asignacionesEmpHoy = asignacionesHoy.filter(a => a.empleado_id === emp.id);
      const pendientes = asignacionesEmpHoy.filter(a => !a.completado);
      const completadas = asignacionesEmpHoy.filter(a => a.completado);

      const totalPendientes = pendientes.reduce((sum, a) => sum + a.cantidad, 0);
      const totalCompletadas = completadas.reduce((sum, a) => sum + a.cantidad, 0);
      const totalAsignado = totalPendientes + totalCompletadas;

      let estado = 'sin';
      let color = 'gray';
      let carga = 0;

      if (totalAsignado === 0) {
        estado = 'sin';
        color = 'gray';
      } else if (totalCompletadas === 0 && totalPendientes > 0) {
        estado = 'iniciando';
        color = 'blue';
        carga = 20;
      } else {
        const porcentajePendiente = (totalPendientes / totalAsignado) * 100;
        carga = Math.round(porcentajePendiente);

        if (porcentajePendiente > 80) {
          estado = 'alto';
          color = 'red';
        } else if (porcentajePendiente > 30) {
          estado = 'ok';
          color = 'green';
        } else {
          estado = 'bajo';
          color = 'yellow';
        }
      }

      return {
        ...emp,
        estado,
        color,
        carga,
        totalPendientes,
        totalCompletadas,
        totalAsignado
      };
    }).sort((a, b) => {
      // Ordenar: sin trabajo primero, luego por carga descendente
      if (a.estado === 'sin' && b.estado !== 'sin') return -1;
      if (a.estado !== 'sin' && b.estado === 'sin') return 1;
      return b.carga - a.carga;
    });
  }, [empleados, asignacionesHoy]);

  // ========== ÓRDENES CRÍTICAS ==========
  const ordenesUrgentes = useMemo(() => {
    return ordenes.map(orden => {
      const diasDesdeEntrada = Math.ceil((new Date() - new Date(orden.fecha_entrada)) / (1000 * 60 * 60 * 24));
      
      // Calcular progreso simple
      const operacionesRequeridas = operaciones.filter(op => op.prenda_id === orden.prenda_id);
      const totalOperaciones = operacionesRequeridas.length;
      
      let operacionesCompletadas = 0;
      operacionesRequeridas.forEach(op => {
        const asignacionesOp = asignaciones.filter(a => 
          a.orden_id === orden.id && 
          a.operacion_id === op.id && 
          a.completado
        );
        const completadas = asignacionesOp.reduce((sum, a) => sum + a.cantidad, 0);
        if (completadas >= orden.cantidad_total) operacionesCompletadas++;
      });

      const progreso = totalOperaciones > 0 ? Math.round((operacionesCompletadas / totalOperaciones) * 100) : 0;

      let criticidad = 'normal';
      let colorCriticidad = 'blue';

      if (diasDesdeEntrada > 15 && progreso < 50) {
        criticidad = 'critico';
        colorCriticidad = 'red';
      } else if (diasDesdeEntrada > 10 && progreso < 70) {
        criticidad = 'urgente';
        colorCriticidad = 'orange';
      } else if (diasDesdeEntrada > 7 && progreso < 80) {
        criticidad = 'atencion';
        colorCriticidad = 'yellow';
      }

      return {
        ...orden,
        diasDesdeEntrada,
        progreso,
        criticidad,
        colorCriticidad
      };
    })
    .filter(o => o.criticidad !== 'normal')
    .sort((a, b) => {
      const prioridad = { critico: 0, urgente: 1, atencion: 2 };
      return prioridad[a.criticidad] - prioridad[b.criticidad];
    })
    .slice(0, 5);
  }, [ordenes, operaciones, asignaciones]);

  // ========== OPERACIONES ACTIVAS ==========
  const operacionesActivas = useMemo(() => {
    return operaciones.map(op => {
      const empleadosTrabajando = new Set(
        asignacionesHoy
          .filter(a => a.operacion_id === op.id && !a.completado)
          .map(a => a.empleado_id)
      ).size;

      let estado = 'ok';
      let colorEstado = 'green';

      if (empleadosTrabajando === 0) {
        estado = 'sin';
        colorEstado = 'red';
      } else if (empleadosTrabajando <= 2) {
        estado = 'bajo';
        colorEstado = 'yellow';
      }

      return {
        nombre: op.nombre,
        empleadosTrabajando,
        estado,
        colorEstado
      };
    })
    .filter(o => o.estado !== 'ok')
    .sort((a, b) => {
      if (a.estado === 'sin' && b.estado !== 'sin') return -1;
      if (a.estado !== 'sin' && b.estado === 'sin') return 1;
      return 0;
    });
  }, [operaciones, asignacionesHoy]);

  // ========== TIMELINE (últimas 4 horas) ==========
  const timeline = useMemo(() => {
    const puntos = [];
    for (let i = 3; i >= 0; i--) {
      const hora = new Date();
      hora.setHours(hora.getHours() - i);
      const horaStr = hora.getHours();

      const completadasEnHora = asignacionesHoy.filter(a => {
        if (!a.completado || !a.fecha_terminado) return false;
        const fechaTerm = new Date(a.fecha_terminado);
        return fechaTerm.getHours() === horaStr;
      }).reduce((sum, a) => sum + a.cantidad, 0);

      puntos.push({
        hora: `${horaStr}:00`,
        piezas: completadasEnHora
      });
    }
    return puntos;
  }, [asignacionesHoy]);

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-gray-900">🎯 CONTROL DE TALLER</h1>
              <p className="text-gray-600 mt-1">
                {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
                {' • '}
                {new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Actualización automática</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">cada 30s</span>
              </div>
            </div>
          </div>
        </div>

        {/* VELOCÍMETRO DE PRODUCCIÓN */}
        <SeccionColapseble
          titulo="⚡ VELOCÍMETRO DE PRODUCCIÓN"
          icono={Zap}
          abierta={seccionesAbiertas.velocimetro}
          toggle={() => toggleSeccion('velocimetro')}
          colorHeader="bg-gradient-to-r from-blue-500 to-purple-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* HOY */}
            <TarjetaMetricaGrande
              titulo="HOY"
              valor={completadasHoy}
              subtitulo={`de ${metaDiaria} (${progresoMeta.toFixed(1)}%)`}
              color="blue"
              progreso={progresoMeta}
            />

            {/* AYER */}
            <TarjetaMetricaGrande
              titulo="AYER"
              valor={completadasAyer}
              subtitulo={completadasHoy > completadasAyer ? '↗️ Mejor que ayer' : '↘️ Menor que ayer'}
              color={completadasHoy > completadasAyer ? 'green' : 'orange'}
            />

            {/* ESTA SEMANA */}
            <TarjetaMetricaGrande
              titulo="ESTA SEMANA"
              valor={completadasSemana}
              subtitulo={`${Math.round(completadasSemana / 7)} pzs/día promedio`}
              color="purple"
            />

            {/* VELOCIDAD */}
            <TarjetaMetricaGrande
              titulo="VELOCIDAD ACTUAL"
              valor={`${velocidadActual}/h`}
              subtitulo={alcanzaraMeta ? `✅ Proyección: ${proyeccionFinal}` : `⚠️ Proyección: ${proyeccionFinal}`}
              color={alcanzaraMeta ? 'green' : 'red'}
            />
          </div>
        </SeccionColapseble>

        {/* MAPA DE CALOR DE EMPLEADOS */}
        <SeccionColapseble
          titulo="👥 MAPA DE CALOR - EMPLEADOS"
          icono={Users}
          abierta={seccionesAbiertas.empleados}
          toggle={() => toggleSeccion('empleados')}
          colorHeader="bg-gradient-to-r from-green-500 to-teal-600"
          badge={empleadosConEstado.filter(e => e.estado === 'sin').length}
          badgeText="sin trabajo"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {empleadosConEstado.map(emp => (
              <TarjetaEmpleado key={emp.id} empleado={emp} />
            ))}
          </div>
        </SeccionColapseble>

        {/* ÓRDENES URGENTES */}
        {ordenesUrgentes.length > 0 && (
          <SeccionColapseble
            titulo="🔥 ÓRDENES EN ZONA CRÍTICA"
            icono={AlertTriangle}
            abierta={seccionesAbiertas.ordenes}
            toggle={() => toggleSeccion('ordenes')}
            colorHeader="bg-gradient-to-r from-red-500 to-pink-600"
            badge={ordenesUrgentes.length}
          >
            <div className="space-y-3">
              {ordenesUrgentes.map(orden => (
                <TarjetaOrdenUrgente key={orden.id} orden={orden} prendas={prendas} />
              ))}
            </div>
          </SeccionColapseble>
        )}

        {/* OPERACIONES CON PROBLEMAS */}
        {operacionesActivas.length > 0 && (
          <SeccionColapseble
            titulo="⚠️ OPERACIONES CON ATENCIÓN"
            icono={Activity}
            abierta={seccionesAbiertas.operaciones}
            toggle={() => toggleSeccion('operaciones')}
            colorHeader="bg-gradient-to-r from-yellow-500 to-orange-600"
            badge={operacionesActivas.filter(o => o.estado === 'sin').length}
            badgeText="sin personal"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {operacionesActivas.map((op, idx) => (
                <TarjetaOperacion key={idx} operacion={op} />
              ))}
            </div>
          </SeccionColapseble>
        )}

        {/* TIMELINE */}
        <SeccionColapseble
          titulo="📈 TIMELINE DE PRODUCCIÓN (últimas 4 horas)"
          icono={TrendingUp}
          abierta={seccionesAbiertas.timeline}
          toggle={() => toggleSeccion('timeline')}
          colorHeader="bg-gradient-to-r from-indigo-500 to-blue-600"
        >
          <div className="flex items-end justify-around h-40 bg-white rounded-lg p-4">
            {timeline.map((punto, idx) => {
              const maxPiezas = Math.max(...timeline.map(p => p.piezas), 1);
              const altura = (punto.piezas / maxPiezas) * 100;
              
              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <span className="text-sm font-bold text-gray-700">{punto.piezas}</span>
                  <div
                    className="w-16 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all"
                    style={{ height: `${altura}%`, minHeight: '20px' }}
                  />
                  <span className="text-xs text-gray-600">{punto.hora}</span>
                </div>
              );
            })}
          </div>
        </SeccionColapseble>

      </div>
    </div>
  );
};

// ========== COMPONENTES AUXILIARES ==========

const SeccionColapseble = ({ titulo, icono: Icono, abierta, toggle, colorHeader, children, badge, badgeText }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    <button
      onClick={toggle}
      className={`w-full flex items-center justify-between p-5 text-white ${colorHeader} hover:opacity-90 transition-opacity`}
    >
      <div className="flex items-center gap-3">
        <Icono className="w-6 h-6" />
        <h2 className="text-xl font-bold">{titulo}</h2>
        {badge !== undefined && (
          <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-semibold">
            {badge} {badgeText || ''}
          </span>
        )}
      </div>
      {abierta ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
    </button>
    {abierta && <div className="p-5">{children}</div>}
  </div>
);

const TarjetaMetricaGrande = ({ titulo, valor, subtitulo, color, progreso }) => {
  const colores = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colores[color]} rounded-lg p-5 text-white shadow-lg`}>
      <p className="text-sm opacity-90 mb-1">{titulo}</p>
      <p className="text-4xl font-black mb-2">{valor}</p>
      <p className="text-xs opacity-80">{subtitulo}</p>
      {progreso !== undefined && (
        <div className="mt-3 bg-white bg-opacity-30 rounded-full h-2">
          <div
            className="bg-white h-2 rounded-full transition-all"
            style={{ width: `${Math.min(progreso, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};

const TarjetaEmpleado = ({ empleado }) => {
  const coloresFondo = {
    sin: 'bg-gray-100 border-gray-300',
    iniciando: 'bg-blue-50 border-blue-300',
    ok: 'bg-green-50 border-green-300',
    alto: 'bg-red-50 border-red-300',
    bajo: 'bg-yellow-50 border-yellow-300'
  };

  const iconos = {
    sin: '⚪',
    iniciando: '🔵',
    ok: '🟢',
    alto: '🔴',
    bajo: '🟡'
  };

  const textos = {
    sin: 'Sin trabajo hoy',
    iniciando: 'Iniciando...',
    ok: 'Trabajando OK',
    alto: 'Sobrecargado',
    bajo: 'Finalizando'
  };

  return (
    <div className={`${coloresFondo[empleado.estado]} border-2 rounded-lg p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-bold text-gray-900">ID {empleado.id}</p>
          <p className="text-lg font-semibold text-gray-800">{empleado.nombre}</p>
        </div>
        <span className="text-3xl">{iconos[empleado.estado]}</span>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">{textos[empleado.estado]}</p>
        
        {empleado.estado !== 'sin' && (
          <>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Pendientes: {empleado.totalPendientes}</span>
              <span>Completas: {empleado.totalCompletadas}</span>
            </div>
            
            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  empleado.estado === 'alto' ? 'bg-red-500' :
                  empleado.estado === 'ok' ? 'bg-green-500' :
                  'bg-yellow-500'
                }`}
                style={{ width: `${empleado.carga}%` }}
              />
            </div>
            <p className="text-xs text-right text-gray-600 font-semibold">{empleado.carga}% pendiente</p>
          </>
        )}
      </div>
    </div>
  );
};

const TarjetaOrdenUrgente = ({ orden, prendas }) => {
  const prenda = prendas.find(p => p.id === orden.prenda_id);
  
  const coloresCriticidad = {
    critico: 'bg-red-50 border-red-400',
    urgente: 'bg-orange-50 border-orange-400',
    atencion: 'bg-yellow-50 border-yellow-400'
  };

  const badgesCriticidad = {
    critico: 'bg-red-600 text-white',
    urgente: 'bg-orange-600 text-white',
    atencion: 'bg-yellow-600 text-white'
  };

  return (
    <div className={`${coloresCriticidad[orden.criticidad]} border-2 rounded-lg p-4`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-lg text-gray-900">{orden.numero_orden}</p>
          <p className="text-gray-700">{prenda?.referencia} • {orden.color}</p>
        </div>
        <span className={`${badgesCriticidad[orden.criticidad]} px-3 py-1 rounded-full text-xs font-bold uppercase`}>
          {orden.criticidad}
        </span>
      </div>
      
      <div className="mt-3 flex justify-between items-center">
        <span className="text-sm text-gray-600">🕐 {orden.diasDesdeEntrada} días</span>
        <div className="flex items-center gap-2">
          <div className="bg-gray-200 rounded-full h-2 w-24">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${orden.progreso}%` }}
            />
          </div>
          <span className="text-sm font-bold">{orden.progreso}%</span>
        </div>
      </div>
    </div>
  );
};

const TarjetaOperacion = ({ operacion }) => {
  const colores = {
    sin: 'bg-red-50 border-red-300',
    bajo: 'bg-yellow-50 border-yellow-300'
  };

  return (
    <div className={`${colores[operacion.estado]} border-2 rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-gray-900">{operacion.nombre}</p>
          <p className="text-sm text-gray-600 mt-1">
            {operacion.empleadosTrabajando === 0 
              ? '❌ Sin personal asignado' 
              : `⚠️ Solo ${operacion.empleadosTrabajando} empleado(s)`
            }
          </p>
        </div>
        <span className="text-3xl">
          {operacion.estado === 'sin' ? '🔴' : '🟡'}
        </span>
      </div>
    </div>
  );
};

export default PantallaTallerAdmin;