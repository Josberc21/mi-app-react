

export const validarFormularioVacio = (campos) => {
  return Object.values(campos).some(valor => !valor);
};

export const validarNumeroPositivo = (numero) => {
  const num = parseFloat(numero);
  return !isNaN(num) && num > 0;
};

export const validarRangoFechas = (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) return false;
  return new Date(fechaInicio) <= new Date(fechaFin);
};

export const validarCantidadDisponible = (cantidad, disponible) => {
  const cant = parseInt(cantidad);
  return !isNaN(cant) && cant > 0 && cant <= disponible;
};