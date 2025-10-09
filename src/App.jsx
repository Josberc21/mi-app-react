import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link, Outlet } from 'react-router-dom';
import { User, Package, Settings, BarChart3, DollarSign, LogOut, Plus, Monitor } from 'lucide-react';
import { iniciarSesion, cerrarSesion, obtenerUsuarioActual } from './services/authService';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import OfflineBanner from './components/common/OfflineBanner';

// Hooks personalizados
import { useToast } from './hooks/useToast';
import { useDatos } from './hooks/useDatos';
import { useCalculos } from './hooks/useCalculos';

// Componentes comunes
import Toast from './components/common/Toast';
import Loading from './components/common/Loading';

// Vistas/Componentes
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
import PantallaTallerTV from './components/taller/PantallaTallerTV';

// ===================================================================
// COMPONENTES AUXILIARES
// ===================================================================

// Login
const Login = ({ handleLogin, toast, cerrarToast }) => {
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');

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
          <input type="text" value={loginId} onChange={(e) => setLoginId(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="Usuario" />
          <input type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin(loginId, loginPass)} className="w-full px-4 py-2 border rounded-lg" placeholder="Contraseña" />
          <button onClick={() => handleLogin(loginId, loginPass)} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">Iniciar Sesión</button>
        </div>
      </div>
    </div>
  );
};

// Layout Admin
const AdminLayout = ({ handleLogout }) => {
  const NavBtn = ({ to, icon: Icon, label }) => (
    <Link to={to} className="px-3 py-2 rounded text-sm bg-gray-200 hover:bg-blue-600 hover:text-white">
      <Icon className="w-4 h-4 inline mr-1" />{label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h1 className="text-2xl font-bold">Admin</h1>
            <div className="flex gap-2 flex-wrap">
              <NavBtn to="/dashboard" icon={BarChart3} label="Dashboard" />
              <NavBtn to="/asignar" icon={Plus} label="Asignar" />
              <NavBtn to="/empleados" icon={User} label="Empleados" />
              <NavBtn to="/prendas" icon={Package} label="Prendas" />
              <NavBtn to="/operaciones" icon={Settings} label="Operaciones" />
              <NavBtn to="/ordenes" icon={Package} label="Órdenes" />
              <NavBtn to="/nomina" icon={DollarSign} label="Nómina" />
              <NavBtn to="/remisiones" icon={Package} label="Remisiones" />
              <NavBtn to="/taller-admin" icon={BarChart3} label="Taller Admin" />
              <NavBtn to="/taller-tv" icon={Monitor} label="Pantalla TV" />
              <button onClick={handleLogout} className="px-3 py-2 rounded bg-red-600 text-white text-sm">
                <LogOut className="w-4 h-4 inline mr-1" />Salir
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
        <Outlet /> 
      </main>
    </div>
  );
};

// ProtectedRoute
const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// ===================================================================
// APP CONTENT
// ===================================================================
function AppContent() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const { toast, cerrarToast, mostrarExito, mostrarError, mostrarAdvertencia, mostrarInfo } = useToast();
  const { empleados, prendas, operaciones, asignaciones, ordenes, remisiones, loading, error, recargar: recargarDatos } = useDatos(currentUser);
  const { calcularNominaEmpleado, calcularNominaTotal, calcularProgresoOrden, estadisticasDashboard } = useCalculos(asignaciones, empleados, operaciones, ordenes, prendas);
  const { isOnline } = useOnlineStatus();

  // Verificar sesión al cargar la app
  useEffect(() => {
    const verificarSesionInicial = async () => {
      const usuario = await obtenerUsuarioActual();
      if (usuario) {
        setCurrentUser(usuario);
      }
    };
    
    verificarSesionInicial();
  }, []);

  // Login
  const handleLogin = async (username, password) => {
    const result = await iniciarSesion(username, password);
    
    if (result.success) {
      setCurrentUser(result.user);
      mostrarExito(`Bienvenido ${result.user.nombre || result.user.username}`);
      navigate(result.user.role === 'admin' ? '/dashboard' : '/operario-panel');
    } else {
      mostrarError('Credenciales incorrectas');
    }
  };

  // Logout
  const handleLogout = async () => {
    await cerrarSesion();
    setCurrentUser(null);
    mostrarInfo('Sesión cerrada');
    navigate('/login');
  };

  return (
    <>
      <OfflineBanner isOnline={isOnline} />
      <Toast toast={toast} onClose={cerrarToast} />
      {loading && <Loading />}

      <Routes>
        {/* --- RUTAS PÚBLICAS --- */}
        <Route path="/login" element={<Login handleLogin={handleLogin} toast={toast} cerrarToast={cerrarToast} />} />
        <Route path="/operario/:id" element={<VistaOperarioPublica />} />

        {/* --- OPERARIO PANEL PROTEGIDO --- */}
        <Route 
          path="/operario-panel" 
          element={
            <ProtectedRoute user={currentUser}>
              <VistaAsignaciones {...{ asignaciones, empleados, prendas, operaciones, ordenes, recargarDatos, mostrarExito, mostrarError, mostrarAdvertencia }} />
            </ProtectedRoute>
          } 
        />

        {/* --- RUTAS DE ADMINISTRADOR --- */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute user={currentUser}>
              <AdminLayout handleLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<VistaDashboard {...{ empleados, asignaciones, operaciones, prendas, ordenes, remisiones, estadisticasDashboard, calcularNominaEmpleado, calcularProgresoOrden }} />} />
          <Route path="empleados" element={<VistaEmpleados {...{ empleados, recargarDatos, calcularNomina: calcularNominaEmpleado, mostrarExito, mostrarError, mostrarAdvertencia }} />} />
          <Route path="prendas" element={<VistaPrendas {...{ prendas, operaciones, recargarDatos, mostrarExito, mostrarError, mostrarAdvertencia }} />} />
          <Route path="operaciones" element={<VistaOperaciones {...{ operaciones, prendas, recargarDatos, mostrarExito, mostrarError, mostrarAdvertencia, mostrarInfo }} />} />
          <Route path="ordenes" element={<VistaOrdenes {...{ ordenes, prendas, operaciones, asignaciones, recargarDatos, calcularProgresoOrden, mostrarExito, mostrarError, mostrarAdvertencia }} />} />
          <Route path="asignar" element={<VistaAsignaciones {...{ asignaciones, empleados, prendas, operaciones, ordenes, recargarDatos, mostrarExito, mostrarError, mostrarAdvertencia }} />} />
          <Route path="remisiones" element={<VistaRemisiones {...{ remisiones, ordenes, prendas, asignaciones, operaciones, recargarDatos, calcularProgresoOrden, mostrarExito, mostrarError, mostrarAdvertencia }} />} />
          <Route path="nomina" element={<VistaNomina {...{ asignaciones, empleados, operaciones, prendas, mostrarExito, mostrarError, mostrarAdvertencia }} />} />
          <Route path="taller-admin" element={<PantallaTallerAdmin {...{ empleados, asignaciones, operaciones, prendas, ordenes, mostrarExito, mostrarError, mostrarInfo }} />} />
        </Route>

        {/* --- PANTALLA TV PÚBLICA --- */}
        <Route path="/taller-tv" element={<PantallaTallerTV {...{ empleados, asignaciones, operaciones, prendas }} />} />

        {/* --- RUTA COMODÍN --- */}
        <Route path="*" element={<Navigate to="/taller-tv" replace />} />
      </Routes>
    </>
  );
}

// ===================================================================
// APP PRINCIPAL
// ===================================================================
export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}