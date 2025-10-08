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
    <div>
      <ModalConfirmar
        isOpen={modalEliminar.isOpen}
        onClose={modalEliminar.cerrar}
        onConfirm={handleEliminar}
        titulo="Confirmar Eliminación"
        mensaje={`¿Está seguro de eliminar la orden ${modalEliminar.modalData?.numero_orden}?`}
        tipo="danger"
      />

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">
          {editando ? 'Editar Orden de Producción' : 'Nueva Orden de Producción'}
        </h2>

        <FormularioOrden
          formOrden={formOrden}
          setFormOrden={setFormOrden}
          prendas={prendas}
          editando={editando}
          onSubmit={handleSubmit}
          onCancelar={resetForm}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Órdenes de Producción</h2>

        <CampoBusqueda
          valor={busqueda}
          onChange={setBusqueda}
          placeholder="🔍 Buscar por número de orden o color..."
          totalResultados={ordenesFiltradas.length}
          totalItems={ordenes.length}
        />

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
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No hay órdenes de producción registradas</p>
            <p className="text-sm mt-2">Crea la primera orden usando el formulario arriba</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VistaOrdenes;