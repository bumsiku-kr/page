'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '../components/layout/Header';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Analytics } from '@vercel/analytics/next';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <div className="antialiased min-h-screen flex flex-col">
      <AuthProvider>
        <ToastProvider>
          {!isAdminRoute && <Header />}
          <main className={`flex-grow ${!isAdminRoute ? 'pt-24 pb-6' : ''}`}>{children}</main>
          <Analytics />
        </ToastProvider>
      </AuthProvider>
    </div>
  );
}
