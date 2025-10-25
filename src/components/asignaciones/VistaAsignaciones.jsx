// src/components/asignaciones/VistaAsignaciones.jsx
import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
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
  eliminarAsignacion 
} from '../../services/asignacionesService';
import { obtenerFechaHoy } from '../../utils/dateUtils';

const VistaAsignaciones = ({ 
  asignaciones,
  empleados,
  prendas,
  operaciones,
  ordenes,
  recargarDatos,
  mostrarExito, 
  mostrarError, 
  mostrarAdvertencia 
}) => {
  const [formAsig, setFormAsig] = useState({
    empleado_id: '',
    prenda_id: '',
    operacion_id: '',
    cantidad: '',
    talla: 'S',
    color: '',
    orden_id: '',
    fecha: obtenerFechaHoy()
  });

  const [ordenEstado, setOrdenEstado] = useState(null); // null | 'pendientes' | 'completadas'

  const modalEliminar = useModal();
  const modalCompletar = useModal();
  const modalRevertir = useModal();

  // Búsqueda mejorada
  const { busqueda, setBusqueda, datosFiltrados } = useBusqueda(
    asignaciones,
    (asig, termino) => {
      const emp = empleados.find(e => e.id === asig.empleado_id);
      const op = operaciones.find(o => o.id === asig.operacion_id);
      const prenda = prendas.find(p => p.id === asig.prenda_id);
      
      return (
        (emp && (
          emp.nombre.toLowerCase().includes(termino.toLowerCase()) ||
          emp.id.toString().includes(termino)
        )) ||
        (op && op.nombre.toLowerCase().includes(termino.toLowerCase())) ||
        (prenda && prenda.referencia.toLowerCase().includes(termino.toLowerCase())) ||
        asig.talla.toLowerCase().includes(termino.toLowerCase()) ||
        (asig.color && asig.color.toLowerCase().includes(termino.toLowerCase()))
      );
    }
  );

  // Ordenamiento por estado
  const asignacionesOrdenadas = useMemo(() => {
    if (!ordenEstado) return datosFiltrados;

    return [...datosFiltrados].sort((a, b) => {
      if (ordenEstado === 'pendientes') {
        // Pendientes primero
        if (!a.completado && b.completado) return -1;
        if (a.completado && !b.completado) return 1;
        return 0;
      } else {
        // Completadas primero
        if (a.completado && !b.completado) return -1;
        if (!a.completado && b.completado) return 1;
        return 0;
      }
    });
  }, [datosFiltrados, ordenEstado]);

  // Paginación
  const {
    paginaActual,
    totalPaginas,
    datosPaginados,
    primeraPagina,
    paginaAnterior,
    paginaSiguiente,
    ultimaPagina
  } = usePaginacion(asignacionesOrdenadas, 20); // 20 items por página

  const handleCambiarOrdenEstado = () => {
    if (ordenEstado === null) {
      setOrdenEstado('pendientes');
    } else if (ordenEstado === 'pendientes') {
      setOrdenEstado('completadas');
    } else {
      setOrdenEstado(null); // Volver al orden original
    }
  };

  const handleSeleccionarOrden = async (ordenId) => {
    const orden = ordenes.find(o => o.id === parseInt(ordenId));
    if (orden) {
      setFormAsig({
        ...formAsig,
        orden_id: ordenId,
        prenda_id: orden.prenda_id.toString(),
        color: orden.color,
        talla: orden.talla,
        operacion_id: ''
      });
    } else {
      setFormAsig({
        ...formAsig,
        orden_id: '',
        prenda_id: '',
        color: '',
        operacion_id: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formAsig.orden_id) {
      mostrarAdvertencia('Debe seleccionar una orden de producción');
      return;
    }

    if (!formAsig.empleado_id || !formAsig.operacion_id || !formAsig.cantidad) {
      mostrarAdvertencia('Complete todos los campos');
      return;
    }

    try {
      const orden = ordenes.find(o => o.id === parseInt(formAsig.orden_id));
      const operacionId = parseInt(formAsig.operacion_id);
      const cantidadAsignada = parseInt(formAsig.cantidad);

      const asignacionesExistentes = asignaciones.filter(a =>
        a.orden_id === orden.id && a.operacion_id === operacionId
      );

      const yaAsignadas = asignacionesExistentes.reduce((sum, a) => sum + Number(a.cantidad || 0), 0);
      const disponibles = orden.cantidad_total - yaAsignadas;

      if (cantidadAsignada > disponibles) {
        mostrarError(
          `Solo hay ${disponibles} piezas disponibles para esta operación.\n` +
          `Ya asignadas: ${yaAsignadas} de ${orden.cantidad_total} total.`
        );
        return;
      }

      const operacion = operaciones.find(o => o.id === operacionId);
      const monto = operacion.costo * cantidadAsignada;

      await crearAsignacion({ ...formAsig, monto });
      
      mostrarExito(
        `Operación asignada correctamente.\n` +
        `Quedan ${disponibles - cantidadAsignada} piezas disponibles para esta operación.`
      );

      setFormAsig({
        empleado_id: '',
        prenda_id: '',
        operacion_id: '',
        cantidad: '',
        talla: 'S',
        color: '',
        orden_id: '',
        fecha: obtenerFechaHoy()
      });

      await recargarDatos();
    } catch (error) {
      mostrarError(error.message);
    }
  };

  const handleCompletar = async (cantidad) => {
    try {
      const asignacion = modalCompletar.modalData;
      const cantidadEntregada = parseInt(cantidad);
      
      if (isNaN(cantidadEntregada) || cantidadEntregada <= 0 || cantidadEntregada > asignacion.cantidad) {
        mostrarError(`Debe ingresar un número entre 1 y ${asignacion.cantidad}`);
        return;
      }

      if (cantidadEntregada < asignacion.cantidad) {
        const resto = asignacion.cantidad - cantidadEntregada;
        const operacion = operaciones.find(o => o.id === asignacion.operacion_id);

        const montoEntregado = operacion.costo * cantidadEntregada;
await completarAsignacion(asignacion.id, cantidadEntregada, montoEntregado);

        await crearAsignacion({
          empleado_id: asignacion.empleado_id,
          prenda_id: asignacion.prenda_id,
          operacion_id: asignacion.operacion_id,
          cantidad: resto,
          talla: asignacion.talla,
          color: asignacion.color,
          orden_id: asignacion.orden_id,
          fecha: asignacion.fecha,
          monto: operacion.costo * resto
        });

        mostrarExito(`Entregadas ${cantidadEntregada} piezas. Quedan ${resto} pendientes.`);
      } else {
        await completarAsignacion(asignacion.id, cantidadEntregada);
        mostrarExito('Asignación completada');
      }

      await recargarDatos();
    } catch (error) {
      mostrarError(error.message);
    }
  };

  const handleRevertir = async (cantidad) => {
    try {
      const asignacion = modalRevertir.modalData;
      const cantidadRevertir = parseInt(cantidad);

      if (isNaN(cantidadRevertir) || cantidadRevertir <= 0 || cantidadRevertir > asignacion.cantidad) {
        mostrarError(`Debe ingresar un número entre 1 y ${asignacion.cantidad}`);
        return;
      }

      const operacion = operaciones.find(o => o.id === asignacion.operacion_id);

      if (cantidadRevertir < asignacion.cantidad) {
        const quedan = asignacion.cantidad - cantidadRevertir;

        await completarAsignacion(asignacion.id, quedan);

        await crearAsignacion({
          empleado_id: asignacion.empleado_id,
          prenda_id: asignacion.prenda_id,
          operacion_id: asignacion.operacion_id,
          cantidad: cantidadRevertir,
          talla: asignacion.talla,
          color: asignacion.color,
          orden_id: asignacion.orden_id,
          fecha: asignacion.fecha,
          monto: operacion.costo * cantidadRevertir
        });

        mostrarExito(`Revertidas ${cantidadRevertir} piezas. Quedan ${quedan} completadas.`);
      } else {
        await revertirAsignacion(asignacion.id);
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
      mostrarExito('Asignación eliminada correctamente');
      await recargarDatos();
    } catch (error) {
      mostrarError(error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <Plus className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Asignaciones</h2>
            <p className="text-gray-600">Asigna operaciones a empleados</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total asignaciones</p>
          <p className="text-3xl font-bold text-green-600">{asignaciones.length}</p>
        </div>
      </div>

      {/* Modales */}
      <ModalConfirmar
        isOpen={modalEliminar.isOpen}
        onClose={modalEliminar.cerrar}
        onConfirm={handleEliminar}
        titulo="Confirmar Eliminación"
        mensaje="¿Está seguro de eliminar esta asignación?"
        tipo="danger"
      />

      <ModalInput
        isOpen={modalCompletar.isOpen}
        onClose={modalCompletar.cerrar}
        onSubmit={handleCompletar}
        titulo="Completar Asignación"
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
        titulo="Revertir Asignación"
        label={`Cantidad a revertir de ${modalRevertir.modalData?.cantidad || 0} completadas:`}
        placeholder="Cantidad"
        valorInicial={modalRevertir.modalData?.cantidad?.toString() || ''}
        tipo="number"
        min="1"
        max={modalRevertir.modalData?.cantidad}
      />

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Nueva Asignación</h3>
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
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Lista de Asignaciones</h3>

        {/* Info de ordenamiento */}
        {ordenEstado && (
          <div className="mb-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
            <strong>Ordenando por:</strong> {
              ordenEstado === 'pendientes' ? 'Pendientes primero ↑' : 'Completadas primero ↓'
            }
            <button 
              onClick={() => setOrdenEstado(null)}
              className="ml-2 underline hover:no-underline"
            >
              Quitar orden
            </button>
          </div>
        )}

        <CampoBusqueda
          valor={busqueda}
          onChange={setBusqueda}
          placeholder="🔍 Buscar por empleado, operación, prenda, color o talla..."
          totalResultados={datosFiltrados.length}
          totalItems={asignaciones.length}
        />

        <TablaAsignaciones
          asignaciones={datosPaginados}
          empleados={empleados}
          operaciones={operaciones}
          prendas={prendas}
          onCompletar={(asig) => modalCompletar.abrir(asig)}
          onRevertir={(asig) => modalRevertir.abrir(asig)}
          onEliminar={(asig) => modalEliminar.abrir(asig)}
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
    </div>
  );
};

export default VistaAsignaciones;