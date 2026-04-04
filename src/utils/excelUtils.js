// src/utils/excelUtils.js
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Descarga plantilla Excel de operaciones con formato y hoja de instrucciones
 */
export const descargarPlantillaOperaciones = () => {
  const wb = XLSX.utils.book_new();

  // ── Hoja 1: Datos ──────────────────────────────────────────────────────────
  const datos = [
    ['Referencia Prenda', 'Descripción Prenda', 'Nombre Operación', 'Costo'],
    ['BUSO ALBATROS', 'Buso deportivo con capota', 'CERRAR HOMBROS', 120],
    ['BUSO ALBATROS', 'Buso deportivo con capota', 'MONTAR MANGAS', 200],
    ['CAMISA CASUAL', 'Camisa manga larga', 'HACER CUELLO', 150],
    ['CAMISA CASUAL', 'Camisa manga larga', 'PEGAR BOTONES', 80],
  ];

  const ws = XLSX.utils.aoa_to_sheet(datos);

  // Anchos de columna
  ws['!cols'] = [
    { wch: 22 }, // Referencia Prenda
    { wch: 30 }, // Descripción Prenda
    { wch: 28 }, // Nombre Operación
    { wch: 10 }, // Costo
  ];

  // Estilo de encabezados (negrita + fondo azul + texto blanco)
  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '2563EB' } },
    alignment: { horizontal: 'center' },
  };
  ['A1', 'B1', 'C1', 'D1'].forEach(cell => {
    if (ws[cell]) ws[cell].s = headerStyle;
  });

  XLSX.utils.book_append_sheet(wb, ws, 'Operaciones');

  // ── Hoja 2: Instrucciones ──────────────────────────────────────────────────
  const instrucciones = [
    ['INSTRUCCIONES DE USO — CARGA MASIVA DE OPERACIONES'],
    [''],
    ['COLUMNAS REQUERIDAS'],
    ['Columna', 'Descripción', 'Ejemplo', 'Obligatorio'],
    ['Referencia Prenda', 'Código o nombre único de la prenda (se crea si no existe)', 'BUSO ALBATROS', 'SÍ'],
    ['Descripción Prenda', 'Descripción larga de la prenda (solo si es nueva)', 'Buso deportivo con capota', 'No'],
    ['Nombre Operación', 'Nombre de la operación de confección', 'CERRAR HOMBROS', 'SÍ'],
    ['Costo', 'Valor en pesos colombianos (solo número, sin $ ni puntos)', '120', 'SÍ'],
    [''],
    ['REGLAS IMPORTANTES'],
    ['1. Si una prenda ya existe en el sistema, se reutiliza automáticamente (no se duplica).'],
    ['2. Si una operación con el mismo nombre ya existe para esa prenda, se omite (no se duplica).'],
    ['3. Los nombres de operación se guardan en MAYÚSCULAS automáticamente.'],
    ['4. El archivo debe ser .xlsx o .xls.'],
    ['5. Los datos deben comenzar en la fila 2 (fila 1 = encabezados).'],
    [''],
    ['ERRORES COMUNES'],
    ['- Costo con letras o símbolo $: usar solo números (ej: 120, no $120)'],
    ['- Columna renombrada: los encabezados deben ser exactamente como en la plantilla'],
    ['- Archivo vacío: debe tener al menos una fila de datos'],
  ];

  const wsInst = XLSX.utils.aoa_to_sheet(instrucciones);
  wsInst['!cols'] = [{ wch: 30 }, { wch: 45 }, { wch: 25 }, { wch: 12 }];

  // Estilo título
  if (wsInst['A1']) wsInst['A1'].s = { font: { bold: true, sz: 14, color: { rgb: '2563EB' } } };
  // Estilo sub-títulos de secciones
  ['A3', 'A10', 'A17'].forEach(cell => {
    if (wsInst[cell]) wsInst[cell].s = { font: { bold: true, color: { rgb: '0F172A' } } };
  });
  // Estilo encabezados de tabla de columnas
  ['A4', 'B4', 'C4', 'D4'].forEach(cell => {
    if (wsInst[cell]) wsInst[cell].s = { font: { bold: true }, fill: { fgColor: { rgb: 'E2E8F0' } } };
  });

  XLSX.utils.book_append_sheet(wb, wsInst, 'Instrucciones');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  saveAs(blob, 'Plantilla_Operaciones.xlsx');
};

/**
 * Lee y parsea archivo Excel
 */
export const leerArchivoExcel = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        resolve(jsonData);
      } catch (error) {
        reject(new Error('Error al leer el archivo: ' + error.message));
      }
    };
    
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Valida estructura del Excel de operaciones
 */
export const validarEstructuraOperaciones = (data) => {
  if (!data || data.length === 0) {
    return { valido: false, error: 'El archivo está vacío' };
  }

  const primeraFila = data[0];
  const columnasRequeridas = ['Referencia Prenda', 'Nombre Operación', 'Costo'];
  
  for (const columna of columnasRequeridas) {
    if (!(columna in primeraFila)) {
      return { 
        valido: false, 
        error: `Falta la columna requerida: "${columna}"` 
      };
    }
  }

  return { valido: true };
};