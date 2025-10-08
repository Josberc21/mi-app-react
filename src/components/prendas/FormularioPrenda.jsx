// src/components/prendas/FormularioPrenda.jsx
import React from 'react';
import { Package, FileText } from 'lucide-react';

const FormularioPrenda = ({ 
  formData, 
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
        {editando ? 'Editar Prenda' : 'Nueva Prenda'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Package className="w-4 h-4 inline mr-1" />
            Referencia *
          </label>
          <input
            type="text"
            name="referencia"
            value={formData.referencia}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
            placeholder="Ej: BUSO ALBATROS"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            Descripción (opcional)
          </label>
          <input
            type="text"
            name="descripcion"
            value={formData.descripcion}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Buso deportivo con capota"
          />
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

export default FormularioPrenda;