import type { IttfApprovalInfo, IttfApprovalStatus } from '@ttsetupbuilder/types';
import {
  hasIttfListingDetail,
  IttfListingChecklist,
} from '@/features/products/IttfListingChecklist';
import { useT } from '@/shared/i18n/useT';
import type { MessageKey } from '@/shared/i18n/types';
import { cn } from '@/shared/lib/cn';

const ALERT_STATUSES: ReadonlySet<IttfApprovalStatus> = new Set([
  'not_found',
  'not_approved',
  'expired',
  'inactive',
]);

export function shouldShowIttfApprovalAlert(
  info: IttfApprovalInfo | undefined,
): info is IttfApprovalInfo {
  return Boolean(info && ALERT_STATUSES.has(info.status));
}

const TITLE_KEYS: Record<IttfApprovalStatus, MessageKey> = {
  approved: 'ittf.titleApproved',
  not_approved: 'ittf.titleNotApproved',
  not_found: 'ittf.titleNotFound',
  expired: 'ittf.titleExpired',
  inactive: 'ittf.titleInactive',
};

const BODY_KEYS: Record<IttfApprovalStatus, MessageKey> = {
  approved: 'ittf.bodyApproved',
  not_approved: 'ittf.bodyNotApproved',
  not_found: 'ittf.bodyNotFound',
  expired: 'ittf.bodyExpired',
  inactive: 'ittf.bodyInactive',
};

type IttfApprovalNoticeProps = {
  info: IttfApprovalInfo;
};

/**
 * Quiet dark-UI notice for rubber/pips approval facts (visual database — not ecommerce chrome).
 * Shows amber alert for non-approved statuses; quiet listing panel when approved so players
 * can verify code / colors / OX / expiry vs how ITTF lists the covering.
 */
export function IttfApprovalNotice({ info }: IttfApprovalNoticeProps) {
  const t = useT();
  const isAlert = shouldShowIttfApprovalAlert(info);
  const showChecklist = hasIttfListingDetail(info) || isAlert;

  if (!isAlert && !showChecklist && info.status !== 'approved') return null;

  return (
    <aside
      role="status"
      aria-label={t('ittf.ariaLabel')}
      data-ittf-tone={isAlert ? 'alert' : 'listing'}
      className={cn(
        'rounded-2xl border px-4 py-3.5',
        isAlert
          ? 'border-amber-500/35 bg-amber-500/[0.08]'
          : 'border-[var(--color-border-subtle)] bg-[var(--color-elevated)]',
      )}
    >
      <p
        className={cn(
          'text-xs font-medium uppercase tracking-[0.16em]',
          isAlert ? 'text-amber-200/90' : 'text-[var(--color-text-tertiary)]',
        )}
      >
        {t('ittf.coveringStatus')}
      </p>
      <p
        className={cn(
          'mt-1.5 font-[family-name:var(--font-display)] text-lg',
          isAlert ? 'text-amber-50' : 'text-[var(--color-text-primary)]',
        )}
      >
        {t(TITLE_KEYS[info.status])}
      </p>
      <p
        className={cn(
          'mt-2 text-sm leading-relaxed',
          isAlert ? 'text-amber-100/75' : 'text-[var(--color-text-secondary)]',
        )}
      >
        {t(BODY_KEYS[info.status])}
      </p>
      {info.matchedBrand || info.matchedName ? (
        <p
          className={cn(
            'mt-2 text-xs',
            isAlert ? 'text-amber-100/60' : 'text-[var(--color-text-tertiary)]',
          )}
        >
          {t('ittf.matched')}:{' '}
          {[info.matchedBrand, info.matchedName].filter(Boolean).join(' · ')}
        </p>
      ) : null}
      {showChecklist ? (
        <div
          className={cn(
            isAlert ? 'text-amber-100/70' : 'text-[var(--color-text-secondary)]',
          )}
        >
          <p
            className={cn(
              'mt-3 text-[10px] font-medium uppercase tracking-[0.14em]',
              isAlert ? 'text-amber-200/70' : 'text-[var(--color-text-tertiary)]',
            )}
          >
            {t('ittf.listingChecklist')}
          </p>
          <IttfListingChecklist info={info} compact={isAlert} />
        </div>
      ) : null}
      {info.reason && isAlert ? (
        <p className="mt-2 font-mono text-[11px] text-amber-100/45">{info.reason}</p>
      ) : null}
      {info.snapshotDate ? (
        <p
          className={cn(
            'mt-2 font-mono text-[11px]',
            isAlert ? 'text-amber-100/40' : 'text-[var(--color-text-tertiary)]',
          )}
        >
          {t('ittf.snapshot')}: {info.snapshotDate}
        </p>
      ) : null}
    </aside>
  );
}
