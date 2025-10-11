import React, { useState } from 'react';
import { Package } from 'lucide-react';
import ModalConfirmar from '../common/ModalConfirmar';
import FormularioRemision from './FormularioRemision';
import TarjetaRemision from './TarjetaRemision';
import TablaTrazabilidad from './TablaTrazabilidad';
import { useModal } from '../../hooks/useModal';
import { crearRemision, eliminarRemision } from '../../services/remisionesService';
import { obtenerFechaHoy } from '../../utils/dateUtils';

const VistaRemisiones = ({ 
  remisiones,
  ordenes, 
  prendas,
  asignaciones,
  operaciones,
  recargarDatos,
  calcularProgresoOrden,
  mostrarExito, 
  mostrarError, 
  mostrarAdvertencia 
}) => {
  const [formRemision, setFormRemision] = useState({
    orden_id: '',
    cantidad_despachada: '',
    fecha_despacho: obtenerFechaHoy(),
    observaciones: ''
  });

  const [remisionesExpandidas, setRemisionesExpandidas] = useState({});
  const modalEliminar = useModal();

  const toggleRemisionExpandida = (remisionId) => {
    setRemisionesExpandidas(prev => ({
      ...prev,
      [remisionId]: !prev[remisionId]
    }));
  };

  const handleSeleccionarOrden = (ordenId) => {
    const orden = ordenes.find(o => o.id === parseInt(ordenId));
    if (!orden) {
      setFormRemision({
        ...formRemision,
        orden_id: '',
        cantidad_despachada: ''
      });
      return;
    }

    const progreso = calcularProgresoOrden(orden);
    const yaDespachadas = remisiones
      .filter(r => r.orden_id === orden.id)
      .reduce((sum, r) => sum + r.cantidad_despachada, 0);
    const disponibles = progreso.completadas - yaDespachadas;

    setFormRemision({
      ...formRemision,
      orden_id: ordenId,
      cantidad_despachada: disponibles > 0 ? disponibles.toString() : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formRemision.orden_id || !formRemision.cantidad_despachada) {
      mostrarAdvertencia('Complete todos los campos obligatorios');
      return;
    }

    const orden = ordenes.find(o => o.id === parseInt(formRemision.orden_id));
    const progreso = calcularProgresoOrden(orden);

    if (parseInt(formRemision.cantidad_despachada) > progreso.completadas) {
      mostrarError(`Solo hay ${progreso.completadas} piezas completamente terminadas disponibles`);
      return;
    }

    const yaDespachadas = remisiones
      .filter(r => r.orden_id === orden.id)
      .reduce((sum, r) => sum + r.cantidad_despachada, 0);

    const disponibles = progreso.completadas - yaDespachadas;

    if (parseInt(formRemision.cantidad_despachada) > disponibles) {
      mostrarError(`Solo hay ${disponibles} piezas disponibles para despachar (${yaDespachadas} ya despachadas)`);
      return;
    }

    try {
      await crearRemision(formRemision);
      mostrarExito('Remisión creada correctamente');
      setFormRemision({
        orden_id: '',
        cantidad_despachada: '',
        fecha_despacho: obtenerFechaHoy(),
        observaciones: ''
      });
      await recargarDatos();
    } catch (error) {
      mostrarError(error.message);
    }
  };

  const handleEliminar = async () => {
    try {
      await eliminarRemision(modalEliminar.modalData.id);
      mostrarExito('Remisión eliminada correctamente');
      await recargarDatos();
    } catch (error) {
      mostrarError(error.message);
    }
  };

  const handleImprimir = (remision) => {
    const orden = ordenes.find(o => o.id === remision.orden_id);
    const prenda = prendas.find(p => p.id === orden?.prenda_id);

    // Calcular días reales de producción
    const asignacionesOrden = asignaciones.filter(a => 
      a.orden_id === orden.id && a.completado && a.fecha_terminado
    );

    let diasProduccion = 0;
    if (asignacionesOrden.length > 0) {
      const fechasTerminadas = asignacionesOrden.map(a => new Date(a.fecha_terminado));
      const fechaUltimaTerminacion = new Date(Math.max(...fechasTerminadas));
      const fechaEntrada = new Date(orden.fecha_entrada);
      const diffMs = fechaUltimaTerminacion - fechaEntrada;
      diasProduccion = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    const ventana = window.open('', '', 'width=800,height=600');
    ventana.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Remisión ${orden.numero_orden}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
          }
          .document-type {
            font-size: 20px;
            color: #666;
          }
          .info-section {
            margin: 20px 0;
            padding: 15px;
            background: #f8fafc;
            border-left: 4px solid #2563eb;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
          }
          .label {
            font-weight: bold;
            color: #475569;
          }
          .value {
            color: #1e293b;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .items-table th {
            background: #2563eb;
            color: white;
            padding: 12px;
            text-align: left;
          }
          .items-table td {
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
          }
          .metrics {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
          }
          .metric-box {
            padding: 15px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            text-align: center;
          }
          .metric-value {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
          }
          .metric-label {
            font-size: 14px;
            color: #64748b;
            margin-top: 5px;
          }
          .signatures {
            margin-top: 60px;
            display: flex;
            justify-content: space-around;
          }
          .signature-line {
            text-align: center;
          }
          .signature-line hr {
            width: 200px;
            border: none;
            border-top: 2px solid #333;
            margin: 40px auto 10px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">SISTEMA DE PRODUCCIÓN</div>
          <div class="document-type">REMISIÓN DE DESPACHO</div>
        </div>

        <div class="info-section">
          <div class="info-row">
            <span class="label">Número de Orden:</span>
            <span class="value">${orden.numero_orden}</span>
          </div>
          <div class="info-row">
            <span class="label">Fecha de Despacho:</span>
            <span class="value">${new Date(remision.fecha_despacho).toLocaleString('es-CO', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
          <div class="info-row">
            <span class="label">Fecha de Entrada:</span>
            <span class="value">${new Date(orden.fecha_entrada).toLocaleString('es-CO', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
        </div>

        <div class="metrics">
          <div class="metric-box">
            <div class="metric-value">${diasProduccion}</div>
            <div class="metric-label">Tiempo de Producción</div>
          </div>
          <div class="metric-box">
            <div class="metric-value">${remision.cantidad_despachada}</div>
            <div class="metric-label">Unidades Despachadas</div>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Referencia</th>
              <th>Color</th>
              <th>Talla</th>
              <th>Cantidad Total Orden</th>
              <th>Cantidad Despachada</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${prenda?.referencia || '-'}</td>
              <td>${orden.color}</td>
              <td>${orden.talla}</td>
              <td>${orden.cantidad_total}</td>
              <td><strong>${remision.cantidad_despachada}</strong></td>
            </tr>
          </tbody>
        </table>

        ${remision.observaciones ? `
          <div class="info-section">
            <div class="label">Observaciones:</div>
            <div class="value" style="margin-top: 10px;">${remision.observaciones}</div>
          </div>
        ` : ''}

        <div class="signatures">
          <div class="signature-line">
            <hr>
            <p>Entregado por</p>
          </div>
          <div class="signature-line">
            <hr>
            <p>Recibido por</p>
          </div>
        </div>

        <div class="footer">
          <p>Este documento fue generado electrónicamente el ${new Date().toLocaleDateString('es-CO')} a las ${new Date().toLocaleTimeString('es-CO')}</p>
          <p>Sistema de Gestión de Producción - Confección</p>
        </div>

        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 30px; font-size: 16px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
            🖨️ Imprimir
          </button>
          <button onclick="window.close()" style="padding: 10px 30px; font-size: 16px; background: #64748b; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Cerrar
          </button>
        </div>
      </body>
      </html>
    `);
    ventana.document.close();
  };

  return (
    <div>
      <ModalConfirmar
        isOpen={modalEliminar.isOpen}
        onClose={modalEliminar.cerrar}
        onConfirm={handleEliminar}
        titulo="Confirmar Eliminación"
        mensaje="¿Está seguro de eliminar esta remisión?"
        tipo="danger"
      />

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Crear Remisión/Despacho</h2>

        <FormularioRemision
          formRemision={formRemision}
          setFormRemision={setFormRemision}
          ordenes={ordenes}
          prendas={prendas}
          remisiones={remisiones}
          calcularProgresoOrden={calcularProgresoOrden}
          onSeleccionarOrden={handleSeleccionarOrden}
          onSubmit={handleSubmit}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Historial de Remisiones</h2>

        {remisiones.length > 0 && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                const todasExpandidas = {};
                remisiones.forEach(r => todasExpandidas[r.id] = true);
                setRemisionesExpandidas(todasExpandidas);
              }}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Expandir todas
            </button>
            <button
              onClick={() => setRemisionesExpandidas({})}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Colapsar todas
            </button>
          </div>
        )}

        {remisiones.length > 0 ? (
          <div className="space-y-3">
            {remisiones.map(rem => (
              <TarjetaRemision
                key={rem.id}
                remision={rem}
                orden={ordenes.find(o => o.id === rem.orden_id)}
                prenda={prendas.find(p => p.id === ordenes.find(o => o.id === rem.orden_id)?.prenda_id)}
                asignaciones={asignaciones}
                expandida={remisionesExpandidas[rem.id]}
                onToggle={() => toggleRemisionExpandida(rem.id)}
                onImprimir={() => handleImprimir(rem)}
                onEliminar={() => modalEliminar.abrir(rem)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No hay remisiones registradas</p>
            <p className="text-sm mt-2">Crea la primera remisión usando el formulario arriba</p>
          </div>
        )}
      </div>

      <TablaTrazabilidad
        ordenes={ordenes}
        prendas={prendas}
        remisiones={remisiones}
        calcularProgresoOrden={calcularProgresoOrden}
        asignaciones={asignaciones}
      />
    </div>
  );
};

export default VistaRemisiones;