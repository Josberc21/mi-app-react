// src/constants/index.js

export const TALLAS = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

export const COLORES_DISPONIBLES = [
  'Negro',
  'Blanco',
  'Azul',
  'Rojo',
  'Verde',
  'Amarillo',
  'Gris',
  'Beige',
  'Rosado',
  'Morado',
  'Naranja',
  'Café'
];

export const USUARIOS = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'operario', password: 'operario123', role: 'basico' }
];

export const ITEMS_POR_PAGINA = 20;

export const FILTROS_TALLER = {
  HOY: 'hoy',
  AYER: 'ayer',
  CINCO_DIAS: '5dias',
  DIEZ_DIAS: '10dias',
  QUINCE_DIAS: '15dias',
  MES: 'mes',
  TODO: 'todo'
};

export const TIPOS_TOAST = {
  EXITO: 'exito',
  ERROR: 'error',
  ADVERTENCIA: 'advertencia',
  INFO: 'info'
};

export const GRAFICOS_COLORES = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];