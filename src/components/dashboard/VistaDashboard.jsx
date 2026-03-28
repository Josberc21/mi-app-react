// src/components/dashboard/VistaDashboard.jsx
import React, { useMemo, useState } from 'react';
import {
  User, Package, Clock, DollarSign, AlertTriangle, TrendingUp,
  TrendingDown, Activity, Zap, Target, Award, BarChart3,
  Calendar, ArrowUpRight, ArrowDownRight, Minus, Brain, ChevronDown
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
  ComposedChart, Scatter, Cell
} from 'recharts';
import TarjetaAlerta from './TarjetaAlerta';
import TarjetaMetricaComparativa from './TarjetaMetricaComparativa';
import SelectorPeriodo from './SelectorPeriodo';
import PanelCuellosBottella from './PanelCuellosBottella';
import { calcularDiasEntre } from '../../utils/dateUtils';
import { formatearMoneda } from '../../utils/formatUtils';
import {
  PERIODOS,
  obtenerRangoPeriodo,
  obtenerPeriodoAnterior,
  fechaEnRango,
  generarDiasEnRango,
  calcularCambio
} from '../../utils/timeUtils';

const VistaDashboard = ({
  empleados,
  asignaciones,
  operaciones,
  prendas,
  ordenes,
  remisiones,
  estadisticasDashboard,
  calcularNominaEmpleado,
  calcularProgresoOrden
}) => {
  const [periodoActual, setPeriodoActual] = useState(PERIODOS.ULTIMOS_30_DIAS);
  const [alertasExpandidas, setAlertasExpandidas] = useState(true);
  const [vistaComparativa, setVistaComparativa] = useState('metricas');

  // ============================================
  // RANGOS DE TIEMPO
  // ============================================
  const rangoActual = useMemo(() => obtenerRangoPeriodo(periodoActual), [periodoActual]);
  const rangoAnterior = useMemo(() => obtenerPeriodoAnterior(periodoActual), [periodoActual]);

  // ============================================
  // FILTRADO DE DATOS POR PERÍODO
  // ============================================
  const datosPeriodo = useMemo(() => {
    const asignacionesActuales = asignaciones.filter(a =>
      fechaEnRango(a.fecha, rangoActual)
    );
    const asignacionesAnteriores = asignaciones.filter(a =>
      fechaEnRango(a.fecha, rangoAnterior)
    );

    const ordenesActuales = ordenes.filter(o =>
      fechaEnRango(o.fecha_entrada, rangoActual)
    );
    const ordenesAnteriores = ordenes.filter(o =>
      fechaEnRango(o.fecha_entrada, rangoAnterior)
    );

    const remisionesActuales = remisiones.filter(r =>
      fechaEnRango(r.fecha_remision, rangoActual)
    );
    const remisionesAnteriores = remisiones.filter(r =>
      fechaEnRango(r.fecha_remision, rangoAnterior)
    );

    return {
      asignacionesActuales,
      asignacionesAnteriores,
      ordenesActuales,
      ordenesAnteriores,
      remisionesActuales,
      remisionesAnteriores
    };
  }, [asignaciones, ordenes, remisiones, rangoActual, rangoAnterior]);

  // ============================================
  // MÉTRICAS COMPARATIVAS PRINCIPALES
  // ============================================
  const metricas = useMemo(() => {
    const {
      asignacionesActuales,
      asignacionesAnteriores,
      ordenesActuales,
      ordenesAnteriores,
      remisionesActuales,
      remisionesAnteriores
    } = datosPeriodo;

    // 1. PRODUCTIVIDAD (Piezas completadas)
    const piezasCompletadasActual = asignacionesActuales
      .filter(a => a.completado)
      .reduce((sum, a) => sum + (a.cantidad || 0), 0);

    const piezasCompletadasAnterior = asignacionesAnteriores
      .filter(a => a.completado)
      .reduce((sum, a) => sum + (a.cantidad || 0), 0);

    // 2. EFICIENCIA (% de completado)
    const totalAsignacionesActual = asignacionesActuales.length;
    const completadasActual = asignacionesActuales.filter(a => a.completado).length;
    const eficienciaActual = totalAsignacionesActual > 0
      ? (completadasActual / totalAsignacionesActual) * 100
      : 0;

    const totalAsignacionesAnterior = asignacionesAnteriores.length;
    const completadasAnterior = asignacionesAnteriores.filter(a => a.completado).length;
    const eficienciaAnterior = totalAsignacionesAnterior > 0
      ? (completadasAnterior / totalAsignacionesAnterior) * 100
      : 0;

    // 3. NÓMINA TOTAL
    const nominaActual = asignacionesActuales
      .filter(a => a.completado)
      .reduce((sum, a) => sum + parseFloat(a.monto || 0), 0);

    const nominaAnterior = asignacionesAnteriores
      .filter(a => a.completado)
      .reduce((sum, a) => sum + parseFloat(a.monto || 0), 0);

    // 4. ÓRDENES PROCESADAS
    const ordenesProcesamActual = ordenesActuales.length;
    const ordenesProcesamAnterior = ordenesAnteriores.length;

    // 5. TIEMPO PROMEDIO DE ORDEN (días)
    const tiempoPromedioActual = ordenesActuales.length > 0
      ? ordenesActuales
        .map(o => calcularDiasEntre(o.fecha_entrada, new Date()))
        .reduce((a, b) => a + b, 0) / ordenesActuales.length
      : 0;

    const tiempoPromedioAnterior = ordenesAnteriores.length > 0
      ? ordenesAnteriores
        .map(o => calcularDiasEntre(o.fecha_entrada, new Date()))
        .reduce((a, b) => a + b, 0) / ordenesAnteriores.length
      : 0;

    // 6. PRODUCTIVIDAD POR DÍA
    const diasPeriodo = Math.ceil((rangoActual.fin - rangoActual.inicio) / (1000 * 60 * 60 * 24)) + 1;
    const productividadDiariaActual = piezasCompletadasActual / diasPeriodo;
    const productividadDiariaAnterior = piezasCompletadasAnterior / diasPeriodo;

    // 7. EMPLEADOS ACTIVOS (con al menos 1 asignación completada)
    const empleadosActivosActual = new Set(
      asignacionesActuales.filter(a => a.completado).map(a => a.empleado_id)
    ).size;

    const empleadosActivosAnterior = new Set(
      asignacionesAnteriores.filter(a => a.completado).map(a => a.empleado_id)
    ).size;

    // 8. UNIDADES DESPACHADAS
    const unidadesDespActual = remisionesActuales
      .reduce((sum, r) => sum + (r.cantidad_despachada || 0), 0);

    const unidadesDespAnterior = remisionesAnteriores
      .reduce((sum, r) => sum + (r.cantidad_despachada || 0), 0);

    // 9. COSTO PROMEDIO POR PIEZA
    const costoPiezaActual = piezasCompletadasActual > 0
      ? nominaActual / piezasCompletadasActual
      : 0;

    const costoPiezaAnterior = piezasCompletadasAnterior > 0
      ? nominaAnterior / piezasCompletadasAnterior
      : 0;

    return {
      piezasCompletadas: {
        actual: piezasCompletadasActual,
        anterior: piezasCompletadasAnterior
      },
      eficiencia: {
        actual: Math.round(eficienciaActual),
        anterior: Math.round(eficienciaAnterior)
      },
      nomina: {
        actual: nominaActual,
        anterior: nominaAnterior
      },
      ordenesProcesadas: {
        actual: ordenesProcesamActual,
        anterior: ordenesProcesamAnterior
      },
      tiempoPromedio: {
        actual: Math.round(tiempoPromedioActual),
        anterior: Math.round(tiempoPromedioAnterior)
      },
      productividadDiaria: {
        actual: Math.round(productividadDiariaActual),
        anterior: Math.round(productividadDiariaAnterior)
      },
      empleadosActivos: {
        actual: empleadosActivosActual,
        anterior: empleadosActivosAnterior
      },
      unidadesDespachadas: {
        actual: unidadesDespActual,
        anterior: unidadesDespAnterior
      },
      costoPorPieza: {
        actual: costoPiezaActual,
        anterior: costoPiezaAnterior
      }
    };
  }, [datosPeriodo, rangoActual]);

  // ============================================
  // EVOLUCIÓN TEMPORAL (DÍA A DÍA)
  // ============================================
  const evolucionTemporal = useMemo(() => {
    const dias = generarDiasEnRango(rangoActual);

    return dias.map(dia => {
      const asignacionesDia = asignaciones.filter(a => {
        const fechaAsig = typeof a.fecha === 'string'
          ? a.fecha.split('T')[0]
          : new Date(a.fecha).toISOString().split('T')[0];
        return fechaAsig === dia;
      });

      const completadas = asignacionesDia
        .filter(a => a.completado)
        .reduce((sum, a) => sum + (a.cantidad || 0), 0);

      const pendientes = asignacionesDia
        .filter(a => !a.completado)
        .reduce((sum, a) => sum + (a.cantidad || 0), 0);

      const nominaDia = asignacionesDia
        .filter(a => a.completado)
        .reduce((sum, a) => sum + parseFloat(a.monto || 0), 0);

      const eficienciaDia = asignacionesDia.length > 0
        ? (asignacionesDia.filter(a => a.completado).length / asignacionesDia.length) * 100
        : 0;

      const fecha = new Date(dia);
      return {
        fecha: fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
        fechaCompleta: dia,
        completadas,
        pendientes,
        total: completadas + pendientes,
        nomina: Math.round(nominaDia),
        eficiencia: Math.round(eficienciaDia)
      };
    });
  }, [asignaciones, rangoActual]);

  // ============================================
  // ANÁLISIS DE OPERACIONES (HISTÓRICO)
  // ============================================
  const analisisOperaciones = useMemo(() => {
    const { asignacionesActuales } = datosPeriodo;

    const estadisticasPorOperacion = operaciones.map(op => {
      const asignacionesOp = asignacionesActuales.filter(a =>
        a.operacion_id === op.id && a.completado
      );

      if (asignacionesOp.length === 0) return null;

      const totalPiezas = asignacionesOp.reduce((sum, a) => sum + (a.cantidad || 0), 0);
      const totalMonto = asignacionesOp.reduce((sum, a) => sum + parseFloat(a.monto || 0), 0);
      const costoPromedio = totalPiezas > 0 ? totalMonto / totalPiezas : 0;

      // Calcular tiempo promedio
      const tiempos = asignacionesOp
        .filter(a => a.fecha_terminado)
        .map(a => {
          const inicio = new Date(a.fecha);
          const fin = new Date(a.fecha_terminado);
          const dias = Math.max(1, calcularDiasEntre(inicio, fin));
          return dias / (a.cantidad || 1);
        });

      const tiempoPromedio = tiempos.length > 0
        ? tiempos.reduce((a, b) => a + b, 0) / tiempos.length
        : 0;

      return {
        operacion: op.nombre,
        totalPiezas,
        totalMonto,
        costoPromedio,
        tiempoPromedio: tiempoPromedio.toFixed(2),
        asignaciones: asignacionesOp.length
      };
    }).filter(Boolean);

    // Top 5 operaciones por volumen
    const topPorVolumen = [...estadisticasPorOperacion]
      .sort((a, b) => b.totalPiezas - a.totalPiezas)
      .slice(0, 5);

    // Top 5 operaciones por costo
    const topPorCosto = [...estadisticasPorOperacion]
      .sort((a, b) => b.costoPromedio - a.costoPromedio)
      .slice(0, 5);

    // Operaciones más lentas
    const masLentas = [...estadisticasPorOperacion]
      .sort((a, b) => parseFloat(b.tiempoPromedio) - parseFloat(a.tiempoPromedio))
      .slice(0, 5);

    return {
      todas: estadisticasPorOperacion,
      topPorVolumen,
      topPorCosto,
      masLentas
    };
  }, [operaciones, datosPeriodo]);

  // ============================================
  // RANKING DE EMPLEADOS (PERÍODO)
  // ============================================
  const rankingEmpleados = useMemo(() => {
    const { asignacionesActuales } = datosPeriodo;

    const estadisticasPorEmpleado = empleados.map(emp => {
      const asignacionesEmp = asignacionesActuales.filter(a =>
        a.empleado_id === emp.id && a.completado
      );

      if (asignacionesEmp.length === 0) return null;

      const totalPiezas = asignacionesEmp.reduce((sum, a) => sum + (a.cantidad || 0), 0);
      const totalMonto = asignacionesEmp.reduce((sum, a) => sum + parseFloat(a.monto || 0), 0);

      // Calcular días realmente trabajados
      const diasTrabajados = new Set(
        asignacionesEmp.map(a => {
          const fecha = a.fecha_terminado || a.fecha;
          return typeof fecha === 'string'
            ? fecha.split('T')[0]
            : new Date(fecha).toISOString().split('T')[0];
        })
      ).size;

      const productividadDiaria = diasTrabajados > 0
        ? Math.round(totalPiezas / diasTrabajados)
        : 0;

      return {
        nombre: emp.nombre,
        totalPiezas,
        totalMonto,
        productividadDiaria,
        diasTrabajados,
        asignaciones: asignacionesEmp.length
      };
    }).filter(Boolean);

    // Top 10 por operaciones
    const topPorPiezas = [...estadisticasPorEmpleado]
      .sort((a, b) => b.totalPiezas - a.totalPiezas)
      .slice(0, 10);

    // Top 10 por nómina
    const topPorNomina = [...estadisticasPorEmpleado]
      .sort((a, b) => b.totalMonto - a.totalMonto)
      .slice(0, 10);

    return {
      todos: estadisticasPorEmpleado,
      topPorPiezas,
      topPorNomina
    };
  }, [empleados, datosPeriodo]);

  // ============================================
  // ALERTAS ESTRATÉGICAS
  // ============================================
  const alertasEstrategicas = useMemo(() => {
    const alertas = [];

    // 1. Caída en productividad
    const cambioProductividad = calcularCambio(
      metricas.productividadDiaria.actual,
      metricas.productividadDiaria.anterior
    );

    if (cambioProductividad.direccion === 'down' && cambioProductividad.porcentaje > 15) {
      alertas.push({
        tipo: 'advertencia',
        titulo: 'Caída en productividad diaria',
        mensaje: `-${cambioProductividad.porcentaje}% vs período anterior`,
        accion: 'analizar',
        datos: cambioProductividad
      });
    }

    // 2. Aumento en costo por pieza
    const cambioCosto = calcularCambio(
      metricas.costoPorPieza.actual,
      metricas.costoPorPieza.anterior
    );

    if (cambioCosto.direccion === 'up' && cambioCosto.porcentaje > 10) {
      alertas.push({
        tipo: 'advertencia',
        titulo: 'Incremento en costo por operación',
        mensaje: `+${cambioCosto.porcentaje}% vs período anterior`,
        accion: 'costos',
        datos: cambioCosto
      });
    }

    // 3. Mejora significativa en eficiencia
    const cambioEficiencia = calcularCambio(
      metricas.eficiencia.actual,
      metricas.eficiencia.anterior
    );

    if (cambioEficiencia.direccion === 'up' && cambioEficiencia.porcentaje > 10) {
      alertas.push({
        tipo: 'exito',
        titulo: '¡Mejora en eficiencia!',
        mensaje: `+${cambioEficiencia.porcentaje}% vs período anterior`,
        accion: 'celebrar',
        datos: cambioEficiencia
      });
    }

    // 4. Disminución en empleados activos
    const cambioEmpleados = calcularCambio(
      metricas.empleadosActivos.actual,
      metricas.empleadosActivos.anterior
    );

    if (cambioEmpleados.direccion === 'down' && cambioEmpleados.porcentaje > 20) {
      alertas.push({
        tipo: 'critico',
        titulo: 'Caída en personal activo',
        mensaje: `-${cambioEmpleados.porcentaje}% empleados trabajando`,
        accion: 'recursos',
        datos: cambioEmpleados
      });
    }

    // 5. Operaciones con tiempo excesivo
    const operacionesLentas = analisisOperaciones.masLentas.filter(op =>
      parseFloat(op.tiempoPromedio) > 1.0
    );

    if (operacionesLentas.length > 0) {
      alertas.push({
        tipo: 'info',
        titulo: `${operacionesLentas.length} operaciones lentas detectadas`,
        mensaje: `Tiempo promedio > 1 día por pieza`,
        accion: 'operaciones',
        datos: operacionesLentas
      });
    }

    return alertas.slice(0, 6);
  }, [metricas, analisisOperaciones]);
  // ============================================
  // RENDER
  // ============================================

  // Datos para PanelCuellosBottella
  const analisisCuellos = {
    estadisticas: {
      operacionesAltas: analisisOperaciones.todas.filter(op => parseFloat(op.tiempoPromedio) <= 0.5).length,
      operacionesMedias: analisisOperaciones.todas.filter(op => parseFloat(op.tiempoPromedio) > 0.5 && parseFloat(op.tiempoPromedio) <= 1.0).length,
      operacionesBajas: analisisOperaciones.todas.filter(op => parseFloat(op.tiempoPromedio) > 1.0).length,
    },
    operacionesLentas: analisisOperaciones.masLentas.filter(op => parseFloat(op.tiempoPromedio) > 1.0).map(op => ({
      operacion: op.operacion,
      tiempoPromedio: op.tiempoPromedio,
      totalCompletadas: op.totalPiezas,
    })),
    eficienciaOperaciones: analisisOperaciones.todas.map(op => ({
      operacion: op.operacion,
      tiempoPromedio: op.tiempoPromedio,
    })),
    productividadEmpleados: rankingEmpleados.topPorPiezas.slice(0, 3).map(emp => ({
      nombre: emp.nombre,
      piezas: emp.totalPiezas,
    })),
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard Estratégico</h1>
          <p className="text-slate-500 text-sm mt-0.5">Análisis histórico y tendencias comparativas</p>
        </div>
        <SelectorPeriodo periodoActual={periodoActual} onCambioPeriodo={setPeriodoActual} />
      </div>

      {/* ALERTAS ESTRATÉGICAS */}
      {alertasEstrategicas.length > 0 && (
        <div className="card overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
            onClick={() => setAlertasExpandidas(!alertasExpandidas)}
          >
            <div className="flex items-center gap-2.5">
              <Brain className="w-4 h-4 text-brand-600" />
              <h2 className="text-sm font-semibold text-slate-800">Insights Estratégicos</h2>
              <span className="badge-brand">{alertasEstrategicas.length}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${alertasExpandidas ? 'rotate-180' : ''}`} />
          </button>
          {alertasExpandidas && (
            <div className="px-5 pb-5 border-t border-slate-100 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {alertasEstrategicas.map((alerta, idx) => (
                  <TarjetaAlerta key={idx} alerta={alerta} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MÉTRICAS COMPARATIVAS PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TarjetaMetricaComparativa
          titulo="Productividad Diaria"
          valorActual={metricas.productividadDiaria.actual}
          valorAnterior={metricas.productividadDiaria.anterior}
          icono={Zap}
          color="blue"
          formato="numero"
          subtitulo="operaciones/día promedio"
        />
        <TarjetaMetricaComparativa
          titulo="Eficiencia Global"
          valorActual={metricas.eficiencia.actual}
          valorAnterior={metricas.eficiencia.anterior}
          icono={Target}
          color="green"
          formato="porcentaje"
          subtitulo="tasa de completado"
        />
        <TarjetaMetricaComparativa
          titulo="Costo por Operación"
          valorActual={metricas.costoPorPieza.actual}
          valorAnterior={metricas.costoPorPieza.anterior}
          icono={DollarSign}
          color="yellow"
          formato="moneda"
          subtitulo="costo promedio"
          invertirColores={true}
        />
        <TarjetaMetricaComparativa
          titulo="Empleados Activos"
          valorActual={metricas.empleadosActivos.actual}
          valorAnterior={metricas.empleadosActivos.anterior}
          icono={User}
          color="purple"
          formato="numero"
          subtitulo="con producción"
        />
      </div>

      {/* MÉTRICAS SECUNDARIAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TarjetaMetricaComparativa
          titulo="Operaciones Completadas"
          valorActual={metricas.piezasCompletadas.actual}
          valorAnterior={metricas.piezasCompletadas.anterior}
          icono={Package}
          color="blue"
          formato="numero"
          subtitulo="en el período"
        />
        <TarjetaMetricaComparativa
          titulo="Nómina Total"
          valorActual={metricas.nomina.actual}
          valorAnterior={metricas.nomina.anterior}
          icono={DollarSign}
          color="green"
          formato="moneda"
          subtitulo="pagado en período"
        />
        <TarjetaMetricaComparativa
          titulo="Órdenes Procesadas"
          valorActual={metricas.ordenesProcesadas.actual}
          valorAnterior={metricas.ordenesProcesadas.anterior}
          icono={Activity}
          color="purple"
          formato="numero"
          subtitulo="ingresadas al sistema"
        />
        <TarjetaMetricaComparativa
          titulo="Tiempo Promedio"
          valorActual={metricas.tiempoPromedio.actual}
          valorAnterior={metricas.tiempoPromedio.anterior}
          icono={Clock}
          color="red"
          formato="numero"
          subtitulo="días por orden"
          invertirColores={true}
        />
      </div>

      {/* GRÁFICOS DE EVOLUCIÓN TEMPORAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolución de Producción */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-slate-800">Evolución de Producción</h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" />Completadas</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-400 rounded-full inline-block" />Pendientes</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={evolucionTemporal}>
              <defs>
                <linearGradient id="colorCompletadas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPendientes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Area type="monotone" dataKey="completadas" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCompletadas)" name="Completadas" dot={false} />
              <Area type="monotone" dataKey="pendientes" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorPendientes)" name="Pendientes" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Eficiencia vs Nómina */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-semibold text-slate-800">Eficiencia vs Nómina</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={evolucionTemporal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Bar yAxisId="right" dataKey="nomina" fill="#e0e7ff" name="Nómina ($)" radius={[4, 4, 0, 0]} />
              <Line yAxisId="left" type="monotone" dataKey="eficiencia" stroke="#4f46e5" strokeWidth={2.5} name="Eficiencia (%)" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RANKINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Empleados por Producción */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-800">Top 10 Empleados — Producción</h3>
          </div>
          <div className="space-y-2">
            {rankingEmpleados.topPorPiezas.map((emp, idx) => {
              const { asignacionesActuales } = datosPeriodo;
              const asignacionesEmp = asignacionesActuales.filter(a =>
                a.empleado_id === empleados.find(e => e.nombre === emp.nombre)?.id && a.completado
              );
              const operacionesDesglose = {};
              asignacionesEmp.forEach(asig => {
                const operacion = operaciones.find(op => op.id === asig.operacion_id);
                if (operacion) {
                  operacionesDesglose[operacion.nombre] = (operacionesDesglose[operacion.nombre] || 0) + (asig.cantidad || 0);
                }
              });
              const desgloseTexto = Object.entries(operacionesDesglose)
                .sort((a, b) => b[1] - a[1]).slice(0, 3)
                .map(([op, cant]) => `${cant} ${op.toLowerCase()}`).join(', ');
              const hayMas = Object.keys(operacionesDesglose).length > 3;
              const medals = ['🥇', '🥈', '🥉'];

              return (
                <div key={idx} className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <span className="text-base flex-shrink-0 w-6 text-center">{medals[idx] || <span className="text-xs font-bold text-slate-400">{idx + 1}</span>}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800 truncate">{emp.nombre}</p>
                      <span className="text-sm font-bold text-brand-600 flex-shrink-0 ml-2">{emp.totalPiezas}</span>
                    </div>
                    {desgloseTexto && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{desgloseTexto}{hayMas ? '…' : ''}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Empleados por Nómina */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-semibold text-slate-800">Top 10 Empleados — Nómina</h3>
          </div>
          <div className="space-y-2">
            {rankingEmpleados.topPorNomina.map((emp, idx) => (
              <div key={idx} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  idx === 0 ? 'bg-emerald-500 text-white' :
                  idx === 1 ? 'bg-emerald-400 text-white' :
                  idx === 2 ? 'bg-emerald-300 text-emerald-900' :
                  'bg-slate-200 text-slate-600'
                }`}>{idx + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{emp.nombre}</p>
                  <p className="text-xs text-slate-400">{emp.asignaciones} asignaciones</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-emerald-600">${formatearMoneda(emp.totalMonto)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOP 5 OPERACIONES */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-semibold text-slate-800">Top 5 Operaciones — Análisis Completo</h3>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="badge-blue">Volumen</span>
            <span className="badge-green">Costo</span>
            <span className="badge-amber">Tiempo</span>
          </div>
        </div>
        <div className="space-y-3">
          {analisisOperaciones.topPorVolumen.slice(0, 5).map((op, idx) => {
            const porcentaje = (op.totalPiezas / (analisisOperaciones.topPorVolumen[0]?.totalPiezas || 1)) * 100;
            return (
              <div key={idx} className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  idx === 0 ? 'bg-amber-400 text-amber-900' :
                  idx === 1 ? 'bg-slate-300 text-slate-700' :
                  idx === 2 ? 'bg-orange-300 text-orange-900' :
                  'bg-slate-200 text-slate-500'
                }`}>{idx + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{op.operacion}</p>
                      <p className="text-xs text-slate-400">{op.asignaciones} asignaciones</p>
                    </div>
                    <p className="text-xl font-bold text-brand-600 flex-shrink-0 ml-3">{op.totalPiezas.toLocaleString()}</p>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${porcentaje}%` }} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span><span className="font-medium text-slate-700">${formatearMoneda(op.costoPromedio)}</span> /operación</span>
                    <span><span className="font-medium text-emerald-600">${formatearMoneda(op.totalMonto)}</span> total</span>
                    <span><span className="font-medium text-amber-600">{op.tiempoPromedio}d</span> /operación</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PANEL CUELLOS DE BOTELLA */}
      <PanelCuellosBottella analisis={analisisCuellos} />

      {/* OPERACIONES MÁS LENTAS — TABLA */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <h3 className="text-sm font-semibold text-slate-800">Operaciones más Lentas — Período Actual</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Operación</th>
                <th>Tiempo Promedio</th>
                <th>Procesadas</th>
                <th>Costo Promedio</th>
                <th>Asignaciones</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {analisisOperaciones.masLentas.map((op, idx) => {
                const tiempo = parseFloat(op.tiempoPromedio);
                const criticidad = tiempo > 1.5 ? 'critico' : tiempo > 1.0 ? 'advertencia' : 'normal';
                return (
                  <tr key={idx}>
                    <td className="font-semibold text-slate-900">{op.operacion}</td>
                    <td>
                      <span className={`font-bold ${criticidad === 'critico' ? 'text-rose-600' : criticidad === 'advertencia' ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {op.tiempoPromedio} d/op
                      </span>
                    </td>
                    <td className="font-semibold text-slate-700">{op.totalPiezas.toLocaleString()}</td>
                    <td className="text-slate-600">${formatearMoneda(op.costoPromedio)}</td>
                    <td className="text-slate-500">{op.asignaciones}</td>
                    <td>
                      <span className={`badge ${criticidad === 'critico' ? 'badge-red' : criticidad === 'advertencia' ? 'badge-amber' : 'badge-green'}`}>
                        {criticidad === 'critico' ? 'Crítico' : criticidad === 'advertencia' ? 'Lento' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Producido</p>
            <p className="text-2xl font-bold text-slate-900">{metricas.piezasCompletadas.actual.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-0.5">ant: {metricas.piezasCompletadas.anterior.toLocaleString()}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nómina Total</p>
            <p className="text-2xl font-bold text-slate-900">${formatearMoneda(metricas.nomina.actual)}</p>
            <p className="text-xs text-slate-400 mt-0.5">ant: ${formatearMoneda(metricas.nomina.anterior)}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6 text-brand-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Órdenes Nuevas</p>
            <p className="text-2xl font-bold text-slate-900">{metricas.ordenesProcesadas.actual}</p>
            <p className="text-xs text-slate-400 mt-0.5">ant: {metricas.ordenesProcesadas.anterior}</p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center py-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Actualizado: {new Date().toLocaleString('es-CO')} · {empleados.length} empleados · {ordenes.length} órdenes · {asignaciones.length} asignaciones
        </p>
        <p className="text-xs text-slate-300 mt-0.5">
          Comparaciones automáticas contra el período inmediatamente anterior de igual duración
        </p>
      </div>
    </div>
  );
};

export default VistaDashboard;