import React from 'react';
import Modal from './Modal';

const ModalConfirmar = ({ isOpen, onClose, onConfirm, titulo, mensaje, tipo = 'warning' }) => {
  const colores = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    success: 'bg-green-600 hover:bg-green-700',
    info: 'bg-blue-600 hover:bg-blue-700'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titulo} size="sm">
      <p className="text-gray-700 mb-6">{mensaje}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2 text-white rounded ${colores[tipo]}`}
        >
          Confirmar
        </button>
      </div>
    </Modal>
  );
};

export default ModalConfirmar;