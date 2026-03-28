import React from 'react';

const Loading = ({ mensaje = 'Cargando...' }) => (
  <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-sm flex items-center justify-center animate-fade-in">
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-2 border-brand-100" />
        <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-transparent border-t-brand-600 animate-spin" />
      </div>
      <p className="text-slate-500 text-sm font-medium">{mensaje}</p>
    </div>
  </div>
);

export default Loading;
