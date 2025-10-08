// src/utils/excelUtils.js
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Descarga plantilla Excel de operaciones
 */
export const descargarPlantillaOperaciones = () => {
  const plantilla = [
    {
      'Referencia Prenda': 'BUSO ALBATROS',
      'Descripción Prenda': 'Buso deportivo con capota',
      'Nombre Operación': 'CERRAR HOMBROS',
      'Costo': 120
    },
    {
      'Referencia Prenda': 'BUSO ALBATROS',
      'Descripción Prenda': 'Buso deportivo con capota',
      'Nombre Operación': 'MONTAR MANGAS',
      'Costo': 200
    },
    {
      'Referencia Prenda': 'CAMISA CASUAL',
      'Descripción Prenda': 'Camisa manga larga',
      'Nombre Operación': 'HACER CUELLO',
      'Costo': 150
    },
    {
      'Referencia Prenda': 'CAMISA CASUAL',
      'Descripción Prenda': 'Camisa manga larga',
      'Nombre Operación': 'PEGAR BOTONES',
      'Costo': 80
    }
  ];

  const ws = XLSX.utils.json_to_sheet(plantilla);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Operaciones');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
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