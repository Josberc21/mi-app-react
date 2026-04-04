import React, { useState, useMemo } from 'react';
import { Package } from 'lucide-react';
import CampoBusqueda from '../common/CampoBusqueda';
import Paginacion from '../common/Paginacion';
import ModalConfirmar from '../common/ModalConfirmar';
import FormularioOrden from './FormularioOrden';
import TarjetaOrden from './TarjetaOrden';
import { useBusqueda } from '../../hooks/useBusqueda';
import { usePaginacion } from '../../hooks/usePaginacion';
import { useModal } from '../../hooks/useModal';
import { crearOrden, actualizarOrden, eliminarOrden } from '../../services/ordenesService';
import { obtenerFechaHoy } from '../../utils/dateUtils';

const FILTROS = [
  { key: 'todas',      label: 'Todas'      },
  { key: 'activa',     label: 'Activas'    },
  { key: 'completada', label: 'Completadas'},
  { key: 'despachada', label: 'Despachadas'},
];

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
  const [editando, setEditando]           = useState(null);
  const [ordenesExpandidas, setOrdenesExpandidas] = useState({});
  const [filtroEstado, setFiltroEstado]   = useState('todas');

  const modalEliminar = useModal();

  // Búsqueda por número de orden, color y prenda
  const { busqueda, setBusqueda, datosFiltrados } = useBusqueda(
    ordenes,
    (o, t) => {
      const prenda = prendas.find(p => p.id === o.prenda_id);
      return (
        o.numero_orden?.toString().includes(t) ||
        o.color?.toLowerCase().includes(t.toLowerCase()) ||
        (prenda?.referencia?.toLowerCase().includes(t.toLowerCase()))
      );
    }
  );

  // Filtro por estado
  const ordenesFiltradas = useMemo(() => {
    if (filtroEstado === 'todas') return datosFiltrados;
    return datosFiltrados.filter(o =>
      (o.estado || '').toLowerCase() === filtroEstado
    );
  }, [datosFiltrados, filtroEstado]);

  // Contadores por estado para los badges
  const contadores = useMemo(() => ({
    todas:      ordenes.length,
    activa:     ordenes.filter(o => (o.estado || '').toLowerCase() === 'activa').length,
    completada: ordenes.filter(o => (o.estado || '').toLowerCase() === 'completada').length,
    despachada: ordenes.filter(o => (o.estado || '').toLowerCase() === 'despachada').length,
  }), [ordenes]);

  const {
    paginaActual, totalPaginas, datosPaginados,
    primeraPagina, paginaAnterior, paginaSiguiente, ultimaPagina
  } = usePaginacion(ordenesFiltradas, 15);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setFormOrden({ prenda_id: '', color: '', talla: 'S', cantidad_total: '', fecha_entrada: obtenerFechaHoy() });
    setEditando(null);
  };

  const toggleOrdenExpandida = (ordenId) => {
    setOrdenesExpandidas(prev => ({ ...prev, [ordenId]: !prev[ordenId] }));
  };

  return (
    <div className="space-y-6 animate-slide-up">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Órdenes de Producción</h1>
          <p className="text-slate-500 text-sm mt-0.5">Gestiona las órdenes del taller</p>
        </div>
        <span className="badge-brand text-sm px-3 py-1.5 font-semibold">{ordenes.length} órdenes</span>
      </div>

      {/* Formulario */}
      <div className="card-p">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 bg-brand-600 rounded-full" />
          <h2 className="text-sm font-semibold text-slate-800">
            {editando ? 'Editar orden' : 'Nueva orden de producción'}
          </h2>
        </div>
        <FormularioOrden
          formOrden={formOrden}
          setFormOrden={setFormOrden}
          prendas={prendas}
          editando={editando}
          onSubmit={handleSubmit}
          onCancelar={resetForm}
        />
      </div>

      {/* Lista */}
      <div className="card-p space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Listado de órdenes</h2>
          <span className="text-xs text-slate-400">
            {ordenesFiltradas.length} resultado{ordenesFiltradas.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Búsqueda */}
        <CampoBusqueda
          valor={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar por número, color o prenda..."
          totalResultados={datosFiltrados.length}
          totalItems={ordenes.length}
        />

        {/* Filtros por estado */}
        <div className="flex flex-wrap gap-2">
          {FILTROS.map(f => (
            <button
              key={f.key}
              onClick={() => setFiltroEstado(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filtroEstado === f.key
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                filtroEstado === f.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {contadores[f.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Tarjetas paginadas */}
        {datosPaginados.length > 0 ? (
          <div className="space-y-3">
            {datosPaginados.map(orden => (
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
            <p className="text-slate-600 font-medium">
              {busqueda || filtroEstado !== 'todas' ? 'Sin resultados' : 'Sin órdenes registradas'}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {busqueda || filtroEstado !== 'todas'
                ? 'Prueba con otro filtro o búsqueda'
                : 'Crea la primera orden con el formulario'}
            </p>
          </div>
        )}

        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          totalItems={ordenesFiltradas.length}
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
        titulo="¿Eliminar orden?"
        mensaje={`¿Eliminar la orden ${modalEliminar.modalData?.numero_orden}? Esta acción no se puede deshacer.`}
        tipo="danger"
      />
    </div>
  );
};

export default VistaOrdenes;
