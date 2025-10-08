// src/components/nomina/ResumenNomina.jsx
import React from 'react';
import { Download } from 'lucide-react';

const ResumenNomina = ({ 
  nominaFiltrada, 
  filtroFechaInicio, 
  filtroFechaFin,
  onExportar,
  children  // 👈 IMPORTANTE: Recibir children
}) => {
  const totalGeneral = nominaFiltrada.reduce((sum, r) => sum + r.monto, 0);
  const totalOperaciones = nominaFiltrada.reduce((sum, e) => sum + e.operaciones, 0);
  const totalPiezas = nominaFiltrada.reduce((sum, e) => sum + e.piezas, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header con botón exportar */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Reporte de Nómina Detallado</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={onExportar}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar a Excel
          </button>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total General del Período</p>
            <p className="text-3xl font-bold text-green-600">
              ${totalGeneral.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 👇 AQUÍ SE RENDERIZAN LAS TABLAS DE EMPLEADOS */}
      {children}

      {/* Total general final */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg mt-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-lg opacity-90 font-semibold">TOTAL GENERAL PERÍODO</p>
            <p className="text-sm opacity-75">
              Del {new Date(filtroFechaInicio).toLocaleDateString()} al {new Date(filtroFechaFin).toLocaleDateString()}
            </p>
            <div className="mt-2 flex gap-4 text-sm">
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded">
                {nominaFiltrada.length} empleados
              </span>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded">
                {totalOperaciones} operaciones
              </span>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded">
                {totalPiezas} piezas
              </span>
            </div>
          </div>
          <p className="text-5xl font-bold">
            ${totalGeneral.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResumenNomina;