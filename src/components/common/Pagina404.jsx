import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Scissors } from 'lucide-react';

const Pagina404 = () => (
  <div className="min-h-screen bg-sidebar-bg flex flex-col items-center justify-center p-6 text-center">
    <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
      <Scissors className="w-7 h-7 text-white" />
    </div>
    <p className="text-brand-500 text-8xl font-black tracking-tighter mb-4">404</p>
    <h1 className="text-white text-2xl font-bold mb-3">Página no encontrada</h1>
    <p className="text-slate-500 text-sm mb-8 max-w-xs">
      La ruta que buscas no existe o fue movida a otra ubicación.
    </p>
    <Link
      to="/dashboard"
      className="btn-primary gap-2 inline-flex"
    >
      <Home className="w-4 h-4" />
      Ir al Dashboard
    </Link>
  </div>
);

export default Pagina404;
