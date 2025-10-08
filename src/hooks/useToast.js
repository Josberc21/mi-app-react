import { useState, useCallback } from 'react';
import { TIPOS_TOAST } from '../constants';

export const useToast = () => {
  const [toast, setToast] = useState({ show: false, tipo: '', mensaje: '' });

  const mostrarToast = useCallback((tipo, mensaje) => {
    setToast({ show: true, tipo, mensaje });
    setTimeout(() => {
      setToast({ show: false, tipo: '', mensaje: '' });
    }, 4000);
  }, []);

  const cerrarToast = useCallback(() => {
    setToast({ show: false, tipo: '', mensaje: '' });
  }, []);

  const mostrarExito = useCallback((mensaje) => {
    mostrarToast(TIPOS_TOAST.EXITO, mensaje);
  }, [mostrarToast]);

  const mostrarError = useCallback((mensaje) => {
    mostrarToast(TIPOS_TOAST.ERROR, mensaje);
  }, [mostrarToast]);

  const mostrarAdvertencia = useCallback((mensaje) => {
    mostrarToast(TIPOS_TOAST.ADVERTENCIA, mensaje);
  }, [mostrarToast]);

  const mostrarInfo = useCallback((mensaje) => {
    mostrarToast(TIPOS_TOAST.INFO, mensaje);
  }, [mostrarToast]);

  return {
    toast,
    cerrarToast,
    mostrarExito,
    mostrarError,
    mostrarAdvertencia,
    mostrarInfo
  };
};