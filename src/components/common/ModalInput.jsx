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
  max,
}) => {
  const [valor, setValor] = useState(valorInicial);

  useEffect(() => {
    if (isOpen) setValor(valorInicial);
  }, [isOpen, valorInicial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (valor.toString().trim()) {
      onSubmit(valor);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titulo} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">{label}</label>
          <input
            type={tipo}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="input-base"
            placeholder={placeholder}
            min={min}
            max={max}
            autoFocus
          />
        </div>

        <div className="flex gap-3 justify-end pt-1">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Confirmar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalInput;
