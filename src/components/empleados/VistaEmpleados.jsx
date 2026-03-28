import React, { useState } from 'react';
import { Users } from 'lucide-react';
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
  mostrarAdvertencia,
}) => {
  const [formData, setFormData]   = useState({ nombre: '', telefono: '' });
  const [editando, setEditando]   = useState(null);
  const [guardando, setGuardando] = useState(false);

  const { busqueda, setBusqueda, datosFiltrados } = useBusqueda(empleados, ['nombre', 'telefono', 'id']);
  const { paginaActual, totalPaginas, datosPaginados, primeraPagina, paginaAnterior, paginaSiguiente, ultimaPagina } = usePaginacion(datosFiltrados);
  const modalEliminar = useModal();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      mostrarError(error.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleEditar = (empleado) => {
    setEditando(empleado);
    setFormData({ nombre: empleado.nombre, telefono: empleado.telefono });
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
      mostrarError(error.message);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Empleados</h1>
          <p className="text-slate-500 text-sm mt-0.5">Administra el equipo de trabajo</p>
        </div>
        <span className="badge-brand text-sm px-3 py-1.5 font-semibold">
          {empleados.length} registrados
        </span>
      </div>

      {/* Formulario */}
      <div className="card-p">
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
      <div className="card-p space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Lista de empleados</h2>
          <span className="text-xs text-slate-400">{datosFiltrados.length} resultado{datosFiltrados.length !== 1 ? 's' : ''}</span>
        </div>

        <CampoBusqueda
          valor={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar por ID, nombre o teléfono..."
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

      <ModalConfirmar
        isOpen={modalEliminar.isOpen}
        onClose={modalEliminar.cerrar}
        onConfirm={handleEliminar}
        titulo="¿Eliminar empleado?"
        mensaje="Esta acción marcará al empleado como inactivo. Sus registros históricos se conservan."
        tipo="danger"
      />
    </div>
  );
};

export default VistaEmpleados;
