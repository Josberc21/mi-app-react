// src/components/operaciones/FormularioOperacion.jsx
import React from 'react';
import { Settings, DollarSign, Package, Save, Loader2 } from 'lucide-react';

const FormularioOperacion = ({
  formData,
  prendas = [],
  onChange,
  onSubmit,
  onCancelar,
  editando = false,
  loading = false
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" /> Nombre Operación *
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={onChange}
            className="input-base uppercase"
            placeholder="Ej: CERRAR HOMBROS"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" /> Costo *
          </label>
          <input
            type="number"
            name="costo"
            value={formData.costo}
            onChange={onChange}
            className="input-base"
            placeholder="150"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" /> Prenda *
          </label>
          <select
            name="prenda_id"
            value={formData.prenda_id}
            onChange={onChange}
            className="input-base"
            required
          >
            <option value="">Seleccionar prenda</option>
            {prendas.map(p => (
              <option key={p.id} value={p.id}>{p.referencia}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1 gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? 'Guardando...' : editando ? 'Actualizar' : 'Agregar'}
          </button>
          {editando && (
            <button type="button" onClick={onCancelar} className="btn-secondary">
              Cancelar
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default FormularioOperacion;
