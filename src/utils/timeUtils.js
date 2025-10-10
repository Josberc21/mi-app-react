// src/utils/timeUtils.js

/**
 * Utilidades para manejo de períodos de tiempo y comparaciones
 */

export const PERIODOS = {
  HOY: 'hoy',
  AYER: 'ayer',
  ULTIMOS_7_DIAS: '7d',
  ULTIMOS_30_DIAS: '30d',
  ULTIMOS_90_DIAS: '90d',
  ESTE_MES: 'este_mes',
  MES_ANTERIOR: 'mes_anterior',
  CUSTOM: 'custom'
};

/**
 * Obtiene las fechas de inicio y fin para un período dado
 * @param {string} periodo - Uno de los valores de PERIODOS
 * @param {Date} fechaReferencia - Fecha de referencia (default: hoy)
 * @returns {Object} { inicio: Date, fin: Date }
 */
export const obtenerRangoPeriodo = (periodo, fechaReferencia = new Date()) => {
  const fin = new Date(fechaReferencia);
  fin.setHours(23, 59, 59, 999);
  
  const inicio = new Date(fechaReferencia);
  inicio.setHours(0, 0, 0, 0);

  switch (periodo) {
    case PERIODOS.HOY:
      return { inicio, fin };

    case PERIODOS.AYER:
      inicio.setDate(inicio.getDate() - 1);
      fin.setDate(fin.getDate() - 1);
      return { inicio, fin };

    case PERIODOS.ULTIMOS_7_DIAS:
      inicio.setDate(inicio.getDate() - 6);
      return { inicio, fin };

    case PERIODOS.ULTIMOS_30_DIAS:
      inicio.setDate(inicio.getDate() - 29);
      return { inicio, fin };

    case PERIODOS.ULTIMOS_90_DIAS:
      inicio.setDate(inicio.getDate() - 89);
      return { inicio, fin };

    case PERIODOS.ESTE_MES:
      inicio.setDate(1);
      return { inicio, fin };

    case PERIODOS.MES_ANTERIOR:
      fin.setMonth(fin.getMonth() - 1);
      fin.setDate(0); // Último día del mes anterior
      inicio.setMonth(inicio.getMonth() - 1);
      inicio.setDate(1);
      return { inicio, fin };

    default:
      return { inicio, fin };
  }
};

/**
 * Obtiene el período anterior para comparación
 * @param {string} periodo - Período actual
 * @param {Date} fechaReferencia - Fecha de referencia
 * @returns {Object} { inicio: Date, fin: Date }
 */
export const obtenerPeriodoAnterior = (periodo, fechaReferencia = new Date()) => {
  const rangoActual = obtenerRangoPeriodo(periodo, fechaReferencia);
  const diasDiferencia = Math.ceil((rangoActual.fin - rangoActual.inicio) / (1000 * 60 * 60 * 24)) + 1;

  const finAnterior = new Date(rangoActual.inicio);
  finAnterior.setDate(finAnterior.getDate() - 1);
  finAnterior.setHours(23, 59, 59, 999);

  const inicioAnterior = new Date(finAnterior);
  inicioAnterior.setDate(inicioAnterior.getDate() - diasDiferencia + 1);
  inicioAnterior.setHours(0, 0, 0, 0);

  return { inicio: inicioAnterior, fin: finAnterior };
};

/**
 * Verifica si una fecha está dentro de un rango
 * @param {Date|string} fecha - Fecha a verificar
 * @param {Object} rango - { inicio: Date, fin: Date }
 * @returns {boolean}
 */
export const fechaEnRango = (fecha, rango) => {
  const f = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return f >= rango.inicio && f <= rango.fin;
};

/**
 * Calcula el porcentaje de cambio entre dos valores
 * @param {number} actual - Valor actual
 * @param {number} anterior - Valor anterior
 * @returns {Object} { porcentaje: number, direccion: 'up'|'down'|'neutral' }
 */
export const calcularCambio = (actual, anterior) => {
  if (anterior === 0) {
    return { 
      porcentaje: actual > 0 ? 100 : 0, 
      direccion: actual > 0 ? 'up' : 'neutral' 
    };
  }

  const porcentaje = ((actual - anterior) / anterior) * 100;
  const direccion = porcentaje > 0 ? 'up' : porcentaje < 0 ? 'down' : 'neutral';

  return { 
    porcentaje: Math.abs(Math.round(porcentaje * 10) / 10), 
    direccion 
  };
};

/**
 * Formatea un rango de fechas para mostrar
 * @param {Object} rango - { inicio: Date, fin: Date }
 * @returns {string}
 */
export const formatearRangoFechas = (rango) => {
  const opcionesCortas = { month: 'short', day: 'numeric' };
  const opcionesLargas = { month: 'short', day: 'numeric', year: 'numeric' };

  const mismaMes = rango.inicio.getMonth() === rango.fin.getMonth();
  const mismoAño = rango.inicio.getFullYear() === rango.fin.getFullYear();

  if (mismaMes && mismoAño) {
    return `${rango.inicio.toLocaleDateString('es-CO', { day: 'numeric' })} - ${rango.fin.toLocaleDateString('es-CO', opcionesCortas)}`;
  }

  if (mismoAño) {
    return `${rango.inicio.toLocaleDateString('es-CO', opcionesCortas)} - ${rango.fin.toLocaleDateString('es-CO', opcionesCortas)}`;
  }

  return `${rango.inicio.toLocaleDateString('es-CO', opcionesLargas)} - ${rango.fin.toLocaleDateString('es-CO', opcionesLargas)}`;
};

/**
 * Genera array de fechas día por día en un rango
 * @param {Object} rango - { inicio: Date, fin: Date }
 * @returns {Array<string>} Array de fechas en formato YYYY-MM-DD
 */
export const generarDiasEnRango = (rango) => {
  const dias = [];
  const actual = new Date(rango.inicio);

  while (actual <= rango.fin) {
    dias.push(actual.toISOString().split('T')[0]);
    actual.setDate(actual.getDate() + 1);
  }

  return dias;
};

/**
 * Obtiene el nombre del período para mostrar en UI
 * @param {string} periodo - Período
 * @returns {string}
 */
export const obtenerNombrePeriodo = (periodo) => {
  const nombres = {
    [PERIODOS.HOY]: 'Hoy',
    [PERIODOS.AYER]: 'Ayer',
    [PERIODOS.ULTIMOS_7_DIAS]: 'Últimos 7 días',
    [PERIODOS.ULTIMOS_30_DIAS]: 'Últimos 30 días',
    [PERIODOS.ULTIMOS_90_DIAS]: 'Últimos 90 días',
    [PERIODOS.ESTE_MES]: 'Este mes',
    [PERIODOS.MES_ANTERIOR]: 'Mes anterior',
    [PERIODOS.CUSTOM]: 'Personalizado'
  };

  return nombres[periodo] || periodo;
};