import React from 'react';

const PageSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Page header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-7 w-52 bg-slate-200 rounded-xl" />
        <div className="h-4 w-36 bg-slate-100 rounded-lg" />
      </div>
      <div className="h-9 w-32 bg-slate-200 rounded-xl" />
    </div>

    {/* Stat cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 bg-slate-100 rounded" />
            <div className="w-8 h-8 bg-slate-100 rounded-xl" />
          </div>
          <div className="h-7 w-16 bg-slate-200 rounded-lg" />
          <div className="h-3 w-24 bg-slate-100 rounded" />
        </div>
      ))}
    </div>

    {/* Content area */}
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex gap-3">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="h-4 w-24 bg-slate-100 rounded" />
      </div>
      <div className="divide-y divide-slate-50">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-4 py-3.5 flex items-center gap-4">
            <div className="w-4 h-4 bg-slate-100 rounded flex-shrink-0" />
            <div className="h-4 bg-slate-100 rounded flex-1" style={{ maxWidth: `${68 - i * 7}%` }} />
            <div className="h-4 w-20 bg-slate-100 rounded flex-shrink-0" />
            <div className="h-6 w-16 bg-slate-100 rounded-lg flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default PageSkeleton;
