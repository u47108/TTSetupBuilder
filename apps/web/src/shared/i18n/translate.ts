import { en } from './messages/en';
import { es } from './messages/es';
import type { AppLocale, MessageKey, MessageTree } from './types';

const catalogs: Record<AppLocale, MessageTree> = { en, es };

export const LOCALES: readonly AppLocale[] = ['en', 'es'] as const;

export function isAppLocale(value: string): value is AppLocale {
  return value === 'en' || value === 'es';
}

export function detectBrowserLocale(): AppLocale {
  if (typeof navigator === 'undefined') return 'en';
  const candidates = [...(navigator.languages ?? []), navigator.language].filter(Boolean);
  for (const raw of candidates) {
    const code = raw.toLowerCase().slice(0, 2);
    if (code === 'es') return 'es';
    if (code === 'en') return 'en';
  }
  return 'en';
}

function readPath(tree: MessageTree, key: MessageKey): string {
  const parts = key.split('.');
  let node: unknown = tree;
  for (const part of parts) {
    if (node == null || typeof node !== 'object') return key;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : key;
}

export function translate(
  locale: AppLocale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  const template = readPath(catalogs[locale], key);
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
}

export function getMessages(locale: AppLocale): MessageTree {
  return catalogs[locale];
}
