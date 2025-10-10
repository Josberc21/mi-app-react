// src/components/dashboard/VistaDashboard.jsx
import React, { useMemo, useState } from 'react';
import { 
  User, Package, Clock, DollarSign, AlertTriangle, TrendingUp, 
  TrendingDown, Activity, Zap, Target, Award, BarChart3, 
  Calendar, ArrowUpRight, ArrowDownRight, Minus, Brain
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
  ComposedChart, Scatter, Cell
} from 'recharts';
import TarjetaAlerta from './TarjetaAlerta';
import TarjetaMetricaComparativa from './TarjetaMetricaComparativa';
import PanelCuellosBottella from './PanelCuellosBottella';
import SelectorPeriodo from './SelectorPeriodo';
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
  const [vistaComparativa, setVistaComparativa] = useState('metricas'); // 'metricas', 'graficos', 'operaciones'

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
      
      const diasPeriodo = Math.ceil((rangoActual.fin - rangoActual.inicio) / (1000 * 60 * 60 * 24)) + 1;
      const productividadDiaria = totalPiezas / diasPeriodo;

      return {
        nombre: emp.nombre,
        totalPiezas,
        totalMonto,
        productividadDiaria: productividadDiaria.toFixed(1),
        asignaciones: asignacionesEmp.length
      };
    }).filter(Boolean);

    // Top 10 por piezas
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
  }, [empleados, datosPeriodo, rangoActual]);

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
        titulo: 'Incremento en costo por pieza',
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
  return (
    <div className="space-y-6">
      {/* HEADER CON SELECTOR DE PERÍODO */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="w-8 h-8" />
              Dashboard Estratégico
            </h1>
            <p className="text-indigo-100 mt-1">Análisis histórico y tendencias</p>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm">Comparación automática activada</span>
          </div>
        </div>
        
        {/* Selector de período */}
        <SelectorPeriodo 
          periodoActual={periodoActual}
          onCambioPeriodo={setPeriodoActual}
        />
      </div>

      {/* ALERTAS ESTRATÉGICAS */}
      {alertasEstrategicas.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            onClick={() => setAlertasExpandidas(!alertasExpandidas)}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">Insights Estratégicos</h2>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                {alertasEstrategicas.length}
              </span>
            </div>
            <span className="text-gray-600 text-2xl font-bold">
              {alertasExpandidas ? '−' : '+'}
            </span>
          </button>

          {alertasExpandidas && (
            <div className="p-4 pt-0 border-t">
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
          subtitulo="piezas/día promedio"
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
          titulo="Costo por Pieza"
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
          titulo="Piezas Completadas"
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
      <div className="grid grid-cols-1 gap-6">
        {/* Evolución de Producción */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">📈 Evolución de Producción</h3>
            <div className="flex gap-2 text-sm">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Completadas
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                Pendientes
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={evolucionTemporal}>
              <defs>
                <linearGradient id="colorCompletadas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorPendientes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="completadas" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorCompletadas)" 
                name="Completadas"
              />
              <Area 
                type="monotone" 
                dataKey="pendientes" 
                stroke="#f59e0b" 
                fillOpacity={1} 
                fill="url(#colorPendientes)" 
                name="Pendientes"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Evolución de Eficiencia y Nómina */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-4">💰 Eficiencia vs Nómina</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={evolucionTemporal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar 
                yAxisId="right"
                dataKey="nomina" 
                fill="#3b82f6" 
                name="Nómina ($)"
                opacity={0.6}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="eficiencia" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Eficiencia (%)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RANKINGS Y ANÁLISIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Empleados */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-6 h-6 text-yellow-600" />
            <h3 className="font-bold text-lg">🏆 Top 10 Empleados - Producción</h3>
          </div>
          <div className="space-y-3">
            {rankingEmpleados.topPorPiezas.map((emp, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                  idx === 1 ? 'bg-gray-300 text-gray-700' :
                  idx === 2 ? 'bg-orange-400 text-orange-900' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{emp.nombre}</p>
                  <p className="text-xs text-gray-500">{emp.productividadDiaria} piezas/día</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{emp.totalPiezas}</p>
                  <p className="text-xs text-gray-500">piezas</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Empleados por Nómina */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-6 h-6 text-green-600" />
            <h3 className="font-bold text-lg">💵 Top 10 Empleados - Nómina</h3>
          </div>
          <div className="space-y-3">
            {rankingEmpleados.topPorNomina.map((emp, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  idx === 0 ? 'bg-green-400 text-green-900' :
                  idx === 1 ? 'bg-green-300 text-green-800' :
                  idx === 2 ? 'bg-green-200 text-green-700' :
                  'bg-green-100 text-green-600'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{emp.nombre}</p>
                  <p className="text-xs text-gray-500">{emp.asignaciones} asignaciones</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">${formatearMoneda(emp.totalMonto)}</p>
                  <p className="text-xs text-gray-500">total</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Operaciones por Volumen */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-6 h-6 text-blue-600" />
            <h3 className="font-bold text-lg">🔧 Top 5 Operaciones - Volumen</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analisisOperaciones.topPorVolumen} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="operacion" type="category" width={100} />
              <Tooltip formatter={(value) => `${value.toLocaleString()} piezas`} />
              <Bar dataKey="totalPiezas" fill="#3b82f6" name="Piezas">
                {analisisOperaciones.topPorVolumen.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${220 - index * 15}, 70%, ${50 + index * 5}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Operaciones más Costosas */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-6 h-6 text-amber-600" />
            <h3 className="font-bold text-lg">💰 Top 5 Operaciones - Costo</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analisisOperaciones.topPorCosto} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="operacion" type="category" width={100} />
              <Tooltip formatter={(value) => `$${formatearMoneda(value)}/pieza`} />
              <Bar dataKey="costoPromedio" fill="#f59e0b" name="Costo Prom.">
                {analisisOperaciones.topPorCosto.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${45 - index * 10}, 80%, ${50 + index * 5}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ANÁLISIS DE CUELLOS DE BOTELLA */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h3 className="font-bold text-lg">⚠️ Operaciones más Lentas (Período Actual)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Operación</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Tiempo Promedio</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Piezas Procesadas</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Costo Promedio</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Asignaciones</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analisisOperaciones.masLentas.map((op, idx) => {
                const tiempo = parseFloat(op.tiempoPromedio);
                const criticidad = tiempo > 1.5 ? 'crítico' : tiempo > 1.0 ? 'advertencia' : 'normal';
                
                return (
                  <tr key={idx} className={`hover:bg-gray-50 ${
                    criticidad === 'crítico' ? 'border-l-4 border-red-500 bg-red-50' :
                    criticidad === 'advertencia' ? 'border-l-4 border-yellow-500 bg-yellow-50' :
                    ''
                  }`}>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-900">{op.operacion}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${
                        criticidad === 'crítico' ? 'text-red-600' :
                        criticidad === 'advertencia' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {op.tiempoPromedio} días/pieza
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-900">{op.totalPiezas.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-700">${formatearMoneda(op.costoPromedio)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-600">{op.asignaciones}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        criticidad === 'crítico' ? 'bg-red-100 text-red-800' :
                        criticidad === 'advertencia' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {criticidad === 'crítico' ? '🔴 Crítico' :
                         criticidad === 'advertencia' ? '🟡 Lento' :
                         '🟢 Normal'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESUMEN COMPARATIVO */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          📊 Resumen Comparativo del Período
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Productividad */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Productividad</span>
              {calcularCambio(metricas.productividadDiaria.actual, metricas.productividadDiaria.anterior).direccion === 'up' ? (
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              ) : calcularCambio(metricas.productividadDiaria.actual, metricas.productividadDiaria.anterior).direccion === 'down' ? (
                <ArrowDownRight className="w-5 h-5 text-red-600" />
              ) : (
                <Minus className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{metricas.productividadDiaria.actual}</p>
            <p className="text-xs text-gray-500 mt-1">
              piezas/día (antes: {metricas.productividadDiaria.anterior})
            </p>
          </div>

          {/* Eficiencia */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Eficiencia</span>
              {calcularCambio(metricas.eficiencia.actual, metricas.eficiencia.anterior).direccion === 'up' ? (
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              ) : calcularCambio(metricas.eficiencia.actual, metricas.eficiencia.anterior).direccion === 'down' ? (
                <ArrowDownRight className="w-5 h-5 text-red-600" />
              ) : (
                <Minus className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{metricas.eficiencia.actual}%</p>
            <p className="text-xs text-gray-500 mt-1">
              completado (antes: {metricas.eficiencia.anterior}%)
            </p>
          </div>

          {/* Costo */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Costo/Pieza</span>
              {calcularCambio(metricas.costoPorPieza.actual, metricas.costoPorPieza.anterior).direccion === 'down' ? (
                <ArrowDownRight className="w-5 h-5 text-green-600" />
              ) : calcularCambio(metricas.costoPorPieza.actual, metricas.costoPorPieza.anterior).direccion === 'up' ? (
                <ArrowUpRight className="w-5 h-5 text-red-600" />
              ) : (
                <Minus className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">${formatearMoneda(metricas.costoPorPieza.actual)}</p>
            <p className="text-xs text-gray-500 mt-1">
              antes: ${formatearMoneda(metricas.costoPorPieza.anterior)}
            </p>
          </div>

          {/* Personal */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Personal Activo</span>
              {calcularCambio(metricas.empleadosActivos.actual, metricas.empleadosActivos.anterior).direccion === 'up' ? (
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              ) : calcularCambio(metricas.empleadosActivos.actual, metricas.empleadosActivos.anterior).direccion === 'down' ? (
                <ArrowDownRight className="w-5 h-5 text-red-600" />
              ) : (
                <Minus className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{metricas.empleadosActivos.actual}</p>
            <p className="text-xs text-gray-500 mt-1">
              empleados (antes: {metricas.empleadosActivos.anterior})
            </p>
          </div>
        </div>

        {/* Insight principal */}
        <div className="mt-4 p-4 bg-white rounded-lg border-l-4 border-indigo-500">
          <p className="text-sm font-medium text-gray-700">
            <span className="font-bold text-indigo-600">💡 Insight:</span>{' '}
            {metricas.productividadDiaria.actual > metricas.productividadDiaria.anterior ? (
              <>La productividad aumentó un {calcularCambio(metricas.productividadDiaria.actual, metricas.productividadDiaria.anterior).porcentaje}% respecto al período anterior. ¡Excelente desempeño del equipo!</>
            ) : metricas.productividadDiaria.actual < metricas.productividadDiaria.anterior ? (
              <>La productividad disminuyó un {calcularCambio(metricas.productividadDiaria.actual, metricas.productividadDiaria.anterior).porcentaje}%. Considera revisar cuellos de botella en las operaciones más lentas.</>
            ) : (
              <>La productividad se mantiene estable. El equipo está trabajando de manera consistente.</>
            )}
          </p>
        </div>
      </div>

      {/* INDICADORES CLAVE DE RENDIMIENTO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Package className="w-12 h-12 opacity-80" />
            <div className="text-right">
              <p className="text-sm font-medium opacity-90">Total Producido</p>
              <p className="text-4xl font-bold">{metricas.piezasCompletadas.actual.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-blue-400">
            <span className="text-sm opacity-90">Período anterior</span>
            <span className="text-sm font-semibold">{metricas.piezasCompletadas.anterior.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-12 h-12 opacity-80" />
            <div className="text-right">
              <p className="text-sm font-medium opacity-90">Nómina Total</p>
              <p className="text-4xl font-bold">${formatearMoneda(metricas.nomina.actual)}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-green-400">
            <span className="text-sm opacity-90">Período anterior</span>
            <span className="text-sm font-semibold">${formatearMoneda(metricas.nomina.anterior)}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Activity className="w-12 h-12 opacity-80" />
            <div className="text-right">
              <p className="text-sm font-medium opacity-90">Órdenes Nuevas</p>
              <p className="text-4xl font-bold">{metricas.ordenesProcesadas.actual}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-purple-400">
            <span className="text-sm opacity-90">Período anterior</span>
            <span className="text-sm font-semibold">{metricas.ordenesProcesadas.anterior}</span>
          </div>
        </div>
      </div>

      {/* FOOTER INFORMATIVO */}
      <div className="bg-gray-100 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Dashboard Estratégico</span> • 
          Actualizado: {new Date().toLocaleString('es-CO')} • 
          {empleados.length} empleados • {ordenes.length} órdenes • {asignaciones.length} asignaciones
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Las comparaciones se realizan automáticamente contra el período inmediatamente anterior de igual duración
        </p>
      </div>
    </div>
  );
};

export default VistaDashboard;