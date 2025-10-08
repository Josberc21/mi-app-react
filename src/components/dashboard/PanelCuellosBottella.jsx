// src/components/dashboard/PanelCuellosBottella.jsx
import React from 'react';
import { Zap, TrendingDown, Award, Info } from 'lucide-react';

const PanelCuellosBottella = ({ analisis }) => {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-8 h-8" />
        <h2 className="text-2xl font-bold">Análisis de Eficiencia del Taller</h2>
      </div>

      {/* 🆕 INFORMACIÓN DE DEBUG */}
      {analisis.estadisticas && (
        <div className="mb-4 bg-white bg-opacity-10 rounded-lg p-3 text-sm">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4" />
            <span className="font-semibold">Estado del análisis:</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="opacity-75">Operaciones analizadas:</span>
              <span className="font-bold ml-2">{analisis.estadisticas.totalOperacionesAnalizadas}</span>
            </div>
            <div>
              <span className="opacity-75">Alta eficiencia:</span>
              <span className="font-bold ml-2 text-green-300">{analisis.estadisticas.operacionesAltas}</span>
            </div>
            <div>
              <span className="opacity-75">Media eficiencia:</span>
              <span className="font-bold ml-2 text-yellow-300">{analisis.estadisticas.operacionesMedias}</span>
            </div>
            <div>
              <span className="opacity-75">Baja eficiencia:</span>
              <span className="font-bold ml-2 text-red-300">{analisis.estadisticas.operacionesBajas}</span>
            </div>
          </div>
          <p className="mt-2 text-xs opacity-75">
            Asignaciones con fecha de terminación: {analisis.estadisticas.asignacionesConFechaTerminado} de {analisis.estadisticas.asignacionesCompletadasTotal}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* OPERACIONES LENTAS */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-5 h-5" />
            <h3 className="font-bold">Cuellos de Botella</h3>
          </div>
          {analisis.operacionesLentas.length > 0 ? (
            <div className="space-y-2">
              {analisis.operacionesLentas.map((op, idx) => (
                <div key={idx} className="bg-white bg-opacity-20 rounded p-2">
                  <p className="font-semibold text-sm">{op.operacion}</p>
                  <p className="text-xs opacity-90">
                    {op.tiempoPromedio} días/pieza • {op.totalCompletadas} piezas
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p className="text-sm opacity-75 mb-2">✓ No hay operaciones lentas detectadas</p>
              {analisis.eficienciaOperaciones && analisis.eficienciaOperaciones.length > 0 ? (
                <div className="text-xs opacity-60 mt-2 p-2 bg-white bg-opacity-10 rounded">
                  <p className="font-semibold mb-1">Operaciones más lentas (aún eficientes):</p>
                  {analisis.eficienciaOperaciones
                    .sort((a, b) => parseFloat(b.tiempoPromedio) - parseFloat(a.tiempoPromedio))
                    .slice(0, 3)
                    .map((op, idx) => (
                      <div key={idx} className="flex justify-between mt-1">
                        <span>{op.operacion}</span>
                        <span className="font-mono">{op.tiempoPromedio} d/pz</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs opacity-60 italic">
                  No hay suficientes datos históricos para analizar
                </p>
              )}
            </div>
          )}
        </div>

        {/* TOP EMPLEADOS PRODUCTIVOS */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5" />
            <h3 className="font-bold">Top Productividad (7 días)</h3>
          </div>
          {analisis.productividadEmpleados.length > 0 ? (
            <div className="space-y-2">
              {analisis.productividadEmpleados.map((emp, idx) => (
                <div key={idx} className="bg-white bg-opacity-20 rounded p-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">
                      {idx === 0 && '🏆 '}
                      {idx === 1 && '🥈 '}
                      {idx === 2 && '🥉 '}
                      {emp.nombre}
                    </span>
                    <span className="text-lg font-bold">{emp.piezas}</span>
                  </div>
                  <p className="text-xs opacity-90">piezas completadas</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm opacity-75">Sin datos completados en los últimos 7 días</p>
          )}
        </div>

        {/* RECOMENDACIONES */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
          <h3 className="font-bold mb-3">💡 Recomendaciones</h3>
          <div className="space-y-3 text-sm">
            {analisis.operacionesLentas.length > 0 && (
              <div className="bg-red-500 bg-opacity-20 rounded p-2">
                <p className="font-semibold">⚠️ Acción Urgente</p>
                <p className="opacity-90 mt-1">
                  {analisis.operacionesLentas.length} operación(es) causando retrasos. 
                  Considera capacitación o redistribución.
                </p>
              </div>
            )}
            {analisis.productividadEmpleados.length > 0 && (
              <div className="bg-green-500 bg-opacity-20 rounded p-2">
                <p className="font-semibold">✓ Optimización</p>
                <p className="opacity-90 mt-1">
                  {analisis.productividadEmpleados[0].nombre} es tu empleado más productivo. 
                  Considera replicar su metodología.
                </p>
              </div>
            )}
            {analisis.operacionesLentas.length === 0 && analisis.eficienciaOperaciones.length > 0 && (
              <div className="bg-blue-500 bg-opacity-20 rounded p-2">
                <p className="font-semibold">✓ Excelente Desempeño</p>
                <p className="opacity-90 mt-1">
                  Todas las operaciones están dentro de parámetros eficientes. ¡Buen trabajo!
                </p>
              </div>
            )}
            <div className="bg-blue-500 bg-opacity-20 rounded p-2">
              <p className="font-semibold">📊 Balance</p>
              <p className="opacity-90 mt-1">
                Monitorea diariamente para mantener flujo constante en todas las operaciones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelCuellosBottella;