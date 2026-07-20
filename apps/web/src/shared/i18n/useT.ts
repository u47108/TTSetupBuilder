import { useCallback } from 'react';
import { useUiStore } from '@/shared/stores/ui-store';
import { translate } from '@/shared/i18n/translate';
import type { MessageKey } from '@/shared/i18n/types';

/** UI copy for the active locale (Zustand — ADR-005). */
export function useT() {
  const locale = useUiStore((state) => state.locale);
  return useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale],
  );
}

export function useLocale() {
  return useUiStore((state) => state.locale);
}
