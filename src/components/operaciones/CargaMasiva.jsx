// src/components/operaciones/CargaMasiva.jsx
import React, { useState, useRef } from 'react';
import { Download, Upload, AlertCircle, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { descargarPlantillaOperaciones, leerArchivoExcel, validarEstructuraOperaciones } from '../../utils/excelUtils';
import { buscarOCrearPrenda } from '../../services/prendasService';
import { crearOperacion, verificarOperacionExistente } from '../../services/operacionesService';

const CargaMasiva = ({
  onExito,
  onError,
  onInfo,
  recargarDatos
}) => {
  const [cargando, setCargando] = useState(false);
  const [progreso, setProgreso] = useState(null); // { actual, total }
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
    setProgreso(null);

    try {
      const data = await leerArchivoExcel(file);

      const validacion = validarEstructuraOperaciones(data);
      if (!validacion.valido) {
        onError(validacion.error);
        setCargando(false);
        return;
      }

      let prendasCreadas = 0;
      let operacionesCreadas = 0;
      let operacionesOmitidas = 0;
      const errores = [];
      const prendasCache = new Map();

      setProgreso({ actual: 0, total: data.length });

      for (let index = 0; index < data.length; index++) {
        const row = data[index];
        const numFila = index + 2;

        setProgreso({ actual: index + 1, total: data.length });

        try {
          const refPrenda = row['Referencia Prenda']?.toString().trim();
          const descPrenda = row['Descripción Prenda']?.toString().trim() || '';
          const nombreOp = row['Nombre Operación']?.toString().trim();
          const costo = parseFloat(row.Costo);

          if (!refPrenda || !nombreOp || isNaN(costo) || costo <= 0) {
            errores.push(`Fila ${numFila}: Datos incompletos o costo inválido`);
            continue;
          }

          const refKey = refPrenda.toUpperCase();
          let prenda;

          if (prendasCache.has(refKey)) {
            prenda = prendasCache.get(refKey);
          } else {
            const resultado = await buscarOCrearPrenda(refPrenda, descPrenda);
            prenda = resultado.prenda;
            prendasCache.set(refKey, prenda);
            if (resultado.esNueva) prendasCreadas++;
          }

          // Verificar duplicado antes de insertar
          const yaExiste = await verificarOperacionExistente(nombreOp, prenda.id);
          if (yaExiste) {
            operacionesOmitidas++;
            continue;
          }

          await crearOperacion({ nombre: nombreOp.toUpperCase(), costo, prenda_id: prenda.id });
          operacionesCreadas++;

        } catch (error) {
          errores.push(`Fila ${numFila}: ${error.message}`);
        }
      }

      const resumenFinal = {
        prendasCreadas,
        operacionesCreadas,
        operacionesOmitidas,
        errores: errores.slice(0, 10),
        totalErrores: errores.length,
        totalProcesadas: data.length,
      };

      setResultado(resumenFinal);
      setProgreso(null);

      if (errores.length === 0) {
        onExito(`Carga exitosa: ${prendasCreadas} prendas y ${operacionesCreadas} operaciones creadas${operacionesOmitidas > 0 ? `, ${operacionesOmitidas} omitidas por duplicado` : ''}`);
      } else {
        onInfo(`Proceso completado con ${errores.length} errores. Ver detalles abajo.`);
      }

      await recargarDatos();

    } catch (error) {
      onError('Error al procesar archivo: ' + error.message);
      setProgreso(null);
    } finally {
      setCargando(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) procesarArchivo(file);
  };

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 bg-brand-50 border border-brand-100 rounded-xl">
        <AlertCircle className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-brand-700">
          <p className="font-semibold mb-0.5">Carga Masiva Inteligente</p>
          <p className="opacity-80">Si una prenda no existe en el sistema, se creará automáticamente al cargar las operaciones.</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleDescargarPlantilla}
          disabled={cargando}
          className="btn-secondary gap-2"
        >
          <Download className="w-4 h-4" />
          Descargar Plantilla Excel
        </button>

        <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
          cargando
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-brand-600 text-white hover:bg-brand-700'
        }`}>
          {cargando
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Upload className="w-4 h-4" />}
          {cargando
            ? progreso
              ? `Procesando ${progreso.actual}/${progreso.total}...`
              : 'Leyendo archivo...'
            : 'Cargar Excel Masivo'}
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

      {/* Barra de progreso */}
      {cargando && progreso && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Procesando fila {progreso.actual} de {progreso.total}…</span>
            <span>{Math.round((progreso.actual / progreso.total) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-200"
              style={{ width: `${(progreso.actual / progreso.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Result */}
      {resultado && (
        <div className="card p-4 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <h4 className="text-sm font-bold text-slate-900">Resultado de la Carga</h4>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="card p-3">
              <p className="text-xs text-slate-500">Filas leídas</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">{resultado.totalProcesadas}</p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-slate-500">Prendas creadas</p>
              <p className="text-2xl font-bold text-emerald-600 mt-0.5">{resultado.prendasCreadas}</p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-slate-500">Operaciones creadas</p>
              <p className="text-2xl font-bold text-brand-600 mt-0.5">{resultado.operacionesCreadas}</p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-slate-500">Omitidas (duplicado)</p>
              <p className={`text-2xl font-bold mt-0.5 ${resultado.operacionesOmitidas > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                {resultado.operacionesOmitidas}
              </p>
            </div>
            <div className="card p-3">
              <p className="text-xs text-slate-500">Errores</p>
              <p className={`text-2xl font-bold mt-0.5 ${resultado.totalErrores > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                {resultado.totalErrores}
              </p>
            </div>
          </div>

          {resultado.errores.length > 0 && (
            <div className="flex items-start gap-3 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl">
              <XCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-rose-700 space-y-1">
                <p className="font-semibold">Errores encontrados:</p>
                <ul className="space-y-0.5">
                  {resultado.errores.map((error, idx) => (
                    <li key={idx} className="font-mono opacity-90">· {error}</li>
                  ))}
                  {resultado.totalErrores > resultado.errores.length && (
                    <li className="italic opacity-70">
                      ... y {resultado.totalErrores - resultado.errores.length} errores más
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CargaMasiva;
