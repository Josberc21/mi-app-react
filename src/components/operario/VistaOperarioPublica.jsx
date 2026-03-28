// src/components/operario/VistaOperarioPublica.jsx
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, TrendingUp, RefreshCw, Package, DollarSign, Zap } from 'lucide-react';
import { useParams } from 'react-router-dom';
import {
  obtenerEmpleadoPublico,
  obtenerAsignacionesEmpleadoPublico,
  obtenerEstadisticasDiaOperario
} from '../../services/operarioPublicoService';
import Loading from '../common/Loading';

const VistaOperarioPublica = () => {
  const { id } = useParams();
  const empleadoId = id ? parseInt(id, 10) : null;

  const [empleado, setEmpleado] = useState(null);
  const [asignaciones, setAsignaciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState({ totalPiezas: 0, totalMonto: 0, totalOperaciones: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());

  if (!empleadoId || isNaN(empleadoId)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-card-lg p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">ID Inválido</h2>
          <p className="text-sm text-slate-500">La URL no contiene un ID de empleado válido.</p>
          <p className="text-xs text-slate-400 mt-2">Ejemplo: /operario/4</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 30000);
    return () => clearInterval(interval);
  }, [empleadoId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      const [empData, asigsData, statsData] = await Promise.all([
        obtenerEmpleadoPublico(empleadoId),
        obtenerAsignacionesEmpleadoPublico(empleadoId),
        obtenerEstadisticasDiaOperario(empleadoId)
      ]);
      setEmpleado(empData);
      setAsignaciones(asigsData);
      setEstadisticas(statsData);
      setUltimaActualizacion(new Date());
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('No se pudo cargar la información. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !empleado) {
    return (
      <div className="min-h-screen bg-sidebar-bg flex items-center justify-center">
        <Loading mensaje="Cargando tus asignaciones..." />
      </div>
    );
  }

  if (error && !empleado) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-card-lg p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Error de conexión</h2>
          <p className="text-sm text-slate-500 mb-5">{error}</p>
          <button onClick={cargarDatos} className="btn-primary w-full">Reintentar</button>
        </div>
      </div>
    );
  }

  if (!empleado && !loading && !error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-card-lg p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">Empleado no encontrado</h2>
          <p className="text-sm text-slate-500 mb-5">
            Este código QR no corresponde a ningún empleado activo.
          </p>
          <button onClick={cargarDatos} className="btn-primary w-full">Reintentar</button>
        </div>
      </div>
    );
  }

  const pendientes = asignaciones.filter(a => !a.completado);
  const hoy = new Date().toISOString().split('T')[0];
  const completadasHoy = asignaciones.filter(a =>
    a.completado && a.fecha_terminado?.startsWith(hoy)
  );
  const minutosDesdeActualizacion = Math.floor((new Date() - ultimaActualizacion) / 60000);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header oscuro sticky */}
      <div className="bg-sidebar-bg sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
              {empleado?.nombre?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="text-white font-semibold text-base leading-tight">{empleado?.nombre}</p>
              <p className="text-slate-400 text-xs">ID #{empleadoId}</p>
            </div>
          </div>
          <button
            onClick={cargarDatos}
            disabled={loading}
            className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40"
            title="Actualizar"
          >
            <RefreshCw className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-5 space-y-4">
        {/* Stats del día */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-card">
            <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-brand-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{estadisticas.totalPiezas}</p>
            <p className="text-xs text-slate-400 mt-0.5">Piezas hoy</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-card">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Zap className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{estadisticas.totalOperaciones}</p>
            <p className="text-xs text-slate-400 mt-0.5">Operaciones</p>
          </div>
          <div className="bg-emerald-600 rounded-2xl p-4 text-center shadow-card">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">${estadisticas.totalMonto.toLocaleString()}</p>
            <p className="text-xs text-emerald-200 mt-0.5">Ganado hoy</p>
          </div>
        </div>

        {/* Pendientes */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-slate-800">Pendientes</h2>
            </div>
            <span className="badge-amber">{pendientes.length}</span>
          </div>

          {pendientes.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center px-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <p className="text-base font-bold text-slate-800">¡Todo al día!</p>
              <p className="text-sm text-slate-400 mt-1">No tienes asignaciones pendientes</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendientes.map(a => (
                <div key={a.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-slate-900 leading-tight">{a.operacion_nombre}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{a.prenda_ref}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold text-slate-900">{a.cantidad}</p>
                      <p className="text-xs text-slate-400">piezas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="badge-slate text-xs">{a.color}</span>
                    <span className="badge-slate text-xs">T. {a.talla}</span>
                    <span className="badge-green text-xs font-semibold">${parseFloat(a.monto).toLocaleString()}</span>
                    {a.numero_orden && (
                      <span className="text-xs text-slate-300">Orden {a.numero_orden}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completadas hoy */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-semibold text-slate-800">Completadas hoy</h2>
            </div>
            <span className="badge-green">{completadasHoy.length}</span>
          </div>

          {completadasHoy.length === 0 ? (
            <div className="text-center py-8 px-6">
              <Package className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Aún no has completado operaciones hoy</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {completadasHoy.slice(0, 5).map(a => (
                <div key={a.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{a.operacion_nombre}</p>
                    <p className="text-xs text-slate-400">{a.cantidad} pzs · {a.prenda_ref}</p>
                  </div>
                  <p className="text-sm font-bold text-emerald-600 flex-shrink-0">
                    ${parseFloat(a.monto).toLocaleString()}
                  </p>
                </div>
              ))}
              {completadasHoy.length > 5 && (
                <div className="px-5 py-3 text-center">
                  <p className="text-xs text-slate-400">+{completadasHoy.length - 5} operaciones más</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-2">
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Actualizado hace {minutosDesdeActualizacion === 0 ? 'menos de 1' : minutosDesdeActualizacion} min · auto-refresh 30s
          </p>
        </div>
      </div>
    </div>
  );
};

export default VistaOperarioPublica;
