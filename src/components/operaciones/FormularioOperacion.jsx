// src/components/operaciones/FormularioOperacion.jsx
import React from 'react';
import { Settings, DollarSign, Package } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-6">
      <h3 className="font-semibold text-lg mb-4">
        {editando ? 'Editar Operación' : 'Nueva Operación'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Settings className="w-4 h-4 inline mr-1" />
            Nombre Operación *
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
            placeholder="Ej: CERRAR HOMBROS"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Costo *
          </label>
          <input
            type="number"
            name="costo"
            value={formData.costo}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="150"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Package className="w-4 h-4 inline mr-1" />
            Prenda *
          </label>
          <select
            name="prenda_id"
            value={formData.prenda_id}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Seleccionar prenda</option>
            {prendas.map(p => (
              <option key={p.id} value={p.id}>
                {p.referencia}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? 'Guardando...' : editando ? 'Actualizar' : 'Agregar'}
          </button>
          
          {editando && (
            <button
              type="button"
              onClick={onCancelar}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default FormularioOperacion;