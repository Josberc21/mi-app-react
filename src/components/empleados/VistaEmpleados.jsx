// src/components/empleados/VistaEmpleados.jsx
import React, { useState } from 'react';
import { User } from 'lucide-react';
import CampoBusqueda from '../common/CampoBusqueda';
import Paginacion from '../common/Paginacion';
import ModalConfirmar from '../common/ModalConfirmar';
import FormularioEmpleado from './FormularioEmpleado';
import TablaEmpleados from './TablaEmpleados';
import { useBusqueda } from '../../hooks/useBusqueda';
import { usePaginacion } from '../../hooks/usePaginacion';
import { useModal } from '../../hooks/useModal';
import { crearEmpleado, actualizarEmpleado, eliminarEmpleado } from '../../services/empleadosService';

const VistaEmpleados = ({ 
  empleados, 
  recargarDatos, 
  calcularNomina,
  mostrarExito, 
  mostrarError, 
  mostrarAdvertencia 
}) => {
  const [formData, setFormData] = useState({ nombre: '', telefono: '' });
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Hooks personalizados
  const { busqueda, setBusqueda, datosFiltrados } = useBusqueda(
    empleados, 
    ['nombre', 'telefono', 'id']
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.nombre.trim() || !formData.telefono.trim()) {
      mostrarAdvertencia('Por favor completa todos los campos');
      return;
    }

    setGuardando(true);

    try {
      if (editando) {
        await actualizarEmpleado(editando.id, formData);
        mostrarExito('Empleado actualizado correctamente');
      } else {
        await crearEmpleado(formData);
        mostrarExito('Empleado agregado correctamente');
      }

      setFormData({ nombre: '', telefono: '' });
      setEditando(null);
      recargarDatos();
    } catch (error) {
      mostrarError(`Error: ${error.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const handleEditar = (empleado) => {
    setEditando(empleado);
    setFormData({
      nombre: empleado.nombre,
      telefono: empleado.telefono
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelar = () => {
    setEditando(null);
    setFormData({ nombre: '', telefono: '' });
  };

  const handleEliminar = async () => {
    try {
      await eliminarEmpleado(modalEliminar.modalData);
      mostrarExito('Empleado eliminado correctamente');
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
          <div className="p-3 bg-blue-100 rounded-lg">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Empleados</h2>
            <p className="text-gray-600">Administra tu equipo de trabajo</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total empleados</p>
          <p className="text-3xl font-bold text-blue-600">{empleados.length}</p>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <FormularioEmpleado
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
        <h3 className="text-xl font-bold mb-4">Lista de Empleados</h3>
        
        <CampoBusqueda
          valor={busqueda}
          onChange={setBusqueda}
          placeholder="🔍 Buscar por ID, nombre o teléfono..."
          totalResultados={datosFiltrados.length}
          totalItems={empleados.length}
        />

        <TablaEmpleados
          empleados={datosPaginados}
          onEditar={handleEditar}
          onEliminar={(id) => modalEliminar.abrir(id)}
          calcularNomina={calcularNomina}
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
        titulo="¿Eliminar empleado?"
        mensaje="Esta acción marcará al empleado como inactivo. No se eliminarán sus registros históricos."
        tipo="danger"
      />
    </div>
  );
};

export default VistaEmpleados;