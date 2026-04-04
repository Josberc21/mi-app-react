// src/components/operario/VistaPanelOperario.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock, CheckCircle2, AlertCircle, TrendingUp, RefreshCw,
  Package, DollarSign, Zap, Hand, ChevronDown, ChevronUp,
  Calendar, XCircle, Hourglass
} from 'lucide-react';
import {
  obtenerMisAsignaciones,
  obtenerMisEstadisticasHoy,
  obtenerMiNomina,
  reportarProgreso,
} from '../../services/operarioService';

// ─── Utilidad: formato de fecha ───────────────────────────────────────────────
const formatMes = (mesStr) => {
  if (!mesStr) return '—';
  const [year, month] = mesStr.split('-');
  const fecha = new Date(parseInt(year), parseInt(month) - 1, 1);
  return fecha.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
};

// ─── Modal levantar la mano ───────────────────────────────────────────────────
const ModalLevantarMano = ({ asignacion, onClose, onConfirm, cargando }) => {
  const [cantidad, setCantidad] = useState(asignacion.cantidad.toString());
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(cantidad);
    if (isNaN(val) || val <= 0 || val > asignacion.cantidad) {
      setError(`Ingresa un número entre 1 y ${asignacion.cantidad}`);
      return;
    }
    setError('');
    onConfirm(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm animate-fade-in">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Hand className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Reportar avance</h3>
              <p className="text-slate-500 text-xs mt-0.5">{asignacion.operacion_nombre}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 mb-5 space-y-1">
            <p className="text-xs text-slate-500">Prenda: <span className="font-medium text-slate-700">{asignacion.prenda_ref}</span></p>
            <p className="text-xs text-slate-500">Orden: <span className="font-medium text-slate-700">#{asignacion.numero_orden}</span></p>
            <p className="text-xs text-slate-500">Asignadas: <span className="font-bold text-slate-900">{asignacion.cantidad} piezas</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                ¿Cuántas completaste?
              </label>
              <input
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                min="1"
                max={asignacion.cantidad}
                className="input-base text-center text-xl font-bold"
                autoFocus
              />
              <p className="text-xs text-slate-400 mt-1.5 text-center">
                Máximo {asignacion.cantidad} piezas
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={cargando}
                className="flex-1 btn-secondary py-2.5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={cargando}
                className="flex-1 btn-primary py-2.5"
              >
                {cargando ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    <Hand className="w-4 h-4" />
                    Levantar la mano
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
const VistaPanelOperario = ({ currentUser, mostrarExito, mostrarError }) => {
  const empleadoId = currentUser?.empleado_id;

  const [asignaciones, setAsignaciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState({ totalPiezas: 0, totalMonto: 0, totalOperaciones: 0 });
  const [nomina, setNomina] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());

  // Secciones colapsables
  const [secciones, setSecciones] = useState({ pendientes: true, reportes: true, nomina: false });
  const toggleSeccion = (key) => setSecciones(prev => ({ ...prev, [key]: !prev[key] }));

  // Modal levantar la mano
  const [modalAsig, setModalAsig] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // ── sin empleado_id vinculado ──
  if (!empleadoId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-card-lg p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Perfil no vinculado</h2>
          <p className="text-sm text-slate-500">
            Tu usuario no está vinculado a un empleado. Contacta al administrador.
          </p>
        </div>
      </div>
    );
  }

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const [asigs, stats, nom] = await Promise.all([
        obtenerMisAsignaciones(empleadoId),
        obtenerMisEstadisticasHoy(empleadoId),
        obtenerMiNomina(empleadoId),
      ]);
      setAsignaciones(asigs);
      setEstadisticas(stats);
      setNomina(nom);
      setUltimaActualizacion(new Date());
    } catch (err) {
      console.error('Error cargando panel operario:', err);
      mostrarError('No se pudo cargar tu información.');
    } finally {
      setLoading(false);
    }
  }, [empleadoId]);

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 60000); // auto-refresh 1 min
    return () => clearInterval(interval);
  }, [cargarDatos]);

  const handleLevantarMano = async (cantidadReportada) => {
    if (!modalAsig) return;
    try {
      setEnviando(true);
      await reportarProgreso(modalAsig.id, cantidadReportada);
      mostrarExito(`Reporte enviado: ${cantidadReportada} de ${modalAsig.cantidad} piezas. Esperando aprobación.`);
      setModalAsig(null);
      await cargarDatos();
    } catch (err) {
      mostrarError(err.message || 'Error al enviar el reporte');
    } finally {
      setEnviando(false);
    }
  };

  // Clasificación
  const pendientes = asignaciones.filter(a => !a.completado && a.estado_reporte !== 'pendiente');
  const enEspera   = asignaciones.filter(a => !a.completado && a.estado_reporte === 'pendiente');
  const rechazadas = asignaciones.filter(a => !a.completado && a.estado_reporte === 'rechazado');
  const hoy        = new Date().toISOString().split('T')[0];
  const completadasHoy = asignaciones.filter(a => a.completado && a.fecha_terminado?.startsWith(hoy));
  const minutosDesdeAct = Math.floor((new Date() - ultimaActualizacion) / 60000);

  // Nómina del mes actual
  const mesActual = new Date().toISOString().substring(0, 7);
  const nominaMesActual = nomina.find(n => n.mes?.startsWith(mesActual));

  return (
    <>
      {modalAsig && (
        <ModalLevantarMano
          asignacion={modalAsig}
          onClose={() => setModalAsig(null)}
          onConfirm={handleLevantarMano}
          cargando={enviando}
        />
      )}

      <div className="space-y-5 animate-slide-up">

        {/* ── Stats del día ── */}
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
            <p className="text-xs text-slate-400 mt-0.5">Completadas</p>
          </div>
          <div className="bg-emerald-600 rounded-2xl p-4 text-center shadow-card">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">${estadisticas.totalMonto.toLocaleString()}</p>
            <p className="text-xs text-emerald-200 mt-0.5">Ganado hoy</p>
          </div>
        </div>

        {/* ── Reportes en espera de aprobación ── */}
        {enEspera.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hourglass className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-semibold text-amber-800">Esperando aprobación</h2>
              </div>
              <span className="bg-amber-200 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {enEspera.length}
              </span>
            </div>
            <div className="divide-y divide-amber-100">
              {enEspera.map(a => (
                <div key={a.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{a.operacion_nombre}</p>
                    <p className="text-xs text-slate-500">{a.prenda_ref} · {a.cantidad_reportada} de {a.cantidad} pzs reportadas</p>
                  </div>
                  <span className="badge-amber text-[11px] flex-shrink-0">Pendiente admin</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Reportes rechazados ── */}
        {rechazadas.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-semibold text-rose-800">Reportes rechazados — puedes volver a reportar</h2>
            </div>
            <div className="divide-y divide-rose-100">
              {rechazadas.map(a => (
                <div key={a.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{a.operacion_nombre}</p>
                    <p className="text-xs text-slate-500">{a.prenda_ref} · {a.cantidad} pzs</p>
                  </div>
                  <button
                    onClick={() => setModalAsig(a)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <Hand className="w-3.5 h-3.5" />
                    Reportar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Asignaciones pendientes ── */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <button
            onClick={() => toggleSeccion('pendientes')}
            className="w-full px-5 py-4 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-slate-800">Mis pendientes</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge-amber">{pendientes.length}</span>
              {secciones.pendientes ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </button>

          {secciones.pendientes && (
            pendientes.length === 0 ? (
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
                    <div className="flex items-center justify-between gap-2 mt-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {a.color && <span className="badge-slate text-xs">{a.color}</span>}
                        {a.talla && <span className="badge-slate text-xs">T. {a.talla}</span>}
                        <span className="badge-green text-xs font-semibold">${parseFloat(a.monto).toLocaleString()}</span>
                        {a.numero_orden !== '-' && (
                          <span className="text-xs text-slate-300">Orden #{a.numero_orden}</span>
                        )}
                      </div>
                      <button
                        onClick={() => setModalAsig(a)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                      >
                        <Hand className="w-3.5 h-3.5" />
                        Levantar la mano
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* ── Completadas hoy ── */}
        {completadasHoy.length > 0 && (
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-semibold text-slate-800">Completadas hoy</h2>
              </div>
              <span className="badge-green">{completadasHoy.length}</span>
            </div>
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
                  <p className="text-xs text-slate-400">+{completadasHoy.length - 5} más completadas hoy</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Mi nómina ── */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <button
            onClick={() => toggleSeccion('nomina')}
            className="w-full px-5 py-4 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-semibold text-slate-800">Mi nómina</h2>
            </div>
            <div className="flex items-center gap-2">
              {nominaMesActual && (
                <span className="text-sm font-bold text-emerald-600">
                  ${parseFloat(nominaMesActual.total_nomina || 0).toLocaleString()}
                </span>
              )}
              {secciones.nomina ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </button>

          {secciones.nomina && (
            <div>
              {/* Resumen mes actual */}
              {nominaMesActual && (
                <div className="px-5 py-4 bg-emerald-50 border-b border-emerald-100">
                  <p className="text-xs text-emerald-600 font-medium mb-1 capitalize">{formatMes(nominaMesActual.mes)} — Mes actual</p>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <div className="text-center">
                      <p className="text-xl font-bold text-emerald-700">${parseFloat(nominaMesActual.total_nomina || 0).toLocaleString()}</p>
                      <p className="text-[11px] text-emerald-500">Total a pagar</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-slate-700">{nominaMesActual.piezas_totales}</p>
                      <p className="text-[11px] text-slate-400">Piezas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-slate-700">{nominaMesActual.operaciones_completadas}</p>
                      <p className="text-[11px] text-slate-400">Operaciones</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Historial meses anteriores */}
              {nomina.filter(n => !n.mes?.startsWith(mesActual)).length > 0 && (
                <div className="divide-y divide-slate-100">
                  {nomina
                    .filter(n => !n.mes?.startsWith(mesActual))
                    .map(n => (
                      <div key={n.mes} className="px-5 py-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <p className="text-sm text-slate-600 capitalize">{formatMes(n.mes)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">${parseFloat(n.total_nomina || 0).toLocaleString()}</p>
                          <p className="text-[11px] text-slate-400">{n.piezas_totales} pzs</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {nomina.length === 0 && (
                <div className="flex flex-col items-center py-8 text-center px-6">
                  <Package className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Aún no hay operaciones aprobadas este mes</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pb-2">
          <button
            onClick={cargarDatos}
            disabled={loading}
            className="flex items-center gap-1.5 mx-auto text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizado hace {minutosDesdeAct === 0 ? 'menos de 1' : minutosDesdeAct} min
          </button>
        </div>
      </div>
    </>
  );
};

export default VistaPanelOperario;
