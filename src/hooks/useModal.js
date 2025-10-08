import { useState, useCallback } from 'react';

export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const abrir = useCallback((data = null) => {
    setModalData(data);
    setIsOpen(true);
  }, []);

  const cerrar = useCallback(() => {
    setIsOpen(false);
    setModalData(null);
  }, []);

  return {
    isOpen,
    modalData,
    abrir,
    cerrar
  };
};