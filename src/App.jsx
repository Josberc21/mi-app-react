import React, { useState, useEffect, useMemo, Suspense } from 'react';
import {
  BrowserRouter, Routes, Route, Navigate,
  useNavigate, useLocation, NavLink, Outlet
} from 'react-router-dom';
import {
  User, LogOut, Shirt, PencilRuler, Truck, Scissors,
  LayoutDashboard, Users, ClipboardList, ShoppingBag, DollarSign,
  Factory, Tv2, Eye, EyeOff, AlertCircle, Menu, X, ChevronRight
} from 'lucide-react';
import { iniciarSesion, cerrarSesion, obtenerUsuarioActual } from './services/authService';
import { supabase } from './supabaseClient';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import OfflineBanner   from './components/common/OfflineBanner';
import ErrorBoundary   from './components/common/ErrorBoundary';
import PageSkeleton    from './components/common/PageSkeleton';
import Pagina404       from './components/common/Pagina404';

import { useToast }    from './hooks/useToast';
import { useDatos }    from './hooks/useDatos';
import { useCalculos } from './hooks/useCalculos';

import Toast   from './components/common/Toast';
import Loading from './components/common/Loading';

// ── Lazy imports — code splitting ──────────────────────────────────
const VistaEmpleados      = React.lazy(() => import('./components/empleados/VistaEmpleados'));
const VistaPrendas        = React.lazy(() => import('./components/prendas/VistaPrendas'));
const VistaOperaciones    = React.lazy(() => import('./components/operaciones/VistaOperaciones'));
const VistaOrdenes        = React.lazy(() => import('./components/ordenes/VistaOrdenes'));
const VistaAsignaciones   = React.lazy(() => import('./components/asignaciones/VistaAsignaciones'));
const VistaRemisiones     = React.lazy(() => import('./components/remisiones/VistaRemisiones'));
const VistaNomina         = React.lazy(() => import('./components/nomina/VistaNomina'));
const VistaOperarioPublica = React.lazy(() => import('./components/operario/VistaOperarioPublica'));
const VistaDashboard      = React.lazy(() => import('./components/dashboard/VistaDashboard'));
const PantallaTallerAdmin = React.lazy(() => import('./components/taller/PantallaTallerAdmin'));
const PantallaTallerTV    = React.lazy(() => import('./components/taller/PantallaTallerTV'));

