'use client';

import React from 'react';
import Header from '../components/layout/Header';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Analytics } from "@vercel/analytics/next";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="antialiased min-h-screen flex flex-col">
      <AuthProvider>
        <ToastProvider>
          <Header />
          <main className="flex-grow pt-24 pb-6">{children}</main>
          <Analytics />
        </ToastProvider>
      </AuthProvider>
    </div>
  );
} 