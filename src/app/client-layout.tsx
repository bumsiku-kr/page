'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '../components/layout/Header';
import { AuthProvider } from '@/features/auth';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SWRProvider } from '@/shared/lib/providers';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <ErrorBoundary>
      <SWRProvider>
        <div className="antialiased min-h-screen flex flex-col">
          <AuthProvider>
            <ToastProvider>
              {!isAdminRoute && <Header />}
              <main className={`flex-grow ${!isAdminRoute ? 'pt-24 pb-6' : ''}`}>{children}</main>
            </ToastProvider>
          </AuthProvider>
        </div>
      </SWRProvider>
    </ErrorBoundary>
  );
}
