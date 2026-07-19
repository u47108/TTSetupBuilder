import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useUiStore } from '@/shared/stores/ui-store';
import { cn } from '@/shared/lib/cn';

const NAV_ITEMS: ReadonlyArray<{ to: string; label: string; end?: boolean }> = [
  { to: '/', label: 'Explore', end: true },
  { to: '/products', label: 'Products' },
  { to: '/players', label: 'Players' },
  { to: '/brands', label: 'Brands' },
  { to: '/search', label: 'Search' },
  { to: '/compare', label: 'Compare' },
  { to: '/builder', label: 'Builder' },
];

export function AppShell() {
  const isNavOpen = useUiStore((state) => state.isNavOpen);
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

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV_ITEMS.map((item) => (
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
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            className="inline-flex rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-elevated)] p-2 text-[var(--color-text-secondary)] md:hidden"
            aria-expanded={isNavOpen}
            aria-controls="mobile-nav"
            aria-label={isNavOpen ? 'Close menu' : 'Open menu'}
            onClick={toggleNav}
          >
            {isNavOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {isNavOpen ? (
          <nav
            id="mobile-nav"
            className="border-t border-[var(--color-border-subtle)] px-4 py-3 md:hidden"
            aria-label="Mobile"
          >
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
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
                    {item.label}
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
    </div>
  );
}
