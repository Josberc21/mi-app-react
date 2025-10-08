// src/components/empleados/TablaEmpleados.jsx
import React from 'react';
import { Edit, Trash2, DollarSign } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, QrCode } from 'lucide-react';


const TablaEmpleados = ({ 
  empleados, 
  onEditar, 
  onEliminar,
  calcularNomina 
}) => {

  // ✅ Nueva función para generar el QR con opción de imprimir y descargar
  const generarQRParaImprimir = (empleado) => {
    const url = `${window.location.origin}/operario/${empleado.id}`;
    const ventana = window.open('', '', 'width=500,height=700');
    ventana.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>QR - ${empleado.nombre}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 40px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              margin: 0;
            }
            .container {
              background: white;
              color: #333;
              padding: 30px;
              border-radius: 20px;
              max-width: 400px;
              margin: 0 auto;
              box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            }
            h1 {
              font-size: 28px;
              margin-bottom: 10px;
              color: #667eea;
            }
            .id {
              font-size: 20px;
              color: #666;
              margin-bottom: 30px;
              font-weight: bold;
            }
            .qr-container {
              background: white;
              padding: 20px;
              border-radius: 15px;
              display: inline-block;
              margin: 20px 0;
            }
            .instructions {
              font-size: 16px;
              color: #666;
              margin-top: 20px;
              line-height: 1.6;
            }
            .btns {
              display: flex;
              justify-content: center;
              gap: 15px;
              margin-top: 30px;
            }
            button {
              background: #667eea;
              color: white;
              border: none;
              padding: 12px 30px;
              font-size: 16px;
              border-radius: 10px;
              cursor: pointer;
              font-weight: bold;
              transition: background 0.3s;
            }
            button:hover {
              background: #764ba2;
            }
            @media print {
              body { background: white; padding: 20px; }
              .btns { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${empleado.nombre}</h1>
            <p class="id">ID: ${empleado.id}</p>
            
            <div class="qr-container">
              <div id="qr"></div>
            </div>
            
            <div class="instructions">
              <p><strong>📱 Cómo usar:</strong></p>
              <p>1. Pega este QR en tu máquina</p>
              <p>2. Escanea con tu celular</p>
              <p>3. Ve tus asignaciones al instante</p>
              <p style="margin-top: 20px; font-size: 14px; color: #999;">
                ${url}
              </p>
            </div>

            <div class="btns">
              <button onclick="window.print()">🖨️ Imprimir</button>
              <button id="descargarQR">⬇️ Descargar QR</button>
            </div>
          </div>
          
          <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
          <script>
            const qrDiv = document.getElementById("qr");
            const qr = new QRCode(qrDiv, {
              text: "${url}",
              width: 250,
              height: 250,
              colorDark: "#667eea",
              colorLight: "#ffffff",
              correctLevel: QRCode.CorrectLevel.H
            });

            // Esperar a que el QR se genere y luego habilitar descarga
            setTimeout(() => {
              const canvas = qrDiv.querySelector("canvas");
              document.getElementById("descargarQR").addEventListener("click", () => {
                const enlace = document.createElement("a");
                enlace.href = canvas.toDataURL("image/png");
                enlace.download = "QR_${empleado.nombre.replace(/\\s+/g, '_')}.png";
                enlace.click();
              });
            }, 500);
          </script>
        </body>
      </html>
    `);
  };

  if (empleados.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No hay empleados registrados</p>
        <p className="text-sm mt-2">Agrega el primer empleado usando el formulario arriba</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Teléfono</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nómina Acumulada</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {empleados.map(empleado => {
            const nomina = calcularNomina(empleado.id);
            
            return (
              <tr key={empleado.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{empleado.id}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{empleado.nombre}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{empleado.telefono}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    <DollarSign className="w-4 h-4 mr-1" />
                    ${nomina.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditar(empleado)}
                      className="p-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEliminar(empleado.id)}
                      className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => generarQRParaImprimir(empleado)}
                      className="p-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                      title="Generar QR"
                    >
                      <QrCode className="w-4 h-4" />
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
