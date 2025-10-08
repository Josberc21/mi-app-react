import React from 'react';

const Toast = ({ toast, onClose }) => {
  if (!toast.show) return null;

  const estilos = {
    exito: 'bg-green-500 border-green-600',
    error: 'bg-red-500 border-red-600',
    advertencia: 'bg-yellow-500 border-yellow-600',
    info: 'bg-blue-500 border-blue-600'
  };

  const iconos = {
    exito: '✓',
    error: '✕',
    advertencia: '⚠',
    info: 'ℹ'
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${estilos[toast.tipo]} text-white px-6 py-4 rounded-lg shadow-2xl border-l-4 max-w-md`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl font-bold">{iconos[toast.tipo]}</span>
          <div className="flex-1">
            <p className="font-semibold text-sm whitespace-pre-line">{toast.mensaje}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 font-bold text-lg"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;