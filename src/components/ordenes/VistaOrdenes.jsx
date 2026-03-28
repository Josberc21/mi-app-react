import React, { useState } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import CampoBusqueda from '../common/CampoBusqueda';
import ModalConfirmar from '../common/ModalConfirmar';
import FormularioOrden from './FormularioOrden';
import TarjetaOrden from './TarjetaOrden';
import { useBusqueda } from '../../hooks/useBusqueda';
import { useModal } from '../../hooks/useModal';
import { crearOrden, actualizarOrden, eliminarOrden } from '../../services/ordenesService';
import { obtenerFechaHoy } from '../../utils/dateUtils';

const VistaOrdenes = ({ 
  ordenes, 
  prendas, 
  operaciones,
  asignaciones,
  recargarDatos,
  calcularProgresoOrden,
  mostrarExito, 
  mostrarError, 
  mostrarAdvertencia 
}) => {
  const [formOrden, setFormOrden] = useState({
    prenda_id: '',
    color: '',
    talla: 'S',
    cantidad_total: '',
    fecha_entrada: obtenerFechaHoy()
  });
  const [editando, setEditando] = useState(null);
  const [ordenesExpandidas, setOrdenesExpandidas] = useState({});

  const modalEliminar = useModal();

  const { busqueda, setBusqueda, datosFiltrados: ordenesFiltradas } = useBusqueda(
    ordenes,
    ['numero_orden', 'color']
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formOrden.prenda_id || !formOrden.color || !formOrden.cantidad_total) {
      mostrarAdvertencia('Complete todos los campos obligatorios');
      return;
    }

    try {
      if (editando) {
        await actualizarOrden(editando.id, formOrden);
        mostrarExito('Orden actualizada correctamente');
      } else {
        const nuevaOrden = await crearOrden(formOrden);
        mostrarExito(`Orden ${nuevaOrden.numero_orden} creada correctamente`);
      }
      
      resetForm();
      await recargarDatos();
    } catch (error) {
      mostrarError(error.message);
    }
  };

  const handleEditar = (orden) => {
    setEditando(orden);
    setFormOrden({
      prenda_id: orden.prenda_id,
      color: orden.color,
      talla: orden.talla,
      cantidad_total: orden.cantidad_total,
      fecha_entrada: orden.fecha_entrada
    });
  };

  const handleEliminar = async () => {
    try {
      await eliminarOrden(modalEliminar.modalData.id);
      mostrarExito('Orden eliminada correctamente');
      await recargarDatos();
    } catch (error) {
      mostrarError(error.message);
    }
  };

  const resetForm = () => {
    setFormOrden({
      prenda_id: '',
      color: '',
      talla: 'S',
      cantidad_total: '',
      fecha_entrada: obtenerFechaHoy()
    });
    setEditando(null);
  };

  const toggleOrdenExpandida = (ordenId) => {
    setOrdenesExpandidas(prev => ({
      ...prev,
      [ordenId]: !prev[ordenId]
    }));
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Órdenes de Producción</h1>
          <p className="text-slate-500 text-sm mt-0.5">Gestiona las órdenes del taller</p>
        </div>
        <span className="badge-brand text-sm px-3 py-1.5 font-semibold">{ordenes.length} órdenes</span>
      </div>

      <div className="card-p">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 bg-brand-600 rounded-full" />
          <h2 className="text-sm font-semibold text-slate-800">
            {editando ? 'Editar orden' : 'Nueva orden de producción'}
          </h2>
        </div>
        <FormularioOrden formOrden={formOrden} setFormOrden={setFormOrden} prendas={prendas} editando={editando} onSubmit={handleSubmit} onCancelar={resetForm} />
      </div>

      <div className="card-p space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Listado de órdenes</h2>
          <span className="text-xs text-slate-400">{ordenesFiltradas.length} resultado{ordenesFiltradas.length !== 1 ? 's' : ''}</span>
        </div>

        <CampoBusqueda valor={busqueda} onChange={setBusqueda} placeholder="Buscar por número de orden o color..." totalResultados={ordenesFiltradas.length} totalItems={ordenes.length} />

        {ordenesFiltradas.length > 0 ? (
          <div className="space-y-3">
            {ordenesFiltradas.map(orden => (
              <TarjetaOrden
                key={orden.id}
                orden={orden}
                prenda={prendas.find(p => p.id === orden.prenda_id)}
                progreso={calcularProgresoOrden(orden)}
                expandida={ordenesExpandidas[orden.id]}
                onToggleExpandir={() => toggleOrdenExpandida(orden.id)}
                onEditar={() => handleEditar(orden)}
                onEliminar={() => modalEliminar.abrir(orden)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Package className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">Sin órdenes registradas</p>
            <p className="text-slate-400 text-sm mt-1">Crea la primera orden con el formulario</p>
          </div>
        )}
      </div>

      <ModalConfirmar isOpen={modalEliminar.isOpen} onClose={modalEliminar.cerrar} onConfirm={handleEliminar} titulo="¿Eliminar orden?" mensaje={`¿Eliminar la orden ${modalEliminar.modalData?.numero_orden}? Esta acción no se puede deshacer.`} tipo="danger" />
    </div>
  );
};

export default VistaOrdenes;