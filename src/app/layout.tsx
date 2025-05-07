import type { Metadata } from 'next';
import './globals.css';
import Header from '../components/layout/Header';

export const metadata: Metadata = {
  title: 'Siku 기술블로그',
  description: 'Siku의 기술 블로그입니다.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className="antialiased min-h-screen flex flex-col"
      >
        <Header />
        <main className="flex-grow pt-24 pb-6">{children}</main>
      </body>
    </html>
  );
}
