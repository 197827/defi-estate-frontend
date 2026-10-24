'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Landmark, Menu, X } from 'lucide-react';
import { ConnectWallet } from '@/components/wallet/ConnectWallet';

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
] as const;

export function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function switchLocale(nextLocale: string) {
    if (nextLocale === locale) return;
    const segments = (pathname ?? '/').split('/');
    // pathname includes the current locale as the first segment
    if (segments.length > 1 && LOCALES.some((l) => l.code === segments[1])) {
      segments[1] = nextLocale;
    } else {
      segments.splice(1, 0, nextLocale);
    }
    const nextPath = segments.join('/') || `/${nextLocale}`;
    router.push(nextPath);
    setMenuOpen(false);
  }

  return (
    <header className="border-border border-b">
      <a
        href="#main-content"
        className="focus:bg-surface focus:text-text focus:ring-primary sr-only rounded-md px-4 py-2 text-sm font-medium focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:ring-2 focus:outline-none"
      >
        {t('skipToContent')}
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href={`/${locale}`}
          className="focus-visible:ring-primary flex items-center gap-2 font-semibold focus-visible:rounded-md focus-visible:ring-2 focus-visible:outline-none"
        >
          <Landmark className="text-primary h-5 w-5" aria-hidden />
          defi-estate
        </Link>

        <button
          type="button"
          className="focus-visible:ring-primary text-muted hover:text-text inline-flex items-center justify-center rounded-md p-2 focus-visible:ring-2 focus-visible:outline-none md:hidden"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X className="h-5 w-5" aria-hidden />
          ) : (
            <Menu className="h-5 w-5" aria-hidden />
          )}
        </button>

        <nav
          id="primary-navigation"
          aria-label={t('primary')}
          className={`${
            menuOpen ? 'flex' : 'hidden'
          } absolute inset-x-0 top-full z-40 flex-col gap-4 border-b border-border bg-background px-4 py-4 text-sm md:static md:flex md:flex-row md:items-center md:gap-6 md:border-0 md:bg-transparent md:p-0`}
        >
          <Link
            href={`/${locale}/properties`}
            className="text-muted hover:text-text focus-visible:ring-primary rounded-md focus-visible:ring-2 focus-visible:outline-none"
            onClick={() => setMenuOpen(false)}
          >
            {t('properties')}
          </Link>
          <Link
            href={`/${locale}/portfolio`}
            className="text-muted hover:text-text focus-visible:ring-primary rounded-md focus-visible:ring-2 focus-visible:outline-none"
            onClick={() => setMenuOpen(false)}
          >
            Portfolio
          </Link>

          <div className="flex items-center gap-2">
            <label htmlFor="locale-switcher" className="sr-only">
              {t('language')}
            </label>
            <select
              id="locale-switcher"
              value={locale}
              onChange={(event) => switchLocale(event.target.value)}
              className="border-border bg-surface text-text focus-visible:ring-primary rounded-md border px-2 py-1 text-sm focus-visible:ring-2 focus-visible:outline-none"
            >
              {LOCALES.map(({ code, label }) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <ConnectWallet />
        </nav>
      </div>
    </header>
  );
}