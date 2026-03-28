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
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Remisiones</h1>
          <p className="text-slate-500 text-sm mt-0.5">Despachos y trazabilidad de órdenes</p>
        </div>
        <span className="badge-brand text-sm px-3 py-1.5 font-semibold">{remisiones.length} remisiones</span>
      </div>

      <div className="card-p">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 bg-brand-600 rounded-full" />
          <h2 className="text-sm font-semibold text-slate-800">Nueva remisión / despacho</h2>
        </div>
        <FormularioRemision formRemision={formRemision} setFormRemision={setFormRemision} ordenes={ordenes} prendas={prendas} remisiones={remisiones} calcularProgresoOrden={calcularProgresoOrden} onSeleccionarOrden={handleSeleccionarOrden} onSubmit={handleSubmit} />
      </div>

      <div className="card-p space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Historial de remisiones</h2>
          {remisiones.length > 0 && (
            <div className="flex gap-2">
              <button onClick={() => { const t = {}; remisiones.forEach(r => t[r.id] = true); setRemisionesExpandidas(t); }} className="btn-ghost text-xs py-1 px-2">Expandir todas</button>
              <button onClick={() => setRemisionesExpandidas({})} className="btn-ghost text-xs py-1 px-2">Colapsar</button>
            </div>
          )}
        </div>

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
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Package className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">Sin remisiones registradas</p>
            <p className="text-slate-400 text-sm mt-1">Crea la primera remisión con el formulario</p>
          </div>
        )}
      </div>

      <TablaTrazabilidad ordenes={ordenes} prendas={prendas} remisiones={remisiones} calcularProgresoOrden={calcularProgresoOrden} asignaciones={asignaciones} />

      <ModalConfirmar isOpen={modalEliminar.isOpen} onClose={modalEliminar.cerrar} onConfirm={handleEliminar} titulo="¿Eliminar remisión?" mensaje="Esta acción eliminará la remisión permanentemente." tipo="danger" />
    </div>
  );
};

export default VistaRemisiones;