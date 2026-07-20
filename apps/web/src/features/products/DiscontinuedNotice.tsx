import { useT } from '@/shared/i18n/useT';

/**
 * Quiet amber notice when a catalog product is marked discontinued
 * (stock ≠ catalog — still shown in the visual database).
 */
export function DiscontinuedNotice() {
  const t = useT();

  return (
    <aside
      role="status"
      aria-label={t('discontinued.ariaLabel')}
      className="space-y-2 rounded-2xl border border-amber-500/35 bg-amber-500/[0.08] px-4 py-3.5"
    >
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-amber-200/90">
        {t('discontinued.eyebrow')}
      </p>
      <p className="font-[family-name:var(--font-display)] text-base text-amber-50">
        {t('discontinued.title')}
      </p>
      <p className="text-sm text-amber-100/70">{t('discontinued.body')}</p>
    </aside>
  );
}
