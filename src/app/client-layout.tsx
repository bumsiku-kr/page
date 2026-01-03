'use client';

import React from 'react';
import { AuthProvider } from '@/features/auth';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SWRProvider } from '@/shared/lib/providers';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SWRProvider>
        <div className="antialiased min-h-screen flex flex-col">
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </div>
      </SWRProvider>
    </ErrorBoundary>
  );
}
