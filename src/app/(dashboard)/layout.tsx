'use client';

import React, { useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
        return;
      }

      // Enforce Sales Rep restrictions on contacts & companies
      if (user.role === 'sales_rep') {
        if (pathname?.startsWith('/contacts') || pathname?.startsWith('/companies')) {
          router.replace('/dashboard');
        }
      }
    }
  }, [user, loading, pathname, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Prevent rendering restricted pages for Sales Rep before redirect finishes
  if (user.role === 'sales_rep' && (pathname?.startsWith('/contacts') || pathname?.startsWith('/companies'))) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen min-w-0 overflow-x-hidden">
        <Header />
        <main className="flex-1 p-8 min-w-0">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
