'use client';

import React from 'react';
import { Search, Plus, Bell } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const isSupport = user?.role === 'support';

  return (
    <header className="h-[64px] bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Search Bar */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search contacts, deals, tasks..."
          className="w-full pl-9 pr-12 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-slate-800 border border-slate-700/80 rounded text-[10px] font-mono text-slate-400">
          ⌘K
        </div>
      </div>

      {/* Header Quick Actions */}
      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 rounded-xl border border-slate-800/80 transition-all">
          <Bell className="w-4 h-4" />
        </button>

        {!isSupport && (
          <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-150 active:scale-[0.98] flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Quick Add</span>
          </button>
        )}
      </div>
    </header>
  );
};

