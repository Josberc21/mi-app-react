// src/components/operaciones/VistaOperaciones.jsx
import React, { useState, useMemo } from 'react';
import { Settings, Upload } from 'lucide-react';
import CampoBusqueda from '../common/CampoBusqueda';
import Paginacion from '../common/Paginacion';
import ModalConfirmar from '../common/ModalConfirmar';
import FormularioOperacion from './FormularioOperacion';
import TablaOperaciones from './TablaOperaciones';
import CargaMasiva from './CargaMasiva';
import { useBusqueda } from '../../hooks/useBusqueda';
import { usePaginacion } from '../../hooks/usePaginacion';
import { useModal } from '../../hooks/useModal';
import { crearOperacion, actualizarOperacion, eliminarOperacion } from '../../services/operacionesService';

const VistaOperaciones = ({
  operaciones,
  prendas = [],
  recargarDatos,
  mostrarExito,
  mostrarError,
  mostrarAdvertencia,
  mostrarInfo
}) => {
  const [formData, setFormData] = useState({ nombre: '', costo: '', prenda_id: '' });
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mostrarCargaMasiva, setMostrarCargaMasiva] = useState(false);
  const [ordenCosto, setOrdenCosto] = useState(null); // null, 'menor', 'mayor'

  // Hooks personalizados - Búsqueda en operaciones Y prendas
  const { busqueda, setBusqueda, datosFiltrados } = useBusqueda(
    operaciones,
    (op, termino) => {
      const prenda = prendas.find(p => p.id === op.prenda_id);
      return (
        op.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        op.id.toString().includes(termino) ||
        op.costo.toString().includes(termino) ||
        (prenda && prenda.referencia.toLowerCase().includes(termino.toLowerCase()))
      );
    }
  );
  // Ordenamiento por costo
  const operacionesOrdenadas = useMemo(() => {
    if (!ordenCosto) return datosFiltrados;

    return [...datosFiltrados].sort((a, b) => {
      const costoA = parseFloat(a.costo);
      const costoB = parseFloat(b.costo);

      if (ordenCosto === 'menor') {
        return costoA - costoB; // Menor a mayor
      } else {
        return costoB - costoA; // Mayor a menor
      }
    });
  }, [datosFiltrados, ordenCosto]);

  const {
    paginaActual,
    totalPaginas,
    datosPaginados,
    primeraPagina,
    paginaAnterior,
    paginaSiguiente,
    ultimaPagina
  } = usePaginacion(operacionesOrdenadas);

  const modalEliminar = useModal();

  // Función para cambiar orden de costo
  const handleCambiarOrdenCosto = () => {
    if (ordenCosto === null) {
      setOrdenCosto('menor');
    } else if (ordenCosto === 'menor') {
      setOrdenCosto('mayor');
    } else {
      setOrdenCosto(null);
    }
  };

  // Manejadores de formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convertir nombre a mayúsculas automáticamente
    const valorFinal = name === 'nombre' ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: valorFinal }));
  };

  const handleSubmit = async () => {
    if (!formData.nombre.trim() || !formData.costo || !formData.prenda_id) {
      mostrarAdvertencia('Por favor completa todos los campos');
      return;
    }

    if (parseFloat(formData.costo) <= 0) {
      mostrarAdvertencia('El costo debe ser mayor a 0');
      return;
    }

    setGuardando(true);

    try {
      if (editando) {
        await actualizarOperacion(editando.id, formData);
        mostrarExito('Operación actualizada correctamente');
      } else {
        await crearOperacion(formData);
        mostrarExito('Operación agregada correctamente');
      }

      setFormData({ nombre: '', costo: '', prenda_id: '' });
      setEditando(null);
      recargarDatos();
    } catch (error) {
      mostrarError(`Error: ${error.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const handleEditar = (operacion) => {
    setEditando(operacion);
    setFormData({
      nombre: operacion.nombre,
      costo: operacion.costo,
      prenda_id: operacion.prenda_id
    });
    setMostrarCargaMasiva(false); // Ocultar carga masiva al editar
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelar = () => {
    setEditando(null);
    setFormData({ nombre: '', costo: '', prenda_id: '' });
  };

  const handleEliminar = async () => {
    try {
      await eliminarOperacion(modalEliminar.modalData);
      mostrarExito('Operación eliminada correctamente');
      recargarDatos();
    } catch (error) {
      mostrarError(`Error al eliminar: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Operaciones</h1>
          <p className="text-slate-500 text-sm mt-0.5">Operaciones y costos de confección</p>
        </div>
        <span className="badge-brand text-sm px-3 py-1.5 font-semibold">{operaciones.length} registradas</span>
      </div>

      <div className="card-p">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-brand-600 rounded-full" />
            <h2 className="text-sm font-semibold text-slate-800">
              {editando ? 'Editar operación' : 'Nueva operación'}
            </h2>
          </div>
          <button
            onClick={() => setMostrarCargaMasiva(!mostrarCargaMasiva)}
            className={mostrarCargaMasiva ? 'btn-secondary' : 'btn-primary'}
          >
            <Upload className="w-4 h-4" />
            {mostrarCargaMasiva ? 'Formulario manual' : 'Carga masiva Excel'}
          </button>
        </div>
        {mostrarCargaMasiva ? (
          <CargaMasiva onExito={mostrarExito} onError={mostrarError} onInfo={mostrarInfo} recargarDatos={recargarDatos} />
        ) : (
          <FormularioOperacion formData={formData} prendas={prendas} onChange={handleChange} onSubmit={handleSubmit} onCancelar={handleCancelar} editando={!!editando} loading={guardando} />
        )}
      </div>

      <div className="card-p space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Catálogo de operaciones</h2>
          <div className="flex items-center gap-2">
            {ordenCosto && (
              <button onClick={() => setOrdenCosto(null)} className="flex items-center gap-1 text-xs text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg hover:bg-brand-100 transition-colors">
                Por costo: {ordenCosto === 'menor' ? '↑' : '↓'}
                <span className="text-brand-400">×</span>
              </button>
            )}
            <span className="text-xs text-slate-400">{operacionesOrdenadas.length} resultado{operacionesOrdenadas.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <CampoBusqueda valor={busqueda} onChange={setBusqueda} placeholder="Buscar por nombre, costo o prenda..." totalResultados={datosFiltrados.length} totalItems={operaciones.length} />
        <TablaOperaciones operaciones={datosPaginados} prendas={prendas} onEditar={handleEditar} onEliminar={(id) => modalEliminar.abrir(id)} ordenCosto={ordenCosto} onCambiarOrdenCosto={handleCambiarOrdenCosto} />
        <Paginacion paginaActual={paginaActual} totalPaginas={totalPaginas} totalItems={operacionesOrdenadas.length} primeraPagina={primeraPagina} paginaAnterior={paginaAnterior} paginaSiguiente={paginaSiguiente} ultimaPagina={ultimaPagina} />
      </div>

      <ModalConfirmar isOpen={modalEliminar.isOpen} onClose={modalEliminar.cerrar} onConfirm={handleEliminar} titulo="¿Eliminar operación?" mensaje="Esta acción marcará la operación como inactiva. Las asignaciones históricas se conservan." tipo="danger" />
    </div>
  );
};

export default VistaOperaciones;