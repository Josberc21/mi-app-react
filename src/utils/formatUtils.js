
export const formatearMoneda = (monto) => {
  return parseFloat(monto).toLocaleString();
};

export const formatearPorcentaje = (valor) => {
  return `${Math.round(valor)}%`;
};

export const capitalizar = (texto) => {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};

export const normalizarTexto = (texto) => {
  if (!texto) return '';
  return texto.trim().toUpperCase();
};