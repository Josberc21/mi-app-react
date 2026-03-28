// src/components/nomina/VistaNomina.jsx
import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import FiltrosNomina from './FiltrosNomina';
import TablaDetalleEmpleado from './TablaDetalleEmpleado';
import ResumenNomina from './ResumenNomina';

const VistaNomina = ({
  asignaciones,
  empleados,
  operaciones,
  prendas,
  mostrarExito,
  mostrarError,
  mostrarAdvertencia
}) => {
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');
  const [nominaFiltrada, setNominaFiltrada] = useState(null);

  // Establecer rangos rápidos
  const setRangoRapido = (dias) => {
    const hoy = new Date();
    const inicio = new Date();
    inicio.setDate(hoy.getDate() - dias);

    setFiltroFechaInicio(inicio.toISOString().split('T')[0]);
    setFiltroFechaFin(hoy.toISOString().split('T')[0]);
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltroFechaInicio('');
    setFiltroFechaFin('');
    setNominaFiltrada(null);
  };

  // Generar reporte de nómina
  const generarReporteNomina = () => {
    if (!filtroFechaInicio || !filtroFechaFin) {
      mostrarAdvertencia('Seleccione un rango de fechas');
      return;
    }

    const reporte = empleados.map(emp => {
      const asignacionesEmp = asignaciones.filter(a => {
        if (!a.completado || !a.fecha_terminado || a.empleado_id !== emp.id) return false;
        const fechaTerm = new Date(a.fecha_terminado);
        const fechaInicio = new Date(filtroFechaInicio);
        const fechaFin = new Date(filtroFechaFin);
        return fechaTerm >= fechaInicio && fechaTerm <= fechaFin;
      });

      const totalPiezas = asignacionesEmp.reduce((sum, a) => sum + a.cantidad, 0);
      const totalMonto = asignacionesEmp.reduce((sum, a) => sum + parseFloat(a.monto || 0), 0);
      const operacionesCompletadas = asignacionesEmp.length;

      return {
        id: emp.id,
        nombre: emp.nombre,
        operaciones: operacionesCompletadas,
        piezas: totalPiezas,
        monto: totalMonto
      };
    }).filter(r => r.monto > 0);

    setNominaFiltrada(reporte);
    
    if (reporte.length > 0) {
      mostrarExito(`Nómina calculada: ${reporte.length} empleados con pagos pendientes`);
    } else {
      mostrarAdvertencia('No hay empleados con pagos en el período seleccionado');
    }
  };

  // Exportar a Excel
  const exportarNominaExcel = () => {
    if (!nominaFiltrada || nominaFiltrada.length === 0) {
      mostrarAdvertencia('No hay datos de nómina para exportar');
      return;
    }

    // Crear hoja resumen
    const datosResumen = nominaFiltrada.map(emp => ({
      'ID Empleado': emp.id,
      'Nombre': emp.nombre,
      'Operaciones Completadas': emp.operaciones,
      'Piezas Totales': emp.piezas,
      'Total a Pagar': emp.monto
    }));

    // Crear hoja detallada
    const datosDetalle = [];
    nominaFiltrada.forEach(emp => {
      const asignacionesEmp = asignaciones.filter(a => {
        if (!a.completado || !a.fecha_terminado || a.empleado_id !== emp.id) return false;
        const fechaTerm = new Date(a.fecha_terminado);
        const fechaInicio = new Date(filtroFechaInicio);
        const fechaFin = new Date(filtroFechaFin);
        return fechaTerm >= fechaInicio && fechaTerm <= fechaFin;
      });

      asignacionesEmp.forEach(a => {
        const op = operaciones.find(o => o.id === a.operacion_id);
        const prenda = prendas.find(p => p.id === a.prenda_id);
        datosDetalle.push({
          'ID Empleado': emp.id,
          'Nombre Empleado': emp.nombre,
          'Fecha Asignada': new Date(a.fecha).toLocaleDateString(),
          'Fecha Terminada': a.fecha_terminado ? new Date(a.fecha_terminado).toLocaleDateString() : '-',
          'Prenda': prenda?.referencia || '-',
          'Operación': op?.nombre || '-',
          'Talla': a.talla,
          'Cantidad': a.cantidad,
          'Valor Unitario': op?.costo || 0,
          'Subtotal': a.monto
        });
      });
    });

    // Crear libro de Excel
    const wb = XLSX.utils.book_new();

    const wsResumen = XLSX.utils.json_to_sheet(datosResumen);
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    const wsDetalle = XLSX.utils.json_to_sheet(datosDetalle);
    XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle');

    // Agregar hoja de totales
    const totalGeneral = nominaFiltrada.reduce((sum, emp) => sum + emp.monto, 0);
    const wsTotales = XLSX.utils.json_to_sheet([
      { 'Concepto': 'Período', 'Valor': `${new Date(filtroFechaInicio).toLocaleDateString()} - ${new Date(filtroFechaFin).toLocaleDateString()}` },
      { 'Concepto': 'Total Empleados', 'Valor': nominaFiltrada.length },
      { 'Concepto': 'Total Operaciones', 'Valor': nominaFiltrada.reduce((sum, e) => sum + e.operaciones, 0) },
      { 'Concepto': 'Total Piezas', 'Valor': nominaFiltrada.reduce((sum, e) => sum + e.piezas, 0) },
      { 'Concepto': 'TOTAL A PAGAR', 'Valor': totalGeneral }
    ]);
    XLSX.utils.book_append_sheet(wb, wsTotales, 'Totales');

    // Descargar
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const nombreArchivo = `Nomina_${filtroFechaInicio}_${filtroFechaFin}.xlsx`;
    saveAs(blob, nombreArchivo);

    mostrarExito(`Nómina exportada: ${nombreArchivo}`);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Nómina</h1>
        <p className="text-slate-500 text-sm mt-0.5">Genera reportes de pago por período</p>
      </div>

      <FiltrosNomina
        filtroFechaInicio={filtroFechaInicio}
        filtroFechaFin={filtroFechaFin}
        onChangeFechaInicio={setFiltroFechaInicio}
        onChangeFechaFin={setFiltroFechaFin}
        onCalcular={generarReporteNomina}
        onLimpiar={limpiarFiltros}
        onRangoRapido={setRangoRapido}
      />

      {nominaFiltrada && nominaFiltrada.length > 0 ? (
        <ResumenNomina nominaFiltrada={nominaFiltrada} filtroFechaInicio={filtroFechaInicio} filtroFechaFin={filtroFechaFin} onExportar={exportarNominaExcel}>
          {nominaFiltrada.map(emp => {
            const asignacionesDetalle = asignaciones.filter(a => {
              if (!a.completado || !a.fecha_terminado || a.empleado_id !== emp.id) return false;
              const fechaTerm  = new Date(a.fecha_terminado);
              const fechaInicio = new Date(filtroFechaInicio);
              const fechaFin   = new Date(filtroFechaFin);
              return fechaTerm >= fechaInicio && fechaTerm <= fechaFin;
            });
            return <TablaDetalleEmpleado key={emp.id} empleado={emp} asignaciones={asignacionesDetalle} operaciones={operaciones} prendas={prendas} />;
          })}
        </ResumenNomina>
      ) : nominaFiltrada && nominaFiltrada.length === 0 ? (
        <div className="card-p flex items-start gap-3 border-l-4 border-amber-400 bg-amber-50">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-amber-800 text-sm font-medium pt-1">
            No hay empleados con pagos en el período seleccionado.
          </p>
        </div>
      ) : (
        <div className="card flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <DollarSign className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">Selecciona un rango de fechas</p>
          <p className="text-slate-400 text-sm mt-1">y haz clic en "Calcular nómina"</p>
        </div>
      )}
    </div>
  );
};

export default VistaNomina;