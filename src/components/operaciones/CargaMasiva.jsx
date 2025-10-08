// src/components/operaciones/CargaMasiva.jsx
import React, { useState, useRef } from 'react';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { descargarPlantillaOperaciones, leerArchivoExcel, validarEstructuraOperaciones } from '../../utils/excelUtils';
import { buscarOCrearPrenda } from '../../services/prendasService';
import { crearOperacion } from '../../services/operacionesService';

const CargaMasiva = ({ 
  onExito,
  onError,
  onInfo,
  recargarDatos 
}) => {
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const inputRef = useRef(null);

  const handleDescargarPlantilla = () => {
    try {
      descargarPlantillaOperaciones();
      onExito('Plantilla descargada correctamente');
    } catch (error) {
      onError('Error al descargar plantilla: ' + error.message);
    }
  };

  const procesarArchivo = async (file) => {
    setCargando(true);
    setResultado(null);

    try {
      // 1. Leer archivo
      const data = await leerArchivoExcel(file);

      // 2. Validar estructura
      const validacion = validarEstructuraOperaciones(data);
      if (!validacion.valido) {
        onError(validacion.error);
        setCargando(false);
        return;
      }

      // 3. Procesar cada fila
      let prendasCreadas = 0;
      let operacionesCreadas = 0;
      const errores = [];
      const prendasCache = new Map(); // Para no buscar la misma prenda múltiples veces

      for (let index = 0; index < data.length; index++) {
        const row = data[index];
        const numFila = index + 2; // +2 porque Excel empieza en 1 y tiene header

        try {
          // Extraer y validar datos
          const refPrenda = row['Referencia Prenda']?.toString().trim();
          const descPrenda = row['Descripción Prenda']?.toString().trim() || '';
          const nombreOp = row['Nombre Operación']?.toString().trim();
          const costo = parseFloat(row.Costo);

          // Validar datos básicos
          if (!refPrenda || !nombreOp || isNaN(costo)) {
            errores.push(`Fila ${numFila}: Datos incompletos o inválidos`);
            continue;
          }

          // Buscar o crear prenda (usar caché)
          const refKey = refPrenda.toUpperCase();
          let prenda;
          
          if (prendasCache.has(refKey)) {
            prenda = prendasCache.get(refKey);
          } else {
            const resultado = await buscarOCrearPrenda(refPrenda, descPrenda);
            prenda = resultado.prenda;
            prendasCache.set(refKey, prenda);
            
            if (resultado.esNueva) {
              prendasCreadas++;
            }
          }

          // Crear operación
          await crearOperacion({
            nombre: nombreOp,
            costo: costo,
            prenda_id: prenda.id
          });

          operacionesCreadas++;

        } catch (error) {
          errores.push(`Fila ${numFila}: ${error.message}`);
        }
      }

      // 4. Mostrar resultado
      const resumenFinal = {
        prendasCreadas,
        operacionesCreadas,
        errores: errores.slice(0, 10), // Máximo 10 errores
        totalErrores: errores.length,
        totalProcesadas: data.length
      };

      setResultado(resumenFinal);

      if (errores.length === 0) {
        onExito(`✓ Carga exitosa: ${prendasCreadas} prendas y ${operacionesCreadas} operaciones creadas`);
      } else {
        onInfo(`Proceso completado con ${errores.length} errores. Ver detalles abajo.`);
      }

      // Recargar datos
      await recargarDatos();

    } catch (error) {
      onError('Error al procesar archivo: ' + error.message);
    } finally {
      setCargando(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      procesarArchivo(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Información */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">💡 Carga Masiva Inteligente</p>
            <p>Si una prenda no existe en el sistema, se creará automáticamente al cargar las operaciones.</p>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <button
          onClick={handleDescargarPlantilla}
          disabled={cargando}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
        >
          <Download className="w-5 h-5" />
          Descargar Plantilla Excel
        </button>

        <label className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold cursor-pointer ${
          cargando 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-purple-600 text-white hover:bg-purple-700'
        }`}>
          <Upload className="w-5 h-5" />
          {cargando ? '⏳ Cargando...' : 'Cargar Excel Masivo'}
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={cargando}
            className="hidden"
          />
        </label>
      </div>

      {/* Resultado de la carga */}
      {resultado && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Resultado de la Carga
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-3 rounded shadow-sm">
              <p className="text-xs text-gray-600">Total Procesadas</p>
              <p className="text-2xl font-bold text-gray-900">{resultado.totalProcesadas}</p>
            </div>
            <div className="bg-green-50 p-3 rounded shadow-sm">
              <p className="text-xs text-green-700">Prendas Creadas</p>
              <p className="text-2xl font-bold text-green-600">{resultado.prendasCreadas}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded shadow-sm">
              <p className="text-xs text-blue-700">Operaciones Creadas</p>
              <p className="text-2xl font-bold text-blue-600">{resultado.operacionesCreadas}</p>
            </div>
            <div className={`p-3 rounded shadow-sm ${
              resultado.totalErrores > 0 ? 'bg-red-50' : 'bg-gray-50'
            }`}>
              <p className={`text-xs ${resultado.totalErrores > 0 ? 'text-red-700' : 'text-gray-600'}`}>
                Errores
              </p>
              <p className={`text-2xl font-bold ${
                resultado.totalErrores > 0 ? 'text-red-600' : 'text-gray-900'
              }`}>
                {resultado.totalErrores}
              </p>
            </div>
          </div>

          {resultado.errores.length > 0 && (
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <p className="font-semibold text-red-800 mb-2">
                ⚠️ Errores encontrados:
              </p>
              <ul className="text-sm text-red-700 space-y-1">
                {resultado.errores.map((error, idx) => (
                  <li key={idx} className="font-mono">• {error}</li>
                ))}
                {resultado.totalErrores > resultado.errores.length && (
                  <li className="italic">
                    ... y {resultado.totalErrores - resultado.errores.length} errores más
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CargaMasiva;