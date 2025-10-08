import React, { useState, useEffect } from 'react';
import { User, Package, Settings, BarChart3, DollarSign, Clock, LogOut, Plus } from 'lucide-react';

// Hooks personalizados
import { useToast } from './hooks/useToast';
import { useDatos } from './hooks/useDatos';
import { useCalculos } from './hooks/useCalculos';

// Componentes comunes
import Toast from './components/common/Toast';
import Loading from './components/common/Loading';

// Constantes
import { USUARIOS } from './constants';


// Componentes
import VistaEmpleados from './components/empleados/VistaEmpleados';
import VistaPrendas from './components/prendas/VistaPrendas';
import VistaOperaciones from './components/operaciones/VistaOperaciones';
import VistaOrdenes from './components/ordenes/VistaOrdenes';
import VistaAsignaciones from './components/asignaciones/VistaAsignaciones';
import VistaRemisiones from './components/remisiones/VistaRemisiones';
import VistaNomina from './components/nomina/VistaNomina';
import VistaOperarioPublica from './components/operario/VistaOperarioPublica';
import VistaDashboard from './components/dashboard/VistaDashboard';
import PantallaTallerAdmin from './components/taller/PantallaTallerAdmin';
import PantallaTallerTV from './components/taller/PantallaTallerTv';
import { Monitor } from 'lucide-react'; // Para el icono

