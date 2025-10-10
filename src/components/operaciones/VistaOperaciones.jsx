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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Settings className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Operaciones</h2>
            <p className="text-gray-600">Administra las operaciones y sus costos</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total operaciones</p>
          <p className="text-3xl font-bold text-orange-600">{operaciones.length}</p>
        </div>
      </div>

      {/* Formulario Manual */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            {editando ? 'Editar Operación' : 'Nueva Operación'}
          </h3>
          <button
            onClick={() => setMostrarCargaMasiva(!mostrarCargaMasiva)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${mostrarCargaMasiva
                ? 'bg-gray-200 text-gray-700'
                : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
          >
            <Upload className="w-5 h-5" />
            {mostrarCargaMasiva ? 'Ocultar Carga Masiva' : 'Carga Masiva Excel'}
          </button>
        </div>

        {/* Mostrar carga masiva o formulario manual */}
        {mostrarCargaMasiva ? (
          <CargaMasiva
            onExito={mostrarExito}
            onError={mostrarError}
            onInfo={mostrarInfo}
            recargarDatos={recargarDatos}
          />
        ) : (
          <FormularioOperacion
            formData={formData}
            prendas={prendas}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancelar={handleCancelar}
            editando={!!editando}
            loading={guardando}
          />
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Catálogo de Operaciones</h3>
        {ordenCosto && (
          <div className="mb-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
            <strong>Ordenando por:</strong> {
              ordenCosto === 'menor' ? 'Costo menor a mayor ↑' : 'Costo mayor a menor ↓'
            }
            <button
              onClick={() => setOrdenCosto(null)}
              className="ml-2 underline hover:no-underline"
            >
              Quitar orden
            </button>
          </div>
        )}
        <CampoBusqueda
          valor={busqueda}
          onChange={setBusqueda}
          placeholder="🔍 Buscar por ID, nombre de operación, costo o prenda..."
          totalResultados={datosFiltrados.length}
          totalItems={operaciones.length}
        />

        <TablaOperaciones
          operaciones={datosPaginados}
          prendas={prendas}
          onEditar={handleEditar}
          onEliminar={(id) => modalEliminar.abrir(id)}
          ordenCosto={ordenCosto}
          onCambiarOrdenCosto={handleCambiarOrdenCosto}
        />

        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          totalItems={operacionesOrdenadas.length}
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
        titulo="¿Eliminar operación?"
        mensaje="Esta acción marcará la operación como inactiva. Las asignaciones históricas se mantendrán."
        tipo="danger"
      />
    </div>
  );
};

export default VistaOperaciones;