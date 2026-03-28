import React from 'react';
import { Zap, TrendingDown, Award, Lightbulb, AlertTriangle, CheckCircle2 } from 'lucide-react';

const PanelCuellosBottella = ({ analisis }) => {
  return (
    <div className="card overflow-hidden">
      {/* Header oscuro */}
      <div className="bg-sidebar-bg px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-600/20 border border-brand-600/30 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-sm">Análisis de Eficiencia</h2>
            <p className="text-slate-500 text-xs mt-0.5">Cuellos de botella y productividad</p>
          </div>
        </div>
        {/* Stats resumen */}
        {analisis.estadisticas && (
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-center">
              <p className="text-emerald-400 text-lg font-bold">{analisis.estadisticas.operacionesAltas}</p>
              <p className="text-slate-500 text-xs">Alta ef.</p>
            </div>
            <div className="text-center">
              <p className="text-amber-400 text-lg font-bold">{analisis.estadisticas.operacionesMedias}</p>
              <p className="text-slate-500 text-xs">Media ef.</p>
            </div>
            <div className="text-center">
              <p className="text-rose-400 text-lg font-bold">{analisis.estadisticas.operacionesBajas}</p>
              <p className="text-slate-500 text-xs">Baja ef.</p>
            </div>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {/* Cuellos de botella */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-semibold text-slate-800">Cuellos de Botella</h3>
          </div>
          {analisis.operacionesLentas.length > 0 ? (
            <div className="space-y-2">
              {analisis.operacionesLentas.map((op, idx) => (
                <div key={idx} className="flex items-start gap-2 px-3 py-2.5 bg-rose-50 border border-rose-100 rounded-xl">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-rose-900 truncate">{op.operacion}</p>
                    <p className="text-xs text-rose-600 mt-0.5">
                      {op.tiempoPromedio} días/pz · {op.totalCompletadas} pzs
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
              <p className="text-sm text-slate-600 font-medium">Sin cuellos de botella</p>
              {analisis.eficienciaOperaciones?.length > 0 && (
                <div className="mt-3 w-full space-y-1.5">
                  {analisis.eficienciaOperaciones
                    .sort((a, b) => parseFloat(b.tiempoPromedio) - parseFloat(a.tiempoPromedio))
                    .slice(0, 3)
                    .map((op, idx) => (
                      <div key={idx} className="flex justify-between text-xs px-2 py-1.5 bg-slate-50 rounded-lg">
                        <span className="text-slate-600 truncate mr-2">{op.operacion}</span>
                        <span className="text-slate-400 font-mono flex-shrink-0">{op.tiempoPromedio}d/pz</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Top productividad */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-800">Top Productividad (7 días)</h3>
          </div>
          {analisis.productividadEmpleados.length > 0 ? (
            <div className="space-y-2">
              {analisis.productividadEmpleados.map((emp, idx) => {
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div key={idx} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl">
                    <span className="text-base flex-shrink-0">{medals[idx] || `${idx + 1}.`}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{emp.nombre}</p>
                      <p className="text-xs text-slate-400">{emp.piezas} piezas completadas</p>
                    </div>
                    <span className="text-sm font-bold text-brand-600 flex-shrink-0">{emp.piezas}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">Sin datos en los últimos 7 días</p>
          )}
        </div>

        {/* Recomendaciones */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-slate-800">Recomendaciones</h3>
          </div>
          <div className="space-y-2.5">
            {analisis.operacionesLentas.length > 0 && (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-rose-50 border border-rose-100 rounded-xl">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-rose-700 leading-snug">
                  <span className="font-semibold">Acción urgente:</span>{' '}
                  {analisis.operacionesLentas.length} operación(es) con retrasos. Considera capacitación o redistribución.
                </p>
              </div>
            )}
            {analisis.productividadEmpleados.length > 0 && (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                <Award className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-700 leading-snug">
                  <span className="font-semibold">{analisis.productividadEmpleados[0].nombre}</span> es tu empleado más productivo. Replica su metodología.
                </p>
              </div>
            )}
            {analisis.operacionesLentas.length === 0 && analisis.eficienciaOperaciones?.length > 0 && (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-brand-50 border border-brand-100 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-brand-700 leading-snug">
                  Todas las operaciones están dentro de parámetros eficientes.
                </p>
              </div>
            )}
            <div className="flex items-start gap-2 px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">
              <Zap className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-snug">
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
