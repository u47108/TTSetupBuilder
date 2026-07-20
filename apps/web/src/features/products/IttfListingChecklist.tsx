import type { IttfApprovalInfo } from '@ttsetupbuilder/types';
import { useT } from '@/shared/i18n/useT';
import { cn } from '@/shared/lib/cn';

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

function joinColors(colors: string[] | undefined): string | null {
  if (!colors || colors.length === 0) return null;
  return colors.join(', ');
}

type IttfListingChecklistProps = {
  info: IttfApprovalInfo;
  /** Compact density for builder banners. */
  compact?: boolean;
};

/**
 * Checklist of ITTF listing dimensions (code, sheet, sponge, expiry, OX, flags).
 * Informational only — never a shop gate (ADR-001 / ADR-014).
 */
export function IttfListingChecklist({ info, compact = false }: IttfListingChecklistProps) {
  const t = useT();
  const expires = formatDate(info.expiresOn);
  const topSheet = joinColors(info.topSheetColors) ?? '—';
  const sponge = joinColors(info.spongeColors) ?? '—';
  const oxLabel =
    info.oxVersion === true
      ? t('ittf.oxYes')
      : info.oxVersion === false
        ? t('ittf.oxNo')
        : '—';
  const approvalLabel =
    info.approvalStatus === true
      ? t('ittf.flagTrue')
      : info.approvalStatus === false
        ? t('ittf.flagFalse')
        : '—';
  const activeLabel =
    info.isActive === true
      ? t('ittf.flagTrue')
      : info.isActive === false
        ? t('ittf.flagFalse')
        : '—';

  const rows: { label: string; value: string; mono?: boolean }[] = [
    { label: t('ittf.code'), value: info.equipmentCode ?? '—', mono: true },
    { label: t('ittf.topSheetColors'), value: topSheet },
    { label: t('ittf.spongeColors'), value: sponge },
    { label: t('ittf.expiresOn'), value: expires ?? '—', mono: true },
    { label: t('ittf.oxVersion'), value: oxLabel },
    { label: t('ittf.approvalStatus'), value: approvalLabel },
    { label: t('ittf.isActive'), value: activeLabel },
  ];

  if (info.pimpleType) {
    rows.push({ label: t('ittf.pimpleType'), value: info.pimpleType });
  }

  return (
    <dl className={compact ? 'mt-2 grid gap-1 text-xs' : 'mt-3 grid gap-1.5 text-xs'}>
      {rows.map((row) => (
        <div key={row.label} className="flex flex-wrap gap-x-2 gap-y-0.5">
          <dt
            className={
              compact ? 'text-amber-200/50' : 'text-[var(--color-text-tertiary)]'
            }
          >
            {row.label}
          </dt>
          <dd
            className={cn(
              row.mono && 'font-mono',
              compact ? 'text-amber-100/80' : 'text-[var(--color-text-secondary)]',
            )}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** True when the annotation carries listing dimensions worth showing. */
export function hasIttfListingDetail(info: IttfApprovalInfo | undefined): boolean {
  if (!info) return false;
  return Boolean(
    info.equipmentCode ||
      info.expiresOn ||
      info.topSheetColors?.length ||
      info.spongeColors?.length ||
      info.colors?.length ||
      info.oxVersion != null ||
      info.approvalStatus != null ||
      info.isActive != null ||
      info.pimpleType,
  );
}
