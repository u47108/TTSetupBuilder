import type { CatalogProduct } from '@ttsetupbuilder/types';
import { useT } from '@/shared/i18n/useT';
import type { MessageKey } from '@/shared/i18n/types';
import { cn } from '@/shared/lib/cn';

type BuilderDiscontinuedAlertProps = {
  blade: CatalogProduct | null;
  fh: CatalogProduct | null;
  bh: CatalogProduct | null;
  /**
   * `palette` — under pickers on selection.
   * `preview` — under the ready setup poster (text only; never overlays gear images).
   */
  placement?: 'palette' | 'preview';
};

type NoticeEntry = {
  sideKey: MessageKey;
  product: CatalogProduct;
};

/**
 * Discontinued notice for blade / FH / BH on /builder.
 * Same amber visual language as BuilderIttfAlert — informational only.
 */
export function BuilderDiscontinuedAlert({
  blade,
  fh,
  bh,
  placement = 'palette',
}: BuilderDiscontinuedAlertProps) {
  const t = useT();

  const entries: NoticeEntry[] = [];
  for (const [sideKey, product] of [
    ['builder.discontinuedAlertBlade', blade],
    ['builder.discontinuedAlertFh', fh],
    ['builder.discontinuedAlertBh', bh],
  ] as const) {
    if (product?.discontinued) {
      entries.push({ sideKey, product });
    }
  }

  if (entries.length === 0) return null;

  const ariaKey =
    placement === 'preview'
      ? 'builder.preview.discontinuedAlertAria'
      : 'builder.discontinuedAlertAria';
  const eyebrowKey =
    placement === 'preview'
      ? 'builder.preview.discontinuedAlertEyebrow'
      : 'builder.discontinuedAlertEyebrow';

  return (
    <aside
      role="status"
      aria-label={t(ariaKey)}
      data-discontinued-placement={placement}
      className="space-y-2.5"
    >
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-amber-200/90">
        {t(eyebrowKey)}
      </p>
      <ul className="space-y-2.5">
        {entries.map(({ sideKey, product }) => {
          const name = [product.brandId, product.name].filter(Boolean).join(' · ');
          return (
            <li
              key={`${placement}-${sideKey}-${product.id}`}
              className={cn(
                'space-y-1 border border-amber-500/35 bg-amber-500/[0.08] px-3.5 py-3',
                placement === 'preview' ? 'rounded-xl' : 'rounded-2xl',
              )}
            >
              <p className="text-sm font-medium text-amber-100/90">{t(sideKey, { name })}</p>
              <p
                className={cn(
                  'font-[family-name:var(--font-display)] text-amber-50',
                  placement === 'preview' ? 'text-sm' : 'text-base',
                )}
              >
                {t('builder.discontinuedAlertTitle')}
              </p>
              <p className="text-sm text-amber-100/70">{t('builder.discontinuedAlertBody')}</p>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
