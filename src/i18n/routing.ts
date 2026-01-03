import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
  localePrefix: 'as-needed', // Only show /en for English, no prefix for Korean
});

export type Locale = (typeof routing.locales)[number];
