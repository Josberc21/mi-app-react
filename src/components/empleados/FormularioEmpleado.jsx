import React from 'react';
import { User, Phone, Save, X } from 'lucide-react';

const FormularioEmpleado = ({
  formData,
  onChange,
  onSubmit,
  onCancelar,
  editando = false,
  loading = false,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-5 bg-brand-600 rounded-full" />
        <h3 className="text-sm font-semibold text-slate-800">
          {editando ? 'Editar empleado' : 'Nuevo empleado'}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Nombre completo
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={onChange}
            className="input-base"
            placeholder="Ej: Juan Pérez"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            Teléfono
          </label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={onChange}
            className="input-base"
            placeholder="Ej: 3001234567"
            required
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {editando ? 'Actualizar' : 'Agregar'}
              </>
            )}
          </button>

          {editando && (
            <button type="button" onClick={onCancelar} className="btn-secondary">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default FormularioEmpleado;