// ===================================================================
// LOGIN
// ===================================================================
const Login = ({ handleLogin, toast, cerrarToast }) => {
  const [loginId, setLoginId]         = useState('');
  const [loginPass, setLoginPass]     = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [cargando, setCargando]       = useState(false);
  const [error, setError]             = useState('');

  const onSubmit = async (e) => {
    e?.preventDefault();
    if (!loginId.trim() || !loginPass.trim()) {
      setError('Completa usuario y contraseña');
      return;
    }
    setError('');
    setCargando(true);
    await handleLogin(loginId.trim(), loginPass);
    setCargando(false);
  };

  return (
    <div className="min-h-screen flex bg-sidebar-bg">
      <Toast toast={toast} onClose={cerrarToast} />

      {/* Panel izquierdo (branding) */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 bg-grid-pattern relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-brand-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-brand-900/20 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">SistemaProd</span>
        </div>

        <div className="relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
            <span className="text-white/60 text-xs font-medium">Plataforma de Gestión Industrial</span>
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight tracking-tight">
            Producción<br />
            <span className="text-brand-400">bajo control.</span>
          </h1>
          <p className="text-white/40 text-base leading-relaxed max-w-sm">
            Gestiona asignaciones, nómina, órdenes y rendimiento del taller en un solo lugar.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[
            { icon: ClipboardList, label: 'Asignaciones' },
            { icon: DollarSign,   label: 'Nómina'       },
            { icon: LayoutDashboard, label: 'Dashboard' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="glass rounded-xl p-3 flex flex-col items-start gap-2">
              <div className="w-7 h-7 bg-white/8 rounded-lg flex items-center justify-center">
                <Icon className="w-4 h-4 text-white/60" />
              </div>
              <span className="text-white/50 text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho (formulario) */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white lg:rounded-l-3xl relative">
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Scissors className="w-4 h-4 text-white" />
          </div>
          <span className="text-slate-800 font-semibold text-sm">SistemaProd</span>
        </div>

        <div className="w-full max-w-sm animate-fade-in">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Iniciar sesión</h2>
            <p className="text-slate-500 text-sm mt-1">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="input-base pl-10"
                  placeholder="tu usuario"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Contraseña</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={mostrarPass ? 'text' : 'password'}
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="input-base pl-10 pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPass(!mostrarPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {mostrarPass ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-600 animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="btn-primary w-full py-3 mt-2 text-base"
            >
              {cargando ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verificando...
                </>
              ) : (
                <>
                  Entrar al sistema
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ===================================================================
// ADMIN LAYOUT — SIDEBAR RESPONSIVE
// ===================================================================
const NAV_ITEMS = [
  { group: 'Principal' },
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/asignar',      icon: ClipboardList,   label: 'Asignaciones' },
  { group: 'Catálogos' },
  { to: '/empleados',    icon: Users,           label: 'Empleados'    },
  { to: '/prendas',      icon: Shirt,           label: 'Prendas'      },
  { to: '/operaciones',  icon: PencilRuler,     label: 'Operaciones'  },
  { to: '/ordenes',      icon: ShoppingBag,     label: 'Órdenes'      },
  { group: 'Finanzas' },
  { to: '/nomina',       icon: DollarSign,      label: 'Nómina'       },
  { to: '/remisiones',   icon: Truck,           label: 'Remisiones'   },
  { group: 'Taller' },
  { to: '/taller-admin', icon: Factory,         label: 'Taller Admin' },
  { to: '/taller-tv',    icon: Tv2,             label: 'Pantalla TV'  },
];

const AdminLayout = ({ handleLogout, currentUser }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Cerrar sidebar al navegar (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex bg-surface">

      {/* Backdrop móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-30 w-[240px] bg-sidebar-bg min-h-screen flex flex-col shadow-sidebar sidebar-scroll overflow-y-auto transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        {/* Brand */}
        <div className="px-5 py-5 border-b border-sidebar-border flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm leading-none truncate">SistemaProd</p>
              <p className="text-sidebar-text text-xs mt-0.5">Gestión de Confección</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item, idx) => {
            if (item.group) {
              return (
                <p key={idx} className="px-2 pt-4 pb-1.5 text-[10px] font-semibold text-slate-600 uppercase tracking-widest first:pt-1">
                  {item.group}
                </p>
              );
            }
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ` +
                  (isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-900/40'
                    : 'text-sidebar-text hover:text-white hover:bg-sidebar-hover')
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                    <span className="flex-1 truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer usuario */}
        <div className="px-3 py-3 border-t border-sidebar-border flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
            <div className="w-8 h-8 bg-brand-600/20 border border-brand-600/30 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-brand-400 text-xs font-bold uppercase">
                {currentUser?.nombre?.charAt(0) || currentUser?.username?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-medium truncate">
                {currentUser?.nombre || currentUser?.username || 'Admin'}
              </p>
              <p className="text-slate-600 text-[11px] truncate capitalize">
                {currentUser?.role || 'admin'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-rose-400 hover:bg-white/5 transition-all flex-shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 lg:ml-[240px] min-h-screen flex flex-col">

        {/* Top bar móvil */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-100 h-14 flex items-center px-4 gap-3 shadow-sm flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
              <Scissors className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-slate-800 font-semibold text-sm">SistemaProd</span>
          </div>
        </header>

        <div className="flex-1 max-w-[1400px] mx-auto w-full p-4 lg:p-8 animate-fade-in">
          <ErrorBoundary>
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
};

// ===================================================================
// OPERARIO PANEL LAYOUT
// ===================================================================
const OperarioLayout = ({ handleLogout, currentUser, children }) => {
  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-[0_1px_0_0_#f1f5f9]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center shadow-sm">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-slate-800 font-semibold text-sm leading-none">Panel Operario</p>
              <p className="text-slate-400 text-xs mt-0.5">Gestión de Confección</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center">
                <span className="text-brand-700 text-[10px] font-bold uppercase">
                  {currentUser?.nombre?.charAt(0) || currentUser?.username?.charAt(0) || 'O'}
                </span>
              </div>
              <span className="text-slate-700 text-sm font-medium">
                {currentUser?.nombre || currentUser?.username || 'Operario'}
              </span>
              <span className="badge-brand text-[10px]">
                {currentUser?.role || 'operario'}
              </span>
            </div>
            <button onClick={handleLogout} className="btn-secondary gap-1.5 py-2 px-3">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
};

// ===================================================================
// PROTECTED ROUTE
// ===================================================================
const ProtectedRoute = ({ user, requiredRole, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/dashboard' : '/operario-panel'} replace />;
  }
  return children;
};

// ===================================================================
// AUTH LOADING
// ===================================================================
const AuthLoading = () => (
  <div className="min-h-screen bg-sidebar-bg flex items-center justify-center">
    <div className="text-center space-y-4 animate-fade-in">
      <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
        <Scissors className="w-6 h-6 text-white" />
      </div>
      <div className="flex items-center gap-2 justify-center">
        <svg className="w-4 h-4 text-brand-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-slate-500 text-sm">Verificando sesión...</p>
      </div>
    </div>
  </div>
);

// ===================================================================
// APP CONTENT
// ===================================================================
function AppContent() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  const { toast, cerrarToast, mostrarExito, mostrarError, mostrarAdvertencia, mostrarInfo } = useToast();
  const { empleados, prendas, operaciones, asignaciones, ordenes, remisiones, loading, recargar: recargarDatos } = useDatos(currentUser);
  const { calcularNominaEmpleado, calcularNominaTotal, calcularProgresoOrden, estadisticasDashboard } = useCalculos(asignaciones, empleados, operaciones, ordenes, prendas);
  const { isOnline } = useOnlineStatus();

  // Verificar sesión al cargar
  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const usuario = await obtenerUsuarioActual();
          if (usuario) {
            setCurrentUser(usuario);
            const rutaActual = window.location.pathname;
            if (rutaActual === '/login' || rutaActual === '/') {
              navigate(usuario.role === 'admin' ? '/dashboard' : '/operario-panel', { replace: true });
            }
          }
        }
      } catch (err) {
        console.error('Error al cargar sesión:', err);
      } finally {
        setAuthLoading(false);
      }
    };
    cargarSesion();
  }, []);

  // Listener de auth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        const usuario = await obtenerUsuarioActual();
        if (usuario) setCurrentUser(usuario);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Meta diaria memoizada
  const metaDiaria = useMemo(() => {
    const hoyStr = new Date().toISOString().split('T')[0];
    return asignaciones
      .filter(a => a.fecha?.toString().split('T')[0].split(' ')[0] === hoyStr)
      .reduce((sum, a) => sum + (a.cantidad || 0), 0);
  }, [asignaciones]);

  const handleLogin = async (username, password) => {
    const result = await iniciarSesion(username, password);
    if (result.success) {
      setCurrentUser(result.user);
      mostrarExito(`Bienvenido, ${result.user.nombre || result.user.username}`);
      navigate(result.user.role === 'admin' ? '/dashboard' : '/operario-panel');
    } else {
      mostrarError(result.error || 'Credenciales incorrectas');
    }
  };

  const handleLogout = async () => {
    await cerrarSesion();
    setCurrentUser(null);
    mostrarInfo('Sesión cerrada');
    navigate('/login');
  };

  if (authLoading) return <AuthLoading />;

  return (
    <>
      <OfflineBanner isOnline={isOnline} />
      <Toast toast={toast} onClose={cerrarToast} />
      {loading && <Loading />}

      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<Login handleLogin={handleLogin} toast={toast} cerrarToast={cerrarToast} />} />

        <Route path="/operario/:id" element={
          <ErrorBoundary>
            <Suspense fallback={<div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-t-brand-600 animate-spin" /></div>}>
              <VistaOperarioPublica />
            </Suspense>
          </ErrorBoundary>
        } />

        <Route path="/taller-tv" element={
          <ErrorBoundary>
            <Suspense fallback={<div className="min-h-screen bg-sidebar-bg" />}>
              <PantallaTallerTV {...{ empleados, asignaciones, operaciones, prendas, metaDiaria }} />
            </Suspense>
          </ErrorBoundary>
        } />

        {/* Panel operario */}
        <Route
          path="/operario-panel"
          element={
            <ProtectedRoute user={currentUser}>
              <OperarioLayout handleLogout={handleLogout} currentUser={currentUser}>
                <ErrorBoundary>
                  <Suspense fallback={<PageSkeleton />}>
                    <VistaAsignaciones {...{ asignaciones, empleados, prendas, operaciones, ordenes, recargarDatos, mostrarExito, mostrarError, mostrarAdvertencia }} />
                  </Suspense>
                </ErrorBoundary>
              </OperarioLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/"
          element={
            <ProtectedRoute user={currentUser} requiredRole="admin">
              <AdminLayout handleLogout={handleLogout} currentUser={currentUser} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"    element={<VistaDashboard    {...{ empleados, asignaciones, operaciones, prendas, ordenes, remisiones, estadisticasDashboard, calcularNominaEmpleado, calcularProgresoOrden }} />} />
          <Route path="empleados"    element={<VistaEmpleados    {...{ empleados, recargarDatos, calcularNomina: calcularNominaEmpleado, mostrarExito, mostrarError, mostrarAdvertencia }} />} />
          <Route path="prendas"      element={<VistaPrendas      {...{ prendas, operaciones, recargarDatos, mostrarExito, mostrarError, mostrarAdvertencia }} />} />
          <Route path="operaciones"  element={<VistaOperaciones  {...{ operaciones, prendas, recargarDatos, mostrarExito, mostrarError, mostrarAdvertencia, mostrarInfo }} />} />
          <Route path="ordenes"      element={<VistaOrdenes      {...{ ordenes, prendas, operaciones, asignaciones, recargarDatos, calcularProgresoOrden, mostrarExito, mostrarError, mostrarAdvertencia }} />} />
          <Route path="asignar"      element={<VistaAsignaciones {...{ asignaciones, empleados, prendas, operaciones, ordenes, recargarDatos, mostrarExito, mostrarError, mostrarAdvertencia }} />} />
          <Route path="remisiones"   element={<VistaRemisiones   {...{ remisiones, ordenes, prendas, asignaciones, operaciones, recargarDatos, calcularProgresoOrden, mostrarExito, mostrarError, mostrarAdvertencia }} />} />
          <Route path="nomina"       element={<VistaNomina       {...{ asignaciones, empleados, operaciones, prendas, mostrarExito, mostrarError, mostrarAdvertencia }} />} />
          <Route path="taller-admin" element={<PantallaTallerAdmin {...{ empleados, asignaciones, operaciones, prendas, ordenes, mostrarExito, mostrarError, mostrarInfo }} />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Pagina404 />} />
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
