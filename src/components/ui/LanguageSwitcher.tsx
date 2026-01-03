'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

interface LocaleInfo {
  locale: string;
  slug: string;
}

interface LanguageSwitcherProps {
  availableLocales?: LocaleInfo[];
  currentLocale: string;
  className?: string;
}

const localeNames: Record<string, string> = {
  ko: '한국어',
  en: 'English',
};

export function LanguageSwitcher({
  availableLocales = [],
  currentLocale,
  className = '',
}: LanguageSwitcherProps) {
  if (availableLocales.length <= 1) {
    return null;
  }

  return (
    <div className={`inline-flex gap-2 ${className}`}>
      {availableLocales.map(({ locale, slug }) => {
        const isActive = locale === currentLocale;
        // Korean (default): /slug, English: /en/slug
        const href = locale === 'ko' ? `/${slug}` : `/en/${slug}`;

        return (
          <Link
            key={locale}
            href={href}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              isActive
                ? 'bg-gray-900 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {localeNames[locale] || locale}
          </Link>
        );
      })}
    </div>
  );
}

// Header language switcher (for switching entire site language)
export function HeaderLanguageSwitcher({ className = '' }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const currentLocale = (params?.locale as Locale) || 'ko';
  const targetLocale: Locale = currentLocale === 'ko' ? 'en' : 'ko';

  const handleSwitch = () => {
    router.replace(pathname, { locale: targetLocale });
  };

  return (
    <button
      onClick={handleSwitch}
      className={`px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-100 transition-colors ${className}`}
    >
      {currentLocale === 'ko' ? 'English' : '한국어'}
    </button>
  );
}