function App() {
  // ============================================
  // ESTADO DE AUTENTICACIÓN Y NAVEGACIÓN
  // ============================================
  const [currentUser, setCurrentUser] = useState(null);
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [activeView, setActiveView] = useState('login');
  const [modoKiosko, setModoKiosko] = useState(false);
  const [vistaOperarioPublica, setVistaOperarioPublica] = useState(null);

  // ============================================
  // HOOKS PERSONALIZADOS
  // ============================================
  const { toast, cerrarToast, mostrarExito, mostrarError, mostrarAdvertencia, mostrarInfo } = useToast();

  const {
    empleados,
    prendas,
    operaciones,
    asignaciones,
    ordenes,
    remisiones,
    loading,
    error,
    recargar: cargarDatos
  } = useDatos(currentUser);

  const {
    calcularNominaEmpleado,
    calcularNominaTotal,
    calcularProgresoOrden,
    estadisticasDashboard
  } = useCalculos(asignaciones, empleados, operaciones, ordenes, prendas);

  // ============================================
  // EFECTOS
  // ============================================

  // Verificar modo TV desde URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tv') === 'true') {
      setModoKiosko(true);
      document.documentElement.requestFullscreen?.();
    }
  }, []);

  // Actualización automática en vista taller
  useEffect(() => {
    let interval;
    if (activeView === 'taller') {
      interval = setInterval(() => {
        cargarDatos();
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [activeView, cargarDatos]);

  // Mostrar errores de carga
  useEffect(() => {
    if (error) {
      mostrarError(`Error al cargar datos: ${error}`);
    }
  }, [error, mostrarError]);

  // Detectar acceso público por URL /operario/:id
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/operario\/(\d+)/);

    if (match) {
      const empId = match[1];
      setVistaOperarioPublica(empId);
    }
  }, []);

  // ============================================
  // FUNCIONES DE AUTENTICACIÓN
  // ============================================

  const handleLogin = () => {
    const user = USUARIOS.find(u => u.username === loginId && u.password === loginPass);
    if (user) {
      setCurrentUser(user);
      setActiveView(user.role === 'admin' ? 'dashboard' : 'empleadoView');
      mostrarExito(`Bienvenido ${user.username}`);
    } else {
      mostrarError('Credenciales incorrectas');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginId('');
    setLoginPass('');
    setActiveView('login');
    mostrarInfo('Sesión cerrada');
  };

  // ============================================
  // COMPONENTE NAV BUTTON
  // ============================================

  const NavBtn = ({ view, icon: Icon, label }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`px-3 py-2 rounded text-sm ${activeView === view ? 'bg-blue-600 text-white' : 'bg-gray-200'
        }`}
    >
      <Icon className="w-4 h-4 inline mr-1" />{label}
    </button>
  );

  // ============================================
  // RENDERIZADO CONDICIONAL
  // ============================================

  // ✅ 1. Vista pública (sin login)
  if (vistaOperarioPublica) {
    return (
      <>
        <Toast toast={toast} onClose={cerrarToast} />
        <VistaOperarioPublica empleadoId={vistaOperarioPublica} />
      </>
    );
  }

  // ✅ 2. Modo Kiosko (TV)
  if (modoKiosko) {
    return (
      <PantallaTallerTV
        empleados={empleados}
        asignaciones={asignaciones}
        operaciones={operaciones}
        prendas={prendas}
        metaDiaria={1200}
        labelPreference="prendas"
        rotationInterval={10000}
      />
    );
  }

  // ✅ 3. Pantalla de Login
  if (activeView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <Toast toast={toast} onClose={cerrarToast} />
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Package className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">Sistema de Producción</h1>
            <p className="text-gray-600 mt-2">Gestión de Confección</p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Usuario"
            />
            <input
              type="password"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Contraseña"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Iniciar Sesión
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-600 bg-gray-50 p-4 rounded">
            <p className="font-semibold mb-2">Usuarios de prueba:</p>
            <p>Admin: admin / admin123</p>
            <p>Básico: operario / operario123</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ 4. Vista Operario (rol básico)
  if (activeView === 'empleadoView') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Toast toast={toast} onClose={cerrarToast} />
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Panel Operario</h1>
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-600">
              <LogOut className="w-5 h-5" />Salir
            </button>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto p-6">
          {loading && <Loading />}

          <VistaAsignaciones
            asignaciones={asignaciones}
            empleados={empleados}
            prendas={prendas}
            operaciones={operaciones}
            ordenes={ordenes}
            recargarDatos={cargarDatos}
            mostrarExito={mostrarExito}
            mostrarError={mostrarError}
            mostrarAdvertencia={mostrarAdvertencia}
          />
        </div>
      </div>
    );
  }

  // ✅ 5. Vista Admin
  return (
    <div className="min-h-screen bg-gray-50">
      <Toast toast={toast} onClose={cerrarToast} />

      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h1 className="text-2xl font-bold">Admin</h1>
            <div className="flex gap-2 flex-wrap">
              <NavBtn view="dashboard" icon={BarChart3} label="Dashboard" />
              <NavBtn view="asignar" icon={Plus} label="Asignar" />
              <NavBtn view="empleados" icon={User} label="Empleados" />
              <NavBtn view="prendas" icon={Package} label="Prendas" />
              <NavBtn view="operaciones" icon={Settings} label="Operaciones" />
              <NavBtn view="ordenes" icon={Package} label="Órdenes" />
              <NavBtn view="nomina" icon={DollarSign} label="Nómina" />
              <NavBtn view="remisiones" icon={Package} label="Remisiones" />
              <NavBtn view="taller-admin" icon={BarChart3} label="Taller Admin" />
              <NavBtn view="taller-tv" icon={Monitor} label="Pantalla TV" />
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded bg-red-600 text-white text-sm"
              >
                <LogOut className="w-4 h-4 inline mr-1" />Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {loading && <Loading />}

        {activeView === 'dashboard' && (
          <VistaDashboard
            empleados={empleados}
            asignaciones={asignaciones}
            operaciones={operaciones}
            prendas={prendas}
            ordenes={ordenes}
            remisiones={remisiones}
            estadisticasDashboard={estadisticasDashboard}
            calcularNominaEmpleado={calcularNominaEmpleado}
            calcularProgresoOrden={calcularProgresoOrden}
          />
        )}

        {activeView === 'empleados' && (
          <VistaEmpleados
            empleados={empleados}
            recargarDatos={cargarDatos}
            calcularNomina={calcularNominaEmpleado}
            mostrarExito={mostrarExito}
            mostrarError={mostrarError}
            mostrarAdvertencia={mostrarAdvertencia}
          />
        )}

        {activeView === 'prendas' && (
          <VistaPrendas
            prendas={prendas}
            operaciones={operaciones}
            recargarDatos={cargarDatos}
            mostrarExito={mostrarExito}
            mostrarError={mostrarError}
            mostrarAdvertencia={mostrarAdvertencia}
          />
        )}

        {activeView === 'operaciones' && (
          <VistaOperaciones
            operaciones={operaciones}
            prendas={prendas}
            recargarDatos={cargarDatos}
            mostrarExito={mostrarExito}
            mostrarError={mostrarError}
            mostrarAdvertencia={mostrarAdvertencia}
            mostrarInfo={mostrarInfo}
          />
        )}

        {activeView === 'ordenes' && (
          <VistaOrdenes
            ordenes={ordenes}
            prendas={prendas}
            operaciones={operaciones}
            asignaciones={asignaciones}
            recargarDatos={cargarDatos}
            calcularProgresoOrden={calcularProgresoOrden}
            mostrarExito={mostrarExito}
            mostrarError={mostrarError}
            mostrarAdvertencia={mostrarAdvertencia}
          />
        )}

        {activeView === 'asignar' && (
          <VistaAsignaciones
            asignaciones={asignaciones}
            empleados={empleados}
            prendas={prendas}
            operaciones={operaciones}
            ordenes={ordenes}
            recargarDatos={cargarDatos}
            mostrarExito={mostrarExito}
            mostrarError={mostrarError}
            mostrarAdvertencia={mostrarAdvertencia}
          />
        )}

        {activeView === 'remisiones' && (
          <VistaRemisiones
            remisiones={remisiones}
            ordenes={ordenes}
            prendas={prendas}
            asignaciones={asignaciones}
            operaciones={operaciones}
            recargarDatos={cargarDatos}
            calcularProgresoOrden={calcularProgresoOrden}
            mostrarExito={mostrarExito}
            mostrarError={mostrarError}
            mostrarAdvertencia={mostrarAdvertencia}
          />
        )}

        {activeView === 'nomina' && (
          <VistaNomina
            asignaciones={asignaciones}
            empleados={empleados}
            operaciones={operaciones}
            prendas={prendas}
            mostrarExito={mostrarExito}
            mostrarError={mostrarError}
            mostrarAdvertencia={mostrarAdvertencia}
          />
        )}

        {activeView === 'taller-admin' && (
          <PantallaTallerAdmin
            empleados={empleados}
            asignaciones={asignaciones}
            operaciones={operaciones}
            prendas={prendas}
            ordenes={ordenes}
            mostrarExito={mostrarExito}
            mostrarError={mostrarError}
            mostrarInfo={mostrarInfo}
          />
        )}

        {activeView === 'taller-tv' && (
          <PantallaTallerTV
            empleados={empleados}
            asignaciones={asignaciones}
            operaciones={operaciones}
            prendas={prendas}
            onSalir={() => setActiveView('dashboard')}
          />
        )}

      </div>
    </div>
  );
}

export default App;
