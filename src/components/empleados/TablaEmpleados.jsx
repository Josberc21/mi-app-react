import React from 'react';
import { Edit, Trash2, QrCode, DollarSign, Users } from 'lucide-react';

const TablaEmpleados = ({ empleados, onEditar, onEliminar, calcularNomina }) => {
  const generarQRParaImprimir = (empleado) => {
    const url = window.location.origin;
    const nombreSeguro = empleado.nombre.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const ventana = window.open('', '', 'width=500,height=680');
    ventana.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>QR - ${nombreSeguro}</title>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; text-align: center; padding: 40px; background: #0b0f1a; margin: 0; }
            .container { background: white; padding: 36px; border-radius: 20px; max-width: 380px; margin: 0 auto; box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
            .badge { display: inline-block; background: #eef2ff; color: #4f46e5; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
            h1 { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 6px; }
            .id { font-size: 14px; color: #94a3b8; margin-bottom: 24px; }
            .qr-container { background: #f8fafc; padding: 20px; border-radius: 16px; display: inline-block; margin: 8px 0 24px; border: 1px solid #e2e8f0; }
            .instructions { font-size: 13px; color: #64748b; line-height: 1.7; text-align: left; background: #f8fafc; border-radius: 12px; padding: 16px; }
            .url { font-size: 11px; color: #94a3b8; word-break: break-all; margin-top: 12px; }
            .btns { display: flex; justify-content: center; gap: 12px; margin-top: 24px; }
            button { background: #4f46e5; color: white; border: none; padding: 10px 24px; font-size: 14px; border-radius: 10px; cursor: pointer; font-weight: 600; }
            button:hover { background: #4338ca; }
            @media print { body { background: white; } .btns { display: none; } }
          </style>
        </head>
        <body>
          <div class="container">
            <span class="badge">Operario</span>
            <h1>${nombreSeguro}</h1>
            <p class="id">ID: ${empleado.id} · ${empleado.telefono || ''}</p>
            <div class="qr-container"><div id="qr"></div></div>
            <div class="instructions">
              <strong>Cómo acceder:</strong><br/>
              1. Escanea el QR con tu celular<br/>
              2. Ingresa tu usuario y contraseña<br/>
              3. Revisa tus asignaciones del día
              <div class="url">${url}</div>
            </div>
            <div class="btns">
              <button onclick="window.print()">Imprimir</button>
              <button id="dl">Descargar QR</button>
            </div>
          </div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
          <script>
            const qr = new QRCode(document.getElementById("qr"), { text: "${url}", width: 220, height: 220, colorDark: "#4f46e5", colorLight: "#f8fafc", correctLevel: QRCode.CorrectLevel.H });
            setTimeout(() => {
              const canvas = document.getElementById("qr").querySelector("canvas");
              document.getElementById("dl").addEventListener("click", () => {
                const a = document.createElement("a");
                a.href = canvas.toDataURL("image/png");
                a.download = "QR_${empleado.nombre.replace(/[^a-zA-Z0-9]/g, '_')}.png";
                a.click();
              });
            }, 500);
          </script>
        </body>
      </html>
    `);
  };

  if (empleados.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <Users className="w-7 h-7 text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium">No hay empleados registrados</p>
        <p className="text-slate-400 text-sm mt-1">Agrega el primer empleado con el formulario</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="table-base min-w-[600px]">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Nómina acumulada</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map((emp) => {
            const nomina = calcularNomina(emp.id);
            return (
              <tr key={emp.id}>
                <td>
                  <span className="badge-slate font-mono text-xs">{emp.id}</span>
                </td>
                <td className="font-medium text-slate-900">{emp.nombre}</td>
                <td className="text-slate-500">{emp.telefono}</td>
                <td>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold">
                    <DollarSign className="w-3.5 h-3.5" />
                    {nomina.toLocaleString()}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditar(emp)}
                      title="Editar"
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEliminar(emp.id)}
                      title="Eliminar"
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => generarQRParaImprimir(emp)}
                      title="Generar QR"
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TablaEmpleados;
