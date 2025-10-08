// src/components/operario/VistaOperarioPublica.jsx
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, TrendingUp, RefreshCw } from 'lucide-react';
import { useParams } from 'react-router-dom';
import {
  obtenerEmpleadoPublico,
  obtenerAsignacionesEmpleadoPublico,
  obtenerEstadisticasDiaOperario
} from '../../services/operarioPublicoService';
import Loading from '../common/Loading';

const VistaOperarioPublica = () => {
  // Obtener el ID de la URL
  const { id } = useParams();
  const empleadoId = id ? parseInt(id, 10) : null;

  const [empleado, setEmpleado] = useState(null);
  const [asignaciones, setAsignaciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState({ totalPiezas: 0, totalMonto: 0, totalOperaciones: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());

  // Validación del ID
  if (!empleadoId || isNaN(empleadoId)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ID Inválido</h2>
          <p className="text-gray-600 mb-4">La URL no contiene un ID de empleado válido</p>
          <p className="text-sm text-gray-500">Ejemplo: /operario/4</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    cargarDatos();

    // Auto-refresh cada 30 segundos
    const interval = setInterval(() => {
      cargarDatos();
    }, 30000);

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

  // Estado de carga inicial
  if (loading && !empleado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <Loading mensaje="Cargando tus asignaciones..." />
      </div>
    );
  }

  // Error de conexión u otro problema real
  if (error && !empleado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={cargarDatos}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Si el empleado no existe o está inactivo
  if (!empleado && !loading && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-600 to-gray-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Empleado no encontrado</h2>
          <p className="text-gray-600 mb-6">
            El código QR o la dirección que intentas abrir no corresponde a ningún empleado activo.
          </p>
          <button
            onClick={cargarDatos}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Reintentar
          </button>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 text-white">
      {/* Header con información del empleado */}
      <div className="bg-black bg-opacity-30 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{empleado?.nombre}</h1>
              <p className="text-lg opacity-90">ID: {empleadoId}</p>
            </div>
            <button
              onClick={cargarDatos}
              disabled={loading}
              className="p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all disabled:opacity-50"
              title="Actualizar"
            >
              <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Estadísticas del día */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2" />
            <p className="text-3xl font-bold">{estadisticas.totalPiezas}</p>
            <p className="text-sm opacity-75">Piezas Hoy</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-3xl font-bold">{estadisticas.totalOperaciones}</p>
            <p className="text-sm opacity-75">Operaciones</p>
          </div>
          <div className="bg-green-500 bg-opacity-30 backdrop-blur-lg rounded-xl p-4 text-center border-2 border-green-400">
            <p className="text-sm opacity-75 mb-1">Ganado Hoy</p>
            <p className="text-2xl font-bold">${estadisticas.totalMonto.toLocaleString()}</p>
          </div>
        </div>

        {/* Pendientes */}
        <div className="bg-yellow-500 bg-opacity-20 backdrop-blur-lg rounded-xl p-6 border-2 border-yellow-400">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="w-7 h-7" />
              Pendientes ({pendientes.length})
            </h2>
          </div>

          {pendientes.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
              <p className="text-2xl font-bold">¡Todo al día!</p>
              <p className="text-lg opacity-75">No tienes asignaciones pendientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendientes.map(a => (
                <div
                  key={a.id}
                  className="bg-white bg-opacity-20 rounded-lg p-4 border-l-4 border-yellow-400"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-2xl font-bold">{a.operacion_nombre}</p>
                      <p className="text-lg opacity-90">{a.prenda_ref}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">{a.cantidad}</p>
                      <p className="text-sm opacity-75">piezas</p>
                    </div>
                  </div>

                  <div className="flex gap-2 text-sm">
                    <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full">
                      {a.color}
                    </span>
                    <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full">
                      Talla {a.talla}
                    </span>
                    <span className="px-3 py-1 bg-green-500 bg-opacity-30 rounded-full font-semibold">
                      ${parseFloat(a.monto).toLocaleString()}
                    </span>
                  </div>

                  {a.numero_orden && (
                    <p className="text-xs opacity-60 mt-2">Orden: {a.numero_orden}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completadas Hoy */}
        <div className="bg-green-500 bg-opacity-20 backdrop-blur-lg rounded-xl p-6 border-2 border-green-400">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="w-7 h-7" />
            Completadas Hoy ({completadasHoy.length})
          </h2>

          {completadasHoy.length === 0 ? (
            <p className="text-center text-lg opacity-75 py-4">
              Aún no has completado operaciones hoy
            </p>
          ) : (
            <div className="space-y-2">
              {completadasHoy.slice(0, 5).map(a => (
                <div
                  key={a.id}
                  className="bg-white bg-opacity-10 rounded-lg p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold">{a.operacion_nombre}</p>
                    <p className="text-sm opacity-75">{a.cantidad} pzs • {a.prenda_ref}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-300">
                      ${parseFloat(a.monto).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}

              {completadasHoy.length > 5 && (
                <p className="text-center text-sm opacity-75 pt-2">
                  + {completadasHoy.length - 5} operaciones más
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4 text-center">
          <p className="text-sm opacity-75 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Actualizado hace {minutosDesdeActualizacion === 0 ? 'menos de 1' : minutosDesdeActualizacion} min
          </p>
          <p className="text-xs opacity-60 mt-1">
            Se actualiza automáticamente cada 30 segundos
          </p>
        </div>
      </div>
    </div>
  );
};

export default VistaOperarioPublica;