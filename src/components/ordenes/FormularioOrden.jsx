import React from 'react';
import { TALLAS, COLORES_DISPONIBLES } from '../../constants';
import { Save } from 'lucide-react';

const FormularioOrden = ({
  formOrden,
  setFormOrden,
  prendas,
  editando,
  onSubmit,
  onCancelar
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Prenda *</label>
          <select
            value={formOrden.prenda_id}
            onChange={(e) => setFormOrden({ ...formOrden, prenda_id: e.target.value })}
            className="input-base"
            required
          >
            <option value="">Seleccione</option>
            {prendas.map(p => (
              <option key={p.id} value={p.id}>{p.referencia}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Color *</label>
          <select
            value={formOrden.color}
            onChange={(e) => setFormOrden({ ...formOrden, color: e.target.value })}
            className="input-base"
            required
          >
            <option value="">Seleccione</option>
            {COLORES_DISPONIBLES.map(color => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Talla *</label>
          <select
            value={formOrden.talla}
            onChange={(e) => setFormOrden({ ...formOrden, talla: e.target.value })}
            className="input-base"
            required
          >
            {TALLAS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Cantidad Total *</label>
          <input
            type="number"
            value={formOrden.cantidad_total}
            onChange={(e) => setFormOrden({ ...formOrden, cantidad_total: e.target.value })}
            className="input-base"
            placeholder="60"
            min="1"
            required
          />
        </div>

        <div className="flex items-end gap-2">
          <button type="submit" className="btn-primary flex-1 gap-2">
            <Save className="w-4 h-4" />
            {editando ? 'Actualizar' : 'Crear Orden'}
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

export default FormularioOrden;
