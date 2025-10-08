import React from 'react';
import { TALLAS, COLORES_DISPONIBLES } from '../../constants';

const FormularioOrden = ({ 
  formOrden, 
  setFormOrden, 
  prendas, 
  editando, 
  onSubmit, 
  onCancelar 
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-gray-50 p-4 rounded">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prenda *
          </label>
          <select
            value={formOrden.prenda_id}
            onChange={(e) => setFormOrden({ ...formOrden, prenda_id: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="">Seleccione</option>
            {prendas.map(p => (
              <option key={p.id} value={p.id}>{p.referencia}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color *
          </label>
          <select
            value={formOrden.color}
            onChange={(e) => setFormOrden({ ...formOrden, color: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="">Seleccione</option>
            {COLORES_DISPONIBLES.map(color => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Talla *
          </label>
          <select
            value={formOrden.talla}
            onChange={(e) => setFormOrden({ ...formOrden, talla: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
          >
            {TALLAS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cantidad Total *
          </label>
          <input
            type="number"
            value={formOrden.cantidad_total}
            onChange={(e) => setFormOrden({ ...formOrden, cantidad_total: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            placeholder="60"
            min="1"
            required
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {editando ? 'Actualizar' : 'Crear Orden'}
          </button>
          {editando && (
            <button
              type="button"
              onClick={onCancelar}
              className="px-4 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default FormularioOrden;