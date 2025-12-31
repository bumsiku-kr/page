import type { Metadata, Viewport } from 'next';
import './globals.css';
import ClientLayout from './client-layout';
import { defaultMetadata, defaultViewport } from '../lib/metadata';
import { notoSansKR, jetBrainsMono } from './fonts';

export const metadata: Metadata = defaultMetadata;
export const viewport: Viewport = defaultViewport;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-color-mode="light" className={`${notoSansKR.variable} ${jetBrainsMono.variable}`}>
      <body className="font-sans">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
