import React, { useMemo, useState } from 'react';
import { User, Package, Clock, DollarSign, AlertTriangle, TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import TarjetaAlerta from './TarjetaAlerta';
import TarjetaMetrica from './TarjetaMetrica';
import PanelCuellosBottella from './PanelCuellosBottella';
import { calcularDiasEntre } from '../../utils/dateUtils';
import { formatearMoneda } from '../../utils/formatUtils';

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
    const [alertasExpandidas, setAlertasExpandidas] = useState(true);

    // ============================================
    // SISTEMA DE ALERTAS INTELIGENTES
    // ============================================

    const alertas = useMemo(() => {
        const alertasGeneradas = [];

        // 1. ÓRDENES ESTANCADAS (más de 10 días sin completar y progreso < 50%)
        ordenes.forEach(orden => {
            const diasDesdeEntrada = calcularDiasEntre(orden.fecha_entrada, new Date());
            const progreso = calcularProgresoOrden(orden);

            if (diasDesdeEntrada > 10 && progreso.porcentaje < 50) {
                alertasGeneradas.push({
                    tipo: 'critico',
                    titulo: `Orden ${orden.numero_orden} estancada`,
                    mensaje: `${diasDesdeEntrada} días con solo ${progreso.porcentaje}% de avance`,
                    accion: 'ordenes',
                    datos: orden
                });
            }
        });

        // 2. OPERACIONES SIN ASIGNAR EN ÓRDENES ACTIVAS
        ordenes.forEach(orden => {
            const operacionesRequeridas = operaciones.filter(op => op.prenda_id === orden.prenda_id);
            operacionesRequeridas.forEach(op => {
                const asignacionesOp = asignaciones.filter(a =>
                    a.orden_id === orden.id &&
                    a.operacion_id === op.id
                );
                const totalAsignado = asignacionesOp.reduce((sum, a) => sum + a.cantidad, 0);

                if (totalAsignado === 0) {
                    alertasGeneradas.push({
                        tipo: 'advertencia',
                        titulo: `Operación sin asignar`,
                        mensaje: `${orden.numero_orden}: "${op.nombre}" no tiene asignaciones`,
                        accion: 'asignar',
                        datos: { orden, operacion: op }
                    });
                }
            });
        });

        // 3. EMPLEADOS SIN ACTIVIDAD RECIENTE (más de 3 días)
        const hace3Dias = new Date();
        hace3Dias.setDate(hace3Dias.getDate() - 3);

        empleados.forEach(emp => {
            const asignacionesRecientes = asignaciones.filter(a =>
                a.empleado_id === emp.id &&
                new Date(a.fecha) >= hace3Dias
            );

            if (asignacionesRecientes.length === 0) {
                alertasGeneradas.push({
                    tipo: 'info',
                    titulo: `${emp.nombre} sin asignaciones`,
                    mensaje: `Sin actividad en los últimos 3 días`,
                    accion: 'asignar',
                    datos: emp
                });
            }
        });

        // 4. ÓRDENES LISTAS PARA DESPACHAR
        ordenes.forEach(orden => {
            const progreso = calcularProgresoOrden(orden);
            const yaDespachadas = remisiones
                .filter(r => r.orden_id === orden.id)
                .reduce((sum, r) => sum + r.cantidad_despachada, 0);

            if (progreso.completadas >= orden.cantidad_total && yaDespachadas < orden.cantidad_total) {
                const disponibles = progreso.completadas - yaDespachadas;
                alertasGeneradas.push({
                    tipo: 'exito',
                    titulo: `${orden.numero_orden} lista para despacho`,
                    mensaje: `${disponibles} unidades disponibles`,
                    accion: 'remisiones',
                    datos: orden
                });
            }
        });

        // 5. ASIGNACIONES PENDIENTES ANTIGUAS (más de 5 días)
        const hace5Dias = new Date();
        hace5Dias.setDate(hace5Dias.getDate() - 5);

        const pendientesAntiguas = asignaciones.filter(a =>
            !a.completado &&
            new Date(a.fecha) < hace5Dias
        );

        if (pendientesAntiguas.length > 0) {
            alertasGeneradas.push({
                tipo: 'advertencia',
                titulo: `${pendientesAntiguas.length} asignaciones pendientes antiguas`,
                mensaje: `Asignadas hace más de 5 días sin completar`,
                accion: 'asignar',
                datos: pendientesAntiguas
            });
        }

        // Ordenar por prioridad: crítico > advertencia > éxito > info
        const prioridad = { critico: 0, advertencia: 1, exito: 2, info: 3 };
        return alertasGeneradas
            .sort((a, b) => prioridad[a.tipo] - prioridad[b.tipo])
            .slice(0, 8);
    }, [ordenes, asignaciones, empleados, operaciones, remisiones, calcularProgresoOrden]);

    // ============================================
    // ANÁLISIS DE CUELLOS DE BOTELLA
    // ============================================

    const analisisEficiencia = useMemo(() => {
        // Identificar operaciones lentas (más tiempo del esperado)
        const eficienciaOperaciones = operaciones.map(op => {
            const asignacionesOp = asignaciones.filter(a =>
                a.operacion_id === op.id &&
                a.completado &&
                a.fecha_terminado  // 👈 Asegurar que tiene fecha de terminación
            );

            if (asignacionesOp.length === 0) return null;

            const tiemposPromedio = asignacionesOp.map(a => {
                const fechaInicio = new Date(a.fecha);
                const fechaFin = new Date(a.fecha_terminado);
                const diasTrabajo = Math.max(1, calcularDiasEntre(fechaInicio, fechaFin)); // Mínimo 1 día
                return diasTrabajo / (a.cantidad || 1); // días por pieza
            });

            const tiempoPromedio = tiemposPromedio.reduce((a, b) => a + b, 0) / tiemposPromedio.length;
            const totalCompletadas = asignacionesOp.reduce((sum, a) => sum + (a.cantidad || 0), 0);

            return {
                operacion: op.nombre,
                tiempoPromedio: tiempoPromedio.toFixed(2),
                totalCompletadas,
                eficiencia: tiempoPromedio < 0.3 ? 'alta' : tiempoPromedio < 0.7 ? 'media' : 'baja'
            };
        }).filter(Boolean);

        // Empleados más productivos (últimos 7 días)
        const hace7Dias = new Date();
        hace7Dias.setDate(hace7Dias.getDate() - 7);

        const productividadEmpleados = empleados.map(emp => {
            const asignacionesSemana = asignaciones.filter(a =>
                a.empleado_id === emp.id &&
                a.completado &&
                a.fecha_terminado &&
                new Date(a.fecha_terminado) >= hace7Dias
            );

            const totalPiezas = asignacionesSemana.reduce((sum, a) => sum + (a.cantidad || 0), 0);
            const totalMonto = asignacionesSemana.reduce((sum, a) => sum + parseFloat(a.monto || 0), 0);

            return {
                nombre: emp.nombre.split(' ')[0],
                piezas: totalPiezas,
                monto: totalMonto
            };
        }).filter(e => e.piezas > 0)
            .sort((a, b) => b.piezas - a.piezas)
            .slice(0, 5);

        // Operaciones que causan retraso
        const operacionesLentas = eficienciaOperaciones
            .filter(op => op.eficiencia === 'baja')
            .sort((a, b) => parseFloat(b.tiempoPromedio) - parseFloat(a.tiempoPromedio))
            .slice(0, 5);

        // 🆕 ESTADÍSTICAS GENERALES PARA DEBUG
        const estadisticas = {
            totalOperacionesAnalizadas: eficienciaOperaciones.length,
            operacionesAltas: eficienciaOperaciones.filter(op => op.eficiencia === 'alta').length,
            operacionesMedias: eficienciaOperaciones.filter(op => op.eficiencia === 'media').length,
            operacionesBajas: eficienciaOperaciones.filter(op => op.eficiencia === 'baja').length,
            asignacionesConFechaTerminado: asignaciones.filter(a => a.completado && a.fecha_terminado).length,
            asignacionesCompletadasTotal: asignaciones.filter(a => a.completado).length
        };

        console.log('📊 Análisis de Eficiencia:', estadisticas); // Para debug

        return {
            eficienciaOperaciones,
            productividadEmpleados,
            operacionesLentas,
            estadisticas // 👈 Agregamos para debug
        };
    }, [empleados, asignaciones, operaciones]);

    // ============================================
    // MÉTRICAS PRINCIPALES
    // ============================================

    const metricas = useMemo(() => {
        const hace7Dias = new Date();
        hace7Dias.setDate(hace7Dias.getDate() - 7);

        const asignacionesSemana = asignaciones.filter(a =>
            new Date(a.fecha) >= hace7Dias
        );
        const completadasSemana = asignacionesSemana.filter(a => a.completado).length;
        const tasaCompletado = asignacionesSemana.length > 0
            ? Math.round((completadasSemana / asignacionesSemana.length) * 100)
            : 0;

        const tiempoPromedioOrden = ordenes.length > 0
            ? Math.round(
                ordenes
                    .map(o => calcularDiasEntre(o.fecha_entrada, new Date()))
                    .reduce((a, b) => a + b, 0) / ordenes.length
            )
            : 0;

        return {
            tasaCompletado,
            tiempoPromedioOrden,
            ordenesActivas: ordenes.length,
            productividadSemana: completadasSemana
        };
    }, [asignaciones, ordenes]);

    // ============================================
    // DATOS PARA GRÁFICOS
    // ============================================

    const graficos = useMemo(() => {
        // Top 10 empleados por nómina
        const nominaPorEmpleado = empleados
            .map(emp => ({
                nombre: emp.nombre.split(' ')[0],
                nomina: calcularNominaEmpleado(emp.id)
            }))
            .filter(d => d.nomina > 0)
            .sort((a, b) => b.nomina - a.nomina)
            .slice(0, 10);

        // Producción últimos 7 días
        const produccionPorDia = {};
        const hace7Dias = new Date();
        hace7Dias.setDate(hace7Dias.getDate() - 7);

        for (let i = 0; i < 7; i++) {
            const fecha = new Date();
            fecha.setDate(fecha.getDate() - i);
            const fechaStr = fecha.toISOString().split('T')[0];
            produccionPorDia[fechaStr] = {
                fecha: new Date(fechaStr).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' }),
                completadas: 0,
                pendientes: 0
            };
        }

        asignaciones.forEach(a => {
            if (produccionPorDia[a.fecha]) {
                if (a.completado) {
                    produccionPorDia[a.fecha].completadas += a.cantidad;
                } else {
                    produccionPorDia[a.fecha].pendientes += a.cantidad;
                }
            }
        });

        const datosProduccion = Object.values(produccionPorDia).reverse();

        return { nominaPorEmpleado, datosProduccion };
    }, [asignaciones, empleados, calcularNominaEmpleado]);

    return (
        <div className="space-y-6">
            {/* ALERTAS COLAPSABLES - CORREGIDO */}
            {alertas.length > 0 && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <button
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        onClick={() => setAlertasExpandidas(!alertasExpandidas)}
                    >
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6 text-orange-600" />
                            <h2 className="text-xl font-bold text-gray-900">Alertas y Acciones Recomendadas</h2>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${alertas.length === 0 ? 'bg-green-100 text-green-800' :
                                    alertas.length <= 3 ? 'bg-blue-100 text-blue-800' :
                                        alertas.length <= 6 ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-orange-100 text-orange-800'
                                }`}>
                                {alertas.length}
                            </span>
                        </div>
                        <span className="text-gray-600 text-2xl font-bold">
                            {alertasExpandidas ? '−' : '+'}
                        </span>
                    </button>

                    {alertasExpandidas && (
                        <div className="p-4 pt-0 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {alertas.map((alerta, idx) => (
                                    <TarjetaAlerta key={idx} alerta={alerta} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* PANEL DE EFICIENCIA Y CUELLOS DE BOTELLA */}
            <PanelCuellosBottella analisis={analisisEficiencia} />

            {/* MÉTRICAS PRINCIPALES */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <TarjetaMetrica
                    titulo="Empleados Activos"
                    valor={estadisticasDashboard.totalEmpleados}
                    icono={User}
                    color="blue"
                />
                <TarjetaMetrica
                    titulo="Tasa de Completado"
                    valor={`${metricas.tasaCompletado}%`}
                    icono={metricas.tasaCompletado >= 70 ? TrendingUp : TrendingDown}
                    color={metricas.tasaCompletado >= 70 ? "green" : "red"}
                    subtitulo="Últimos 7 días"
                />
                <TarjetaMetrica
                    titulo="Órdenes Activas"
                    valor={metricas.ordenesActivas}
                    icono={Package}
                    color="purple"
                    subtitulo={`${metricas.tiempoPromedioOrden} días promedio`}
                />
                <TarjetaMetrica
                    titulo="Nómina Total"
                    valor={`$${formatearMoneda(estadisticasDashboard.nominaTotal)}`}
                    icono={DollarSign}
                    color="green"
                />
            </div>

            {/* GRÁFICOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-bold mb-4">Top 10 Nómina por Empleado</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={graficos.nominaPorEmpleado}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nombre" />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${formatearMoneda(value)}`} />
                            <Bar dataKey="nomina" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-bold mb-4">Producción Últimos 7 Días</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={graficos.datosProduccion}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="fecha" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="completadas" stroke="#10b981" name="Completadas" strokeWidth={2} />
                            <Line type="monotone" dataKey="pendientes" stroke="#f59e0b" name="Pendientes" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* RESUMEN DE ASIGNACIONES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-yellow-600" />
                        <div>
                            <p className="text-sm text-yellow-800 font-medium">Asignaciones Pendientes</p>
                            <p className="text-3xl font-bold text-yellow-900">
                                {estadisticasDashboard.asignacionesPendientes}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <div className="flex items-center gap-3">
                        <Package className="w-8 h-8 text-green-600" />
                        <div>
                            <p className="text-sm text-green-800 font-medium">Asignaciones Completadas</p>
                            <p className="text-3xl font-bold text-green-900">
                                {estadisticasDashboard.asignacionesCompletadas}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <div className="flex items-center gap-3">
                        <Activity className="w-8 h-8 text-blue-600" />
                        <div>
                            <p className="text-sm text-blue-800 font-medium">Productividad Semanal</p>
                            <p className="text-3xl font-bold text-blue-900">
                                {metricas.productividadSemana}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VistaDashboard;