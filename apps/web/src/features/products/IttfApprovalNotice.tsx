import type { IttfApprovalInfo, IttfApprovalStatus } from '@ttsetupbuilder/types';

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

function titleFor(status: IttfApprovalStatus): string {
  switch (status) {
    case 'not_approved':
      return 'Not ITTF-approved';
    case 'not_found':
      return 'Not on ITTF covering list';
    case 'expired':
      return 'ITTF approval expired';
    case 'inactive':
      return 'ITTF listing inactive';
    default:
      return 'ITTF approval note';
  }
}

function bodyFor(info: IttfApprovalInfo): string {
  switch (info.status) {
    case 'not_approved':
      return 'This covering appears in the ITTF racket-coverings database without a valid approval code (or with ApprovalStatus=false). It is not homologated for competition use under current ITTF rules.';
    case 'not_found':
      return 'No matching entry was found in the owned ITTF racket-coverings snapshot. This may be a renamed model, a regional exclusive, or simply not listed.';
    case 'expired':
      return 'A matching ITTF entry was found, but its ExpiresOn date is in the past according to the local snapshot.';
    case 'inactive':
      return 'A matching ITTF entry exists but is marked inactive in the local approval snapshot.';
    default:
      return 'See local ITTF approval annotation on this catalog row.';
  }
}

type IttfApprovalNoticeProps = {
  info: IttfApprovalInfo;
};

/**
 * Quiet dark-UI notice for rubber/pips approval facts (visual database — not ecommerce chrome).
 */
export function IttfApprovalNotice({ info }: IttfApprovalNoticeProps) {
  if (!shouldShowIttfApprovalAlert(info)) return null;

  return (
    <aside
      role="status"
      aria-label="ITTF approval status"
      className="rounded-2xl border border-amber-500/35 bg-amber-500/[0.08] px-4 py-3.5"
    >
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-amber-200/90">
        ITTF covering status
      </p>
      <p className="mt-1.5 font-[family-name:var(--font-display)] text-lg text-amber-50">
        {titleFor(info.status)}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-amber-100/75">{bodyFor(info)}</p>
      <dl className="mt-3 grid gap-1.5 text-xs text-amber-100/60">
        {info.matchedBrand || info.matchedName ? (
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-amber-200/50">Matched</dt>
            <dd>
              {[info.matchedBrand, info.matchedName].filter(Boolean).join(' · ')}
            </dd>
          </div>
        ) : null}
        {info.equipmentCode ? (
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-amber-200/50">Code</dt>
            <dd className="font-mono text-amber-100/80">{info.equipmentCode}</dd>
          </div>
        ) : (
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-amber-200/50">Code</dt>
            <dd className="font-mono text-amber-100/80">—</dd>
          </div>
        )}
        {info.reason ? (
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-amber-200/50">Detail</dt>
            <dd>{info.reason}</dd>
          </div>
        ) : null}
        {info.snapshotDate ? (
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-amber-200/50">Snapshot</dt>
            <dd className="font-mono">{info.snapshotDate}</dd>
          </div>
        ) : null}
      </dl>
    </aside>
  );
}
