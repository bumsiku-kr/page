'use client';

import { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';

interface EditLayoutProps {
  children: ReactNode;
}

export default function EditLayout({ children }: EditLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {children}
      <Analytics />
    </div>
  );
}
