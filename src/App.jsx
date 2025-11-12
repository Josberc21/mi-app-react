import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link, Outlet } from 'react-router-dom';
import { User, Package, Settings, BarChart3, CircleDollarSign,SquareScissors, LogOut,Shirt,PencilRuler, Plus,Truck, Monitor } from 'lucide-react';
import { iniciarSesion, cerrarSesion, obtenerUsuarioActual } from './services/authService';
import { supabase } from './supabaseClient';
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
  const [mostrarPassword, setMostrarPassword] = useState(false);

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
          
          <div className="relative">
            <input 
              type={mostrarPassword ? "text" : "password"}
              value={loginPass} 
              onChange={(e) => setLoginPass(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && handleLogin(loginId, loginPass)} 
              className="w-full px-4 py-2 border rounded-lg pr-10" 
              placeholder="Contraseña" 
            />
            <button
              type="button"
              onClick={() => setMostrarPassword(!mostrarPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {mostrarPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          <button 
            onClick={() => handleLogin(loginId, loginPass)} 
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Iniciar Sesión
          </button>
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
              <NavBtn to="/asignar" icon={SquareScissors} label="Asignar" />
              <NavBtn to="/empleados" icon={User} label="Empleados" />
              <NavBtn to="/prendas" icon={Shirt} label="Prendas" />
              <NavBtn to="/operaciones" icon={PencilRuler} label="Operaciones" />
              <NavBtn to="/ordenes" icon={Package} label="Órdenes" />
              <NavBtn to="/nomina" icon={CircleDollarSign} label="Nómina" />
              <NavBtn to="/remisiones" icon={Truck} label="Remisiones" />
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
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  const { toast, cerrarToast, mostrarExito, mostrarError, mostrarAdvertencia, mostrarInfo } = useToast();
  const { empleados, prendas, operaciones, asignaciones, ordenes, remisiones, loading, error, recargar: recargarDatos } = useDatos(currentUser);
  const { calcularNominaEmpleado, calcularNominaTotal, calcularProgresoOrden, estadisticasDashboard } = useCalculos(asignaciones, empleados, operaciones, ordenes, prendas);
  const { isOnline } = useOnlineStatus();

// 1️⃣ Verificar sesión al cargar (solo al montar el componente)
useEffect(() => {
  const cargarSesion = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const usuario = await obtenerUsuarioActual();
        if (usuario) {
          setCurrentUser(usuario);
          
          // Solo navegar si estamos en /login o en la raíz sin usuario
          const rutaActual = window.location.pathname;
          if (rutaActual === '/login' || rutaActual === '/') {
            const rutaDestino = usuario.role === 'admin' ? '/dashboard' : '/operario-panel';
            navigate(rutaDestino, { replace: true });
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar sesión:', error);
    } finally {
      setAuthLoading(false);
    }
  };
  
  cargarSesion();
}, []); // 👈 Array vacío - solo se ejecuta UNA vez al montar

// 2️⃣ Escuchar cambios de autenticación (listener permanente)
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      // Solo procesar logout y refresh de token
      // El login se maneja manualmente en handleLogin
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        const usuario = await obtenerUsuarioActual();
        if (usuario) {
          setCurrentUser(usuario);
        }
      }
    }
  );

  return () => subscription.unsubscribe();
}, []); // Array vacío = se monta una sola vez y queda escuchando

  // 🎯 CALCULAR META DINÁMICA DEL DÍA (para Pantalla TV)
const calcularMetaDiaria = () => {
  const hoy = new Date();
  const hoyStr = hoy.toISOString().split('T')[0];

  const asignacionesHoy = asignaciones.filter(a => {
    if (!a.fecha) return false;
    const fechaAsig = a.fecha.toString().split('T')[0].split(' ')[0];
    return fechaAsig === hoyStr;
  });

  return asignacionesHoy.reduce((sum, a) => sum + (a.cantidad || 0), 0);
};

  // Login
const handleLogin = async (username, password) => {
  const result = await iniciarSesion(username, password);
  
  if (result.success) {
    setCurrentUser(result.user);
    setAuthLoading(false);
    mostrarExito(`Bienvenido ${result.user.nombre || result.user.username}`);
    navigate(result.user.role === 'admin' ? '/dashboard' : '/operario-panel');
  } else {
    setAuthLoading(false);
    mostrarError(result.error || 'Credenciales incorrectas');
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
      {/* Mostrar loading mientras verifica autenticación */}
    {authLoading && (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Verificando sesión...</p>
        </div>
      </div>
    )}
    
    {!authLoading && (

      <Routes>
        {/* --- RUTAS PÚBLICAS --- */}
        <Route path="/login" element={<Login handleLogin={handleLogin} toast={toast} cerrarToast={cerrarToast} />} />
        <Route path="/operario/:id" element={<VistaOperarioPublica />} />

       {/* --- OPERARIO PANEL PROTEGIDO --- */}
<Route 
  path="/operario-panel" 
  element={
    <ProtectedRoute user={currentUser}>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Panel Operario</h1>
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </button>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto p-6">
          <VistaAsignaciones {...{ asignaciones, empleados, prendas, operaciones, ordenes, recargarDatos, mostrarExito, mostrarError, mostrarAdvertencia }} />
        </main>
      </div>
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
       <Route path="/taller-tv" element={<PantallaTallerTV {...{ empleados, asignaciones, operaciones, prendas, metaDiaria: calcularMetaDiaria() }} />} />

        {/* --- RUTA COMODÍN --- */}
        <Route path="*" element={<Navigate to="/taller-tv" replace />} />
      </Routes>
    )}
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