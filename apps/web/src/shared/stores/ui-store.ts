import { create } from 'zustand';
import { detectBrowserLocale, isAppLocale } from '@/shared/i18n/translate';
import type { AppLocale } from '@/shared/i18n/types';

const LOCALE_STORAGE_KEY = 'ttsetupbuilder.locale';

function readStoredLocale(): AppLocale {
  if (typeof window === 'undefined') return 'en';
  try {
    const raw = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (raw && isAppLocale(raw)) return raw;
  } catch {
    /* ignore */
  }
  return detectBrowserLocale();
}

function persistLocale(locale: AppLocale): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  } catch {
    /* ignore */
  }
}

type UiState = {
  isNavOpen: boolean;
  locale: AppLocale;
  toggleNav: () => void;
  closeNav: () => void;
  setLocale: (locale: AppLocale) => void;
};

const initialLocale = readStoredLocale();
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLocale;
}

/** Client UI state (ADR-005). Locale lives here — not Context. Catalog stays in Query. */
export const useUiStore = create<UiState>((set) => ({
  isNavOpen: false,
  locale: initialLocale,
  toggleNav: () => set((state) => ({ isNavOpen: !state.isNavOpen })),
  closeNav: () => set({ isNavOpen: false }),
  setLocale: (locale) => {
    persistLocale(locale);
    set({ locale });
  },
}));
