import { Noto_Sans_KR, JetBrains_Mono } from 'next/font/google';

/**
 * Primary font: Noto Sans KR
 * Used for body text and headings
 */
export const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

/**
 * Monospace font: JetBrains Mono
 * Used for code blocks and technical content
 */
export const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: true,
  fallback: ['Consolas', 'Monaco', 'monospace'],
});
