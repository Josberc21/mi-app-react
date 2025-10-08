// src/components/prendas/VistaPrendas.jsx
import React, { useState } from 'react';
import { Package } from 'lucide-react';
import CampoBusqueda from '../common/CampoBusqueda';
import Paginacion from '../common/Paginacion';
import ModalConfirmar from '../common/ModalConfirmar';
import FormularioPrenda from './FormularioPrenda';
import TablaPrendas from './TablaPrendas';
import { useBusqueda } from '../../hooks/useBusqueda';
import { usePaginacion } from '../../hooks/usePaginacion';
import { useModal } from '../../hooks/useModal';
import { crearPrenda, actualizarPrenda, eliminarPrenda } from '../../services/prendasService';

const VistaPrendas = ({ 
  prendas,
  operaciones = [],
  recargarDatos, 
  mostrarExito, 
  mostrarError, 
  mostrarAdvertencia 
}) => {
  const [formData, setFormData] = useState({ referencia: '', descripcion: '' });
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Hooks personalizados
  const { busqueda, setBusqueda, datosFiltrados } = useBusqueda(
    prendas, 
    ['referencia', 'descripcion', 'id']
  );

  const {
    paginaActual,
    totalPaginas,
    datosPaginados,
    primeraPagina,
    paginaAnterior,
    paginaSiguiente,
    ultimaPagina
  } = usePaginacion(datosFiltrados);

  const modalEliminar = useModal();

  // Manejadores de formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convertir referencia a mayúsculas automáticamente
    const valorFinal = name === 'referencia' ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: valorFinal }));
  };

  const handleSubmit = async () => {
    if (!formData.referencia.trim()) {
      mostrarAdvertencia('La referencia es obligatoria');
      return;
    }

    setGuardando(true);

    try {
      if (editando) {
        await actualizarPrenda(editando.id, formData);
        mostrarExito('Prenda actualizada correctamente');
      } else {
        await crearPrenda(formData);
        mostrarExito('Prenda agregada correctamente');
      }

      setFormData({ referencia: '', descripcion: '' });
      setEditando(null);
      recargarDatos();
    } catch (error) {
      mostrarError(`Error: ${error.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const handleEditar = (prenda) => {
    setEditando(prenda);
    setFormData({
      referencia: prenda.referencia,
      descripcion: prenda.descripcion || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelar = () => {
    setEditando(null);
    setFormData({ referencia: '', descripcion: '' });
  };

  const handleEliminar = async () => {
    try {
      await eliminarPrenda(modalEliminar.modalData);
      mostrarExito('Prenda eliminada correctamente');
      recargarDatos();
    } catch (error) {
      mostrarError(`Error al eliminar: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Package className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Prendas</h2>
            <p className="text-gray-600">Administra el catálogo de productos</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total prendas</p>
          <p className="text-3xl font-bold text-purple-600">{prendas.length}</p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <FormularioPrenda
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancelar={handleCancelar}
          editando={!!editando}
          loading={guardando}
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Catálogo de Prendas</h3>
        
        <CampoBusqueda
          valor={busqueda}
          onChange={setBusqueda}
          placeholder="🔍 Buscar por ID, referencia o descripción..."
          totalResultados={datosFiltrados.length}
          totalItems={prendas.length}
        />

        <TablaPrendas
          prendas={datosPaginados}
          operaciones={operaciones}
          onEditar={handleEditar}
          onEliminar={(id) => modalEliminar.abrir(id)}
        />

        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          totalItems={datosFiltrados.length}
          primeraPagina={primeraPagina}
          paginaAnterior={paginaAnterior}
          paginaSiguiente={paginaSiguiente}
          ultimaPagina={ultimaPagina}
        />
      </div>

      {/* Modal de confirmación */}
      <ModalConfirmar
        isOpen={modalEliminar.isOpen}
        onClose={modalEliminar.cerrar}
        onConfirm={handleEliminar}
        titulo="¿Eliminar prenda?"
        mensaje="Esta acción marcará la prenda como inactiva. Las operaciones asociadas se mantendrán."
        tipo="danger"
      />
    </div>
  );
};

export default VistaPrendas;