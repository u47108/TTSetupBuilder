import type { CatalogProduct, IttfApprovalStatus } from '@ttsetupbuilder/types';
import {
  hasIttfListingDetail,
  IttfListingChecklist,
} from '@/features/products/IttfListingChecklist';
import { shouldShowIttfApprovalAlert } from '@/features/products/IttfApprovalNotice';
import { useT } from '@/shared/i18n/useT';
import type { MessageKey } from '@/shared/i18n/types';
import { cn } from '@/shared/lib/cn';

const TITLE_KEYS: Record<IttfApprovalStatus, MessageKey> = {
  approved: 'ittf.titleApproved',
  not_approved: 'ittf.titleNotApproved',
  not_found: 'ittf.titleNotFound',
  expired: 'ittf.titleExpired',
  inactive: 'ittf.titleInactive',
};

type BuilderIttfAlertProps = {
  fh: CatalogProduct | null;
  bh: CatalogProduct | null;
  /**
   * `palette` — under FH/BH pickers on selection.
   * `preview` — under the ready setup poster (text highlight only; never overlays gear images).
   */
  placement?: 'palette' | 'preview';
};

type NoticeEntry = {
  sideKey: 'builder.ittfAlertFh' | 'builder.ittfAlertBh';
  product: CatalogProduct;
  tone: 'alert' | 'listing';
};

/**
 * ITTF notice for FH/BH on /builder — alert (non-approved) or quiet listing checklist
 * (approved, e.g. Blues T1) so players can verify code / colors / OX / expiry.
 * Informational only — never blocks selectProduct, share, or download.
 */
export function BuilderIttfAlert({
  fh,
  bh,
  placement = 'palette',
}: BuilderIttfAlertProps) {
  const t = useT();

  const entries: NoticeEntry[] = [];
  for (const [sideKey, product] of [
    ['builder.ittfAlertFh', fh],
    ['builder.ittfAlertBh', bh],
  ] as const) {
    if (!product?.ittfApproval) continue;
    const info = product.ittfApproval;
    if (shouldShowIttfApprovalAlert(info)) {
      entries.push({ sideKey, product, tone: 'alert' });
    } else if (info.status === 'approved' && hasIttfListingDetail(info)) {
      entries.push({ sideKey, product, tone: 'listing' });
    }
  }

  if (entries.length === 0) return null;

  const hasAlert = entries.some((entry) => entry.tone === 'alert');
  const ariaKey =
    placement === 'preview' ? 'builder.preview.ittfAlertAria' : 'builder.ittfAlertAria';
  const eyebrowKey = hasAlert
    ? placement === 'preview'
      ? 'builder.preview.ittfAlertEyebrow'
      : 'builder.ittfAlertEyebrow'
    : placement === 'preview'
      ? 'builder.preview.ittfListingEyebrow'
      : 'builder.ittfListingEyebrow';

  return (
    <aside
      role="status"
      aria-label={t(ariaKey)}
      data-ittf-placement={placement}
      className="space-y-2.5"
    >
      <p
        className={cn(
          'text-xs font-medium uppercase tracking-[0.16em]',
          hasAlert ? 'text-amber-200/90' : 'text-[var(--color-text-tertiary)]',
        )}
      >
        {t(eyebrowKey)}
      </p>
      <ul className="space-y-2.5">
        {entries.map(({ sideKey, product, tone }) => {
          const info = product.ittfApproval!;
          const name = [product.brand, product.name].filter(Boolean).join(' · ');
          const alertTone = tone === 'alert';
          return (
            <li
              key={`${placement}-${sideKey}-${product.id}`}
              className={cn(
                'space-y-1 border px-3.5 py-3',
                placement === 'preview' ? 'rounded-xl' : 'rounded-2xl',
                alertTone
                  ? 'border-amber-500/35 bg-amber-500/[0.08]'
                  : 'border-[var(--color-border-subtle)] bg-[var(--color-elevated)]',
              )}
            >
              <p
                className={cn(
                  'text-sm font-medium',
                  alertTone ? 'text-amber-100/90' : 'text-[var(--color-text-secondary)]',
                )}
              >
                {t(sideKey, { name })}
              </p>
              <p
                className={cn(
                  'font-[family-name:var(--font-display)]',
                  placement === 'preview' ? 'text-sm' : 'text-base',
                  alertTone ? 'text-amber-50' : 'text-[var(--color-text-primary)]',
                )}
              >
                {t(TITLE_KEYS[info.status])}
              </p>
              <p
                className={cn(
                  'text-[10px] font-medium uppercase tracking-[0.14em]',
                  alertTone ? 'text-amber-200/70' : 'text-[var(--color-text-tertiary)]',
                )}
              >
                {t('ittf.listingChecklist')}
              </p>
              <div
                className={
                  alertTone ? 'text-amber-100/70' : 'text-[var(--color-text-secondary)]'
                }
              >
                <IttfListingChecklist info={info} compact={alertTone} />
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
