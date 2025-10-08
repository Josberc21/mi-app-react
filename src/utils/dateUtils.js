
export const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-CO');
};

export const formatearFechaCompleta = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const obtenerFechaHoy = () => {
  return new Date().toISOString().split('T')[0];
};

export const calcularDiasEntre = (fechaInicio, fechaFin) => {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  return Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
};

export const obtenerFechaHace = (dias) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return fecha;
};

export const esMismaFecha = (fecha1, fecha2) => {
  const f1 = new Date(fecha1);
  const f2 = new Date(fecha2);
  f1.setHours(0, 0, 0, 0);
  f2.setHours(0, 0, 0, 0);
  return f1.getTime() === f2.getTime();
};