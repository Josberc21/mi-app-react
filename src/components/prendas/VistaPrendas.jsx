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
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Prendas</h1>
          <p className="text-slate-500 text-sm mt-0.5">Catálogo de productos</p>
        </div>
        <span className="badge-brand text-sm px-3 py-1.5 font-semibold">{prendas.length} registradas</span>
      </div>

      <div className="card-p">
        <FormularioPrenda
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancelar={handleCancelar}
          editando={!!editando}
          loading={guardando}
        />
      </div>

      <div className="card-p space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Catálogo de prendas</h2>
          <span className="text-xs text-slate-400">{datosFiltrados.length} resultado{datosFiltrados.length !== 1 ? 's' : ''}</span>
        </div>
        <CampoBusqueda
          valor={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar por ID, referencia o descripción..."
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

      <ModalConfirmar
        isOpen={modalEliminar.isOpen}
        onClose={modalEliminar.cerrar}
        onConfirm={handleEliminar}
        titulo="¿Eliminar prenda?"
        mensaje="Esta acción marcará la prenda como inactiva. Las operaciones asociadas se conservan."
        tipo="danger"
      />
    </div>
  );
};

export default VistaPrendas;