'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAME } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Kanban,
  UserPlus,
  CheckSquare,
  BarChart3,
  ShieldCheck,
  Settings,
  Sparkles,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS_ICONS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Deals', href: '/deals', icon: Kanban },
  { name: 'Leads', href: '/leads', icon: UserPlus },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'User Roles', href: '/admin/users', icon: ShieldCheck },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-slate-950/95 border-r border-slate-800/80 flex flex-col z-40 backdrop-blur-xl select-none">
      {/* Brand Logo */}
      <div className="p-6 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-white leading-none">
              {APP_NAME}
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-indigo-400 uppercase mt-1">
              Enterprise CRM
            </span>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-6 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar">
        <div className="px-3 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Main Menu
        </div>
        {NAV_ITEMS_ICONS.map((item) => {
          if (item.name === 'User Roles' && user?.role !== 'admin') {
            return null;
          }
          if ((item.name === 'Contacts' || item.name === 'Companies') && user?.role === 'sales_rep') {
            return null;
          }
          const Icon = item.icon;


          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/20 to-indigo-500/10 text-white font-semibold border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive
                    ? 'text-indigo-400'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/80">
        <div 
          onClick={logout}
          title="Click to Sign Out"
          className="group flex items-center gap-3 p-2 rounded-xl hover:bg-rose-500/10 border border-transparent hover:border-rose-500/25 transition-all duration-200 cursor-pointer"
        >
          <div className="relative shrink-0">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className="w-10 h-10 rounded-full object-cover border border-slate-700 group-hover:border-rose-500/30 transition-colors"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-sm text-white shadow-md group-hover:from-rose-600 group-hover:to-rose-400 transition-all duration-200">
                {user ? getInitials(user.name) : 'U'}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full group-hover:bg-rose-500 transition-colors"></span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-slate-200 truncate leading-snug group-hover:text-rose-200 transition-colors">
              {user?.name || 'User Profile'}
            </p>
            <p className="text-xs text-slate-400 truncate leading-none mt-0.5 group-hover:text-rose-300/70 transition-colors">
              {user?.email || 'user@company.com'}
            </p>
          </div>
          <LogOut className="w-4 h-4 text-slate-500 group-hover:text-rose-400 shrink-0 opacity-0 group-hover:opacity-100 transition-all" />
        </div>
      </div>
    </aside>
  );
};

