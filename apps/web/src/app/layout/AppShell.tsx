import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { LOCALES } from '@/shared/i18n/translate';
import { useT } from '@/shared/i18n/useT';
import type { AppLocale, MessageKey } from '@/shared/i18n/types';
import { useUiStore } from '@/shared/stores/ui-store';
import { cn } from '@/shared/lib/cn';

const NAV_KEYS: ReadonlyArray<{ to: string; labelKey: MessageKey; end?: boolean }> = [
  { to: '/', labelKey: 'nav.explore', end: true },
  { to: '/products', labelKey: 'nav.products' },
  { to: '/players', labelKey: 'nav.players' },
  { to: '/brands', labelKey: 'nav.brands' },
  { to: '/search', labelKey: 'nav.search' },
  { to: '/compare', labelKey: 'nav.compare' },
  { to: '/builder', labelKey: 'nav.builder' },
];

export function AppShell() {
  const t = useT();
  const isNavOpen = useUiStore((state) => state.isNavOpen);
  const locale = useUiStore((state) => state.locale);
  const setLocale = useUiStore((state) => state.setLocale);
  const toggleNav = useUiStore((state) => state.toggleNav);
  const closeNav = useUiStore((state) => state.closeNav);

  return (
    <div className="relative min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgb(45_212_191_/_0.08),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgb(56_120_180_/_0.06),_transparent_45%)]"
      />

      <header className="relative z-20 border-b border-[var(--color-border-subtle)] bg-[color-mix(in_srgb,var(--color-canvas)_82%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <NavLink
            to="/"
            className="font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--color-text-primary)]"
            onClick={closeNav}
          >
            TTSetupBuilder
          </NavLink>

          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-1 md:flex" aria-label={t('nav.primary')}>
              {NAV_KEYS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end ?? false}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-elevated)] hover:text-[var(--color-text-primary)]',
                    )
                  }
                >
                  {t(item.labelKey)}
                </NavLink>
              ))}
            </nav>

            <div
              className="flex items-center rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-elevated)] p-0.5"
              role="group"
              aria-label={t('nav.language')}
            >
              {LOCALES.map((code) => (
                <LocaleButton
                  key={code}
                  code={code}
                  active={locale === code}
                  label={t(`locale.${code}`)}
                  onSelect={setLocale}
                />
              ))}
            </div>

            <button
              type="button"
              className="inline-flex rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-elevated)] p-2 text-[var(--color-text-secondary)] md:hidden"
              aria-expanded={isNavOpen}
              aria-controls="mobile-nav"
              aria-label={isNavOpen ? t('nav.closeMenu') : t('nav.openMenu')}
              onClick={toggleNav}
            >
              {isNavOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {isNavOpen ? (
          <nav
            id="mobile-nav"
            className="border-t border-[var(--color-border-subtle)] px-4 py-3 md:hidden"
            aria-label={t('nav.mobile')}
          >
            <ul className="flex flex-col gap-1">
              {NAV_KEYS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end ?? false}
                    onClick={closeNav}
                    className={({ isActive }) =>
                      cn(
                        'block rounded-xl px-3 py-2 text-sm',
                        isActive
                          ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                          : 'text-[var(--color-text-secondary)]',
                      )
                    }
                  >
                    {t(item.labelKey)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </header>

      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14"
      >
        <Outlet />
      </motion.main>

      <footer className="relative z-10 border-t border-[var(--color-border-subtle)]">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center sm:px-6">
          <p className="text-xs text-[var(--color-text-tertiary)]">
            TTSetupBuilder · v{__APP_VERSION__} · {t('shell.footerBy')}{' '}
            <span className="text-[var(--color-text-secondary)]">Luis Nuñez</span>
            <span aria-hidden className="mx-1.5 text-[var(--color-border-subtle)]">
              ·
            </span>
            {t('shell.footerContact')}:{' '}
            <a
              href="https://github.com/u47108"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-text-secondary)] underline-offset-2 transition-colors hover:text-[var(--color-accent)] hover:underline"
            >
              {t('shell.github')}
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

type LocaleButtonProps = {
  code: AppLocale;
  active: boolean;
  label: string;
  onSelect: (locale: AppLocale) => void;
};

function LocaleButton({ code, active, label, onSelect }: LocaleButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(code)}
      aria-pressed={active}
      className={cn(
        'rounded-lg px-2.5 py-1.5 text-xs font-medium tracking-wide transition-colors',
        active
          ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
          : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]',
      )}
    >
      {label}
    </button>
  );
}
