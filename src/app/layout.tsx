import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './client-layout';
import { Analytics } from '@vercel/analytics/next';
import { defaultMetadata } from '../lib/metadata';

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-color-mode="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
        <Analytics />
      </body>
    </html>
  );
}
