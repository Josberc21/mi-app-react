// src/components/prendas/FormularioPrenda.jsx
import React from 'react';
import { Package, FileText, Save, Loader2 } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" /> Referencia *
          </label>
          <input
            type="text"
            name="referencia"
            value={formData.referencia}
            onChange={onChange}
            className="input-base uppercase"
            placeholder="Ej: BUSO ALBATROS"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Descripción (opcional)
          </label>
          <input
            type="text"
            name="descripcion"
            value={formData.descripcion}
            onChange={onChange}
            className="input-base"
            placeholder="Ej: Buso deportivo con capota"
          />
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

export default FormularioPrenda;
