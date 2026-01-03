'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
        const href = locale === 'ko' ? `/${slug}` : `/${locale}/${slug}`;

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
  const pathname = usePathname();

  // Determine current locale from pathname
  const isEnglish = pathname.startsWith('/en');

  // Switch to home page of other locale (post-specific switching uses LanguageSwitcher)
  const alternatePath = isEnglish ? '/' : '/en';

  return (
    <Link
      href={alternatePath}
      className={`px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-100 transition-colors ${className}`}
    >
      {isEnglish ? '한국어' : 'EN'}
    </Link>
  );
}
