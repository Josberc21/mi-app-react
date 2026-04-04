import React, { useState, useMemo } from 'react';
import { ClipboardList, X } from 'lucide-react';
import CampoBusqueda from '../common/CampoBusqueda';
import Paginacion from '../common/Paginacion';
import ModalConfirmar from '../common/ModalConfirmar';
import ModalInput from '../common/ModalInput';
import FormularioAsignacion from './FormularioAsignacion';
import TablaAsignaciones from './TablaAsignaciones';
import { useBusqueda } from '../../hooks/useBusqueda';
import { usePaginacion } from '../../hooks/usePaginacion';
import { useModal } from '../../hooks/useModal';
import {
  crearAsignacion,
  completarAsignacion,
  revertirAsignacion,
  eliminarAsignacion,
} from '../../services/asignacionesService';
import { obtenerFechaHoy } from '../../utils/dateUtils';

const FORM_INICIAL = {
  empleado_id: '',
  prenda_id: '',
  operacion_id: '',
  cantidad: '',
  talla: 'S',
  color: '',
  orden_id: '',
  fecha: obtenerFechaHoy(),
};

const VistaAsignaciones = ({
  asignaciones,
  empleados,
  prendas,
  operaciones,
  ordenes,
  recargarDatos,
  mostrarExito,
  mostrarError,
  mostrarAdvertencia,
}) => {
  const [formAsig, setFormAsig]     = useState(FORM_INICIAL);
  const [ordenEstado, setOrdenEstado] = useState(null);
  const [guardando, setGuardando]   = useState(false);

  const modalEliminar  = useModal();
  const modalCompletar = useModal();
  const modalRevertir  = useModal();

  const { busqueda, setBusqueda, datosFiltrados } = useBusqueda(
    asignaciones,
    (asig, termino) => {
      const emp    = empleados.find((e) => e.id === asig.empleado_id);
      const op     = operaciones.find((o) => o.id === asig.operacion_id);
      const prenda = prendas.find((p) => p.id === asig.prenda_id);
      const t = termino.toLowerCase();
      return (
        emp?.nombre.toLowerCase().includes(t) ||
        emp?.id.toString().includes(t) ||
        op?.nombre.toLowerCase().includes(t) ||
        prenda?.referencia.toLowerCase().includes(t) ||
        asig.talla?.toLowerCase().includes(t) ||
        asig.color?.toLowerCase().includes(t)
      );
    }
  );

  const asignacionesOrdenadas = useMemo(() => {
    if (!ordenEstado) return datosFiltrados;
    return [...datosFiltrados].sort((a, b) => {
      if (ordenEstado === 'pendientes') {
        return (!a.completado && b.completado) ? -1 : (a.completado && !b.completado) ? 1 : 0;
      }
      return (a.completado && !b.completado) ? -1 : (!a.completado && b.completado) ? 1 : 0;
    });
  }, [datosFiltrados, ordenEstado]);

  const { paginaActual, totalPaginas, datosPaginados, primeraPagina, paginaAnterior, paginaSiguiente, ultimaPagina } =
    usePaginacion(asignacionesOrdenadas, 20);

  const handleCambiarOrdenEstado = () => {
    setOrdenEstado((prev) => (prev === null ? 'pendientes' : prev === 'pendientes' ? 'completadas' : null));
  };

  const handleSeleccionarOrden = (ordenId) => {
    const orden = ordenes.find((o) => o.id === parseInt(ordenId));
    if (orden) {
      setFormAsig({ ...formAsig, orden_id: ordenId, prenda_id: orden.prenda_id.toString(), color: orden.color, talla: orden.talla, operacion_id: '' });
    } else {
      setFormAsig({ ...formAsig, orden_id: '', prenda_id: '', color: '', operacion_id: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formAsig.orden_id) { mostrarAdvertencia('Selecciona una orden de producción'); return; }
    if (!formAsig.empleado_id || !formAsig.operacion_id || !formAsig.cantidad) { mostrarAdvertencia('Completa todos los campos'); return; }

    setGuardando(true);
    try {
      const orden           = ordenes.find((o) => o.id === parseInt(formAsig.orden_id));
      const operacionId     = parseInt(formAsig.operacion_id);
      const cantidadAsig    = parseInt(formAsig.cantidad);
      const yaAsignadas     = asignaciones.filter((a) => a.orden_id === orden.id && a.operacion_id === operacionId).reduce((s, a) => s + Number(a.cantidad || 0), 0);
      const disponibles     = orden.cantidad_total - yaAsignadas;

      if (cantidadAsig > disponibles) {
        mostrarError(`Solo hay ${disponibles} piezas disponibles.\nYa asignadas: ${yaAsignadas} de ${orden.cantidad_total}.`);
        return;
      }

      const operacion = operaciones.find((o) => o.id === operacionId);
      await crearAsignacion({ ...formAsig, monto: operacion.costo * cantidadAsig });
      mostrarExito(`Asignación creada. Quedan ${disponibles - cantidadAsig} piezas disponibles.`);
      setFormAsig({ ...FORM_INICIAL, fecha: obtenerFechaHoy() });
      await recargarDatos();
    } catch (error) {
      mostrarError(error.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleCompletar = async (cantidad) => {
    try {
      const asig = modalCompletar.modalData;
      const cantidadEntregada = parseInt(cantidad);
      if (isNaN(cantidadEntregada) || cantidadEntregada <= 0 || cantidadEntregada > asig.cantidad) {
        mostrarError(`Ingresa un número entre 1 y ${asig.cantidad}`); return;
      }
      const operacion = operaciones.find((o) => o.id === asig.operacion_id);
      await completarAsignacion(asig.id, cantidadEntregada, operacion.costo * cantidadEntregada);

      if (cantidadEntregada < asig.cantidad) {
        const resto = asig.cantidad - cantidadEntregada;
        await crearAsignacion({ empleado_id: asig.empleado_id, prenda_id: asig.prenda_id, operacion_id: asig.operacion_id, cantidad: resto, talla: asig.talla, color: asig.color, orden_id: asig.orden_id, fecha: asig.fecha, monto: operacion.costo * resto });
        mostrarExito(`Entregadas ${cantidadEntregada} piezas. Quedan ${resto} pendientes.`);
      } else {
        mostrarExito('Asignación completada');
      }
      await recargarDatos();
    } catch (error) {
      mostrarError(error.message);
    }
  };

  const handleRevertir = async (cantidad) => {
    try {
      const asig = modalRevertir.modalData;
      const cantidadRevertir = parseInt(cantidad);
      if (isNaN(cantidadRevertir) || cantidadRevertir <= 0 || cantidadRevertir > asig.cantidad) {
        mostrarError(`Ingresa un número entre 1 y ${asig.cantidad}`); return;
      }
      const operacion = operaciones.find((o) => o.id === asig.operacion_id);

      if (cantidadRevertir < asig.cantidad) {
        const quedan = asig.cantidad - cantidadRevertir;
        await completarAsignacion(asig.id, quedan, operacion.costo * quedan);
        await crearAsignacion({ empleado_id: asig.empleado_id, prenda_id: asig.prenda_id, operacion_id: asig.operacion_id, cantidad: cantidadRevertir, talla: asig.talla, color: asig.color, orden_id: asig.orden_id, fecha: asig.fecha, monto: operacion.costo * cantidadRevertir });
        mostrarExito(`Revertidas ${cantidadRevertir} piezas. Quedan ${quedan} completadas.`);
      } else {
        await revertirAsignacion(asig.id);
        mostrarExito('Asignación completamente revertida');
      }
      await recargarDatos();
    } catch (error) {
      mostrarError(error.message);
    }
  };

  const handleEliminar = async () => {
    try {
      await eliminarAsignacion(modalEliminar.modalData.id);
      mostrarExito('Asignación eliminada');
      await recargarDatos();
    } catch (error) {
      mostrarError(error.message);
    }
  };

  const pendientes  = asignaciones.filter((a) => !a.completado).length;
  const completadas = asignaciones.filter((a) => a.completado).length;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Asignaciones</h1>
          <p className="text-slate-500 text-sm mt-0.5">Asigna operaciones a empleados</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-amber">{pendientes} pendientes</span>
          <span className="badge-green">{completadas} completadas</span>
        </div>
      </div>

      {/* Formulario */}
      <div className="card-p">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 bg-brand-600 rounded-full" />
          <h2 className="text-sm font-semibold text-slate-800">Nueva asignación</h2>
        </div>
        <FormularioAsignacion
          formAsig={formAsig}
          setFormAsig={setFormAsig}
          empleados={empleados}
          prendas={prendas}
          operaciones={operaciones}
          ordenes={ordenes}
          asignaciones={asignaciones}
          onSeleccionarOrden={handleSeleccionarOrden}
          onSubmit={handleSubmit}
          loading={guardando}
        />
      </div>

      {/* Tabla */}
      <div className="card-p space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Lista de asignaciones</h2>
          <div className="flex items-center gap-2">
            {ordenEstado && (
              <button
                onClick={() => setOrdenEstado(null)}
                className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 bg-brand-50 px-2.5 py-1 rounded-lg transition-colors"
              >
                Ordenando: {ordenEstado}
                <X className="w-3 h-3" />
              </button>
            )}
            <span className="text-xs text-slate-400">{asignacionesOrdenadas.length} resultado{asignacionesOrdenadas.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <CampoBusqueda
          valor={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar por empleado, operación, prenda, color o talla..."
          totalResultados={datosFiltrados.length}
          totalItems={asignaciones.length}
        />

        <TablaAsignaciones
          asignaciones={datosPaginados}
          empleados={empleados}
          operaciones={operaciones}
          prendas={prendas}
          onCompletar={(a) => modalCompletar.abrir(a)}
          onRevertir={(a) => modalRevertir.abrir(a)}
          onEliminar={(a) => modalEliminar.abrir(a)}
          ordenEstado={ordenEstado}
          onCambiarOrdenEstado={handleCambiarOrdenEstado}
        />

        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          totalItems={asignacionesOrdenadas.length}
          primeraPagina={primeraPagina}
          paginaAnterior={paginaAnterior}
          paginaSiguiente={paginaSiguiente}
          ultimaPagina={ultimaPagina}
        />
      </div>

      {/* Modales */}
      <ModalConfirmar
        isOpen={modalEliminar.isOpen}
        onClose={modalEliminar.cerrar}
        onConfirm={handleEliminar}
        titulo="¿Eliminar asignación?"
        mensaje="Esta acción no se puede deshacer. Se eliminará el registro permanentemente."
        tipo="danger"
      />
      <ModalInput
        isOpen={modalCompletar.isOpen}
        onClose={modalCompletar.cerrar}
        onSubmit={handleCompletar}
        titulo="Completar asignación"
        label={`Cantidad entregada de ${modalCompletar.modalData?.cantidad || 0} asignadas:`}
        placeholder="Cantidad"
        valorInicial={modalCompletar.modalData?.cantidad?.toString() || ''}
        tipo="number"
        min="1"
        max={modalCompletar.modalData?.cantidad}
      />
      <ModalInput
        isOpen={modalRevertir.isOpen}
        onClose={modalRevertir.cerrar}
        onSubmit={handleRevertir}
        titulo="Revertir asignación"
        label={`Cantidad a revertir de ${modalRevertir.modalData?.cantidad || 0} completadas:`}
        placeholder="Cantidad"
        valorInicial={modalRevertir.modalData?.cantidad?.toString() || ''}
        tipo="number"
        min="1"
        max={modalRevertir.modalData?.cantidad}
      />
    </div>
  );
};

export default VistaAsignaciones;
