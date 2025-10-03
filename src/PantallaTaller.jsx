import React, { useState, useEffect } from 'react';
import { Clock, BarChart3 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const PantallaTaller = ({ empleados, asignaciones, operaciones, prendas, onSalir }) => {
    const [vistaKiosko, setVistaKiosko] = useState(0);
    const [pausarRotacion, setPausarRotacion] = useState(false);

    // Rotación automática de vistas
    useEffect(() => {
        if (pausarRotacion) return;

        const intervalo = setInterval(() => {
            setVistaKiosko(prev => (prev + 1) % 5);
        }, 12000);

        return () => clearInterval(intervalo);
    }, [pausarRotacion]);

    // Helpers de fecha
    const parseDate = (d) => {
        if (!d) return null;
        const date = new Date(d);
        if (isNaN(date.getTime())) return null;
        date.setHours(0,0,0,0);
        return date;
    };
    
    const isoDate = (d) => {
        const dt = parseDate(d);
        return dt ? dt.toISOString().split('T')[0] : null;
    };

    // CÁLCULOS
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const hoyStr = hoy.toISOString().split('T')[0];

    // Asignaciones del día
    const asignacionesHoy = asignaciones.filter(a => {
        if (a.completado && a.fecha_terminado) {
            return a.fecha_terminado === hoyStr || a.fecha_terminado.startsWith(hoyStr);
        }
        if (!a.completado && a.fecha) {
            return a.fecha === hoyStr || a.fecha.startsWith(hoyStr);
        }
        return false;
    });

    const metaDiaria = 1000;
    const completadasHoy = asignacionesHoy.filter(a => a.completado).reduce((sum, a) => sum + Number(a.cantidad || 0), 0);
    const progresoMeta = Math.min((completadasHoy / metaDiaria) * 100, 100);

    // Ranking empleados
    const rankingHoy = empleados.map(emp => {
        const asigs = asignacionesHoy.filter(a => Number(a.empleado_id) === Number(emp.id) && a.completado);
        const piezas = asigs.reduce((sum, a) => sum + Number(a.cantidad || 0), 0);
        const monto = asigs.reduce((sum, a) => sum + Number(a.monto || 0), 0);
        return { ...emp, piezas, monto, operaciones: asigs.length };
    }).filter(e => e.piezas > 0).sort((a, b) => b.piezas - a.piezas).slice(0, 5);

    // Producción últimos 7 días
    const ultimos7Dias = [];
    for (let i = 6; i >= 0; i--) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        fecha.setHours(0, 0, 0, 0);
        const fechaStr = fecha.toISOString().split('T')[0];

        const asigsDia = asignaciones.filter(a => {
            if (!a.completado || !a.fecha_terminado) return false;
            const fechaTerm = isoDate(a.fecha_terminado);
            return fechaTerm === fechaStr;
        });

        const piezas = asigsDia.reduce((sum, a) => sum + Number(a.cantidad || 0), 0);
        ultimos7Dias.push({
            dia: fecha.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' }),
            piezas
        });
    }

    // Top operaciones
    const topOperaciones = operaciones.map(op => {
        const cantidad = asignaciones.filter(a => {
            if (!a.completado || !a.fecha_terminado) return false;
            const fechaTerm = isoDate(a.fecha_terminado);
            return fechaTerm === hoyStr && Number(a.operacion_id) === Number(op.id);
        }).reduce((s, a) => s + Number(a.cantidad || 0), 0);

        const prenda = prendas.find(p => Number(p.id) === Number(op.prenda_id));
        return { nombre: op.nombre, prenda: prenda?.referencia || '', cantidad };
    }).filter(o => o.cantidad > 0).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);

    const medallas = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    const coloresMedalla = ['#FFD700', '#C0C0C0', '#CD7F32', '#4A90E2', '#9B59B6'];

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-8 bg-black bg-opacity-30">
                <div className="flex items-center gap-12"></div>
                <div>
                    <h1 className="text-6xl font-black tracking-tight">PANEL DE PRODUCCIÓN</h1>
                    <p className="text-3xl mt-2 opacity-90">
                        {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl">
                    <QRCodeSVG 
                        value={`${window.location.origin}?tv=true`}
                        size={180}
                        level="H"
                    />
                    <p className="text-center text-gray-800 font-bold mt-3 text-lg">
                        Escanea para ver tu ranking
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-7xl font-black">
                        {new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={() => {
                                onSalir();
                                if (document.fullscreenElement) {
                                    document.exitFullscreen();
                                }
                            }}
                            className="px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 text-xl font-semibold"
                        >
                            Salir
                        </button>
                    </div>
                </div>
            </div>

            {/* Indicador de vista */}
            <div className="flex justify-center gap-4 py-4">
                {['Ranking', 'Meta', 'Tendencia', 'Operaciones', 'Empleado Mes'].map((label, idx) => (
                    <div
                        key={idx}
                        className={`w-4 h-4 rounded-full transition-all ${vistaKiosko === idx ? 'bg-white scale-150' : 'bg-white bg-opacity-30'}`}
                    />
                ))}
            </div>

            {/* VISTA 0: RANKING */}
            {vistaKiosko === 0 && (
                <div className="p-12 animate-fade-in">
                    <h2 className="text-7xl font-black mb-8 text-center">TOP 5 DEL DÍA</h2>
                    <div className="space-y-6">
                        {rankingHoy.length === 0 ? (
                            <div className="text-center text-4xl opacity-75">No hay producción completada hoy</div>
                        ) : rankingHoy.map((emp, idx) => (
                            <div
                                key={emp.id}
                                className="flex items-center gap-8 p-8 bg-white bg-opacity-10 rounded-3xl backdrop-blur-lg transform hover:scale-105 transition-all"
                                style={{ borderLeft: `8px solid ${coloresMedalla[idx]}` }}
                            >
                                <div className="text-8xl">{medallas[idx]}</div>
                                <div className="flex-1">
                                    <div className="text-5xl font-black">{emp.nombre}</div>
                                    <div className="text-3xl opacity-75 mt-2">ID: {emp.id} - {emp.operaciones} operaciones</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-7xl font-black" style={{ color: coloresMedalla[idx] }}>
                                        {emp.piezas}
                                    </div>
                                    <div className="text-3xl opacity-75">piezas</div>
                                    <div className="text-4xl font-bold mt-2 text-green-400">
                                        ${Number(emp.monto).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* VISTA 1: META DIARIA */}
            {vistaKiosko === 1 && (
                <div className="p-12 animate-fade-in flex flex-col items-center justify-center" style={{ height: 'calc(100vh - 250px)' }}>
                    <h2 className="text-7xl font-black mb-12 text-center">META DEL DÍA</h2>
                    <div className="w-full max-w-5xl">
                        <div className="flex justify-between items-end mb-6">
                            <div className="text-8xl font-black">{completadasHoy}</div>
                            <div className="text-6xl opacity-75">/ {metaDiaria}</div>
                        </div>
                        <div className="w-full h-24 bg-white bg-opacity-20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-1000 flex items-center justify-end pr-8"
                                style={{ width: `${progresoMeta}%` }}
                            >
                                <span className="text-4xl font-black">{Math.round(progresoMeta)}%</span>
                            </div>
                        </div>
                        {progresoMeta >= 100 ? (
                            <div className="text-center mt-12 text-6xl animate-bounce">
                                META ALCANZADA
                            </div>
                        ) : (
                            <div className="text-center mt-12 text-5xl opacity-75">
                                Faltan {Math.max(0, metaDiaria - completadasHoy)} piezas para la meta
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* VISTA 2: TENDENCIA 7 DÍAS */}
            {vistaKiosko === 2 && (
                <div className="p-12 animate-fade-in">
                    <h2 className="text-7xl font-black mb-12 text-center">ÚLTIMOS 7 DÍAS</h2>
                    <div className="grid grid-cols-7 gap-6 items-end" style={{ height: '500px' }}>
                        {ultimos7Dias.map((dia, idx) => {
                            const maxPiezas = Math.max(...ultimos7Dias.map(d => d.piezas), 1);
                            const altura = (dia.piezas / maxPiezas) * 100;
                            return (
                                <div key={idx} className="flex flex-col items-center">
                                    <div className="text-5xl font-black mb-4">{dia.piezas}</div>
                                    <div
                                        className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-3xl transition-all duration-1000"
                                        style={{ height: `${altura}%`, minHeight: '60px' }}
                                    />
                                    <div className="text-3xl mt-4 font-semibold">{dia.dia}</div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-center mt-12 text-4xl opacity-75">
                        Promedio: {Math.round(ultimos7Dias.reduce((sum, d) => sum + d.piezas, 0) / 7)} piezas/día
                    </div>
                </div>
            )}

            {/* VISTA 3: TOP OPERACIONES */}
            {vistaKiosko === 3 && (
                <div className="p-12 animate-fade-in">
                    <h2 className="text-7xl font-black mb-12 text-center">OPERACIONES MÁS REALIZADAS HOY</h2>
                    <div className="space-y-6">
                        {topOperaciones.length === 0 ? (
                            <div className="text-center text-4xl opacity-75">No hay operaciones completadas hoy</div>
                        ) : topOperaciones.map((op, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-8 p-8 bg-white bg-opacity-10 rounded-3xl backdrop-blur-lg"
                            >
                                <div className="text-7xl font-black text-purple-400">#{idx + 1}</div>
                                <div className="flex-1">
                                    <div className="text-5xl font-black">{op.nombre}</div>
                                    <div className="text-3xl opacity-75 mt-2">{op.prenda}</div>
                                </div>
                                <div className="text-7xl font-black text-blue-400">{op.cantidad}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* VISTA 4: EMPLEADO DEL MES */}
            {vistaKiosko === 4 && (() => {
                const inicioMes = new Date();
                inicioMes.setDate(1);
                inicioMes.setHours(0, 0, 0, 0);
                const inicioMesStr = inicioMes.toISOString().split('T')[0];

                const asignacionesMes = asignaciones.filter(a => {
                    if (!a.completado || !a.fecha_terminado) return false;
                    const fechaTerm = a.fecha_terminado.split('T')[0];
                    return fechaTerm >= inicioMesStr;
                });

                const empleadoMes = empleados.map(emp => {
                    const asigs = asignacionesMes.filter(a => Number(a.empleado_id) === Number(emp.id));
                    const piezas = asigs.reduce((sum, a) => sum + Number(a.cantidad || 0), 0);
                    const monto = asigs.reduce((sum, a) => sum + Number(a.monto || 0), 0);
                    const diasTrabajados = new Set(asigs.map(a => a.fecha_terminado.split('T')[0])).size;
                    return { ...emp, piezas, monto, operaciones: asigs.length, diasTrabajados };
                }).filter(e => e.piezas > 0).sort((a, b) => b.piezas - a.piezas)[0];

                if (!empleadoMes) {
                    return (
                        <div className="p-12 animate-fade-in flex items-center justify-center" style={{ height: 'calc(100vh - 250px)' }}>
                            <div className="text-center">
                                <div className="text-9xl mb-8">🏆</div>
                                <h2 className="text-7xl font-black">EMPLEADO DEL MES</h2>
                                <p className="text-4xl opacity-75 mt-8">Sin datos del mes actual</p>
                            </div>
                        </div>
                    );
                }

                const promedioDiario = Math.round(empleadoMes.piezas / Math.max(1, empleadoMes.diasTrabajados));

                return (
                    <div className="p-12 animate-fade-in">
                        <div className="text-center mb-12">
                            <div className="text-9xl mb-6 animate-bounce">👑</div>
                            <h2 className="text-7xl font-black text-yellow-400">EMPLEADO DEL MES</h2>
                            <p className="text-4xl opacity-75 mt-4">
                                {new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>

                        <div className="max-w-6xl mx-auto">
                            <div className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 rounded-3xl p-12 text-gray-900">
                                <div className="text-center mb-8">
                                    <div className="text-8xl font-black">{empleadoMes.nombre}</div>
                                    <div className="text-4xl mt-4 opacity-75">ID: {empleadoMes.id}</div>
                                </div>

                                <div className="grid grid-cols-3 gap-8 mt-12">
                                    <div className="text-center bg-white bg-opacity-20 rounded-2xl p-8">
                                        <div className="text-7xl font-black">{empleadoMes.piezas}</div>
                                        <div className="text-3xl mt-2 opacity-75">Piezas Totales</div>
                                    </div>
                                    <div className="text-center bg-white bg-opacity-20 rounded-2xl p-8">
                                        <div className="text-7xl font-black">{promedioDiario}</div>
                                        <div className="text-3xl mt-2 opacity-75">Promedio Diario</div>
                                    </div>
                                    <div className="text-center bg-white bg-opacity-20 rounded-2xl p-8">
                                        <div className="text-7xl font-black">${Number(empleadoMes.monto).toLocaleString()}</div>
                                        <div className="text-3xl mt-2 opacity-75">Total Ganado</div>
                                    </div>
                                </div>

                                <div className="text-center mt-12">
                                    <div className="text-5xl font-bold">
                                        {empleadoMes.operaciones} operaciones - {empleadoMes.diasTrabajados} días trabajados
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mt-12 text-5xl opacity-75">
                                Felicitaciones por tu excelente desempeño
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default PantallaTaller;