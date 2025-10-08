import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const ModalInput = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  titulo, 
  label, 
  placeholder, 
  valorInicial = '', 
  tipo = 'text', 
  min, 
  max 
}) => {
  const [valor, setValor] = useState(valorInicial);

  useEffect(() => {
    if (isOpen) setValor(valorInicial);
  }, [isOpen, valorInicial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (valor.trim()) {
      onSubmit(valor);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titulo} size="sm">
      <form onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <input
          type={tipo}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-4"
          placeholder={placeholder}
          min={min}
          max={max}
          autoFocus
        />
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Confirmar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalInput;