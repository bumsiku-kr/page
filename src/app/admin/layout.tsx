'use client';

import { ReactNode } from 'react';
import AdminHeader from '@/components/layout/AdminHeader';
import AdminSidebar from '@/components/layout/AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex flex-col md:flex-row">
        <AdminSidebar />
        <main className="flex-1 p-6 md:ml-64 mt-2">
          {children}
        </main>
      </div>
    </div>
  );
} 