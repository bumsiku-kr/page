'use client';

import { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';

interface WriteLayoutProps {
  children: ReactNode;
}

export default function WriteLayout({ children }: WriteLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {children}
      <Analytics />
    </div>
  );
}
