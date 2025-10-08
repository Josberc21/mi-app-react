import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { User, Package, Settings, BarChart3, DollarSign, LogOut, Plus, Monitor } from 'lucide-react';

// Este componente envuelve todas las vistas del administrador
export default function AdminLayout({ handleLogout }) {
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
      
      <main className="max-w-7xl mx-auto p-6">
        {/* Aquí se renderizará el componente de la ruta activa */}
        <Outlet />
      </main>
    </div>
  );
}