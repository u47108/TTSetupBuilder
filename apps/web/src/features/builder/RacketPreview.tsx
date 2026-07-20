import { useState } from 'react';
import { motion } from 'framer-motion';
import type { BladeHandleType, CatalogProduct } from '@ttsetupbuilder/types';
import { BuilderDiscontinuedAlert } from '@/features/builder/BuilderDiscontinuedAlert';
import { BuilderIttfAlert } from '@/features/builder/BuilderIttfAlert';
import {
  downloadSetupShareImage,
  shareSetupShareImage,
} from '@/features/builder/exportSetupShareImage';
import { shouldShowIttfApprovalAlert } from '@/features/products/IttfApprovalNotice';
import { useT } from '@/shared/i18n/useT';
import { cn } from '@/shared/lib/cn';

type RacketPreviewProps = {
  blade: CatalogProduct | null;
  bladeHandle: BladeHandleType | null;
  fh: CatalogProduct | null;
  bh: CatalogProduct | null;
  playerPhotoUrl: string | null;
  playerName: string;
  playerPhotoZoom: number;
  playerPhotoOffsetX: number;
  playerPhotoOffsetY: number;
};

function RubberTile({
  label,
  product,
  emptyLabel,
}: {
  label: string;
  product: CatalogProduct | null;
  emptyLabel: string;
}) {
  const image = product?.images.find((entry) => entry.isPrimary) ?? product?.images[0];
  const ittfAlert = shouldShowIttfApprovalAlert(product?.ittfApproval);
  const discontinued = Boolean(product?.discontinued);
  const warnLabel = ittfAlert || discontinued;

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-media-stage)]">
      <p className="border-b border-[var(--color-border-subtle)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
        {label}
      </p>
      <div className="aspect-square p-2">
        {image ? (
          <motion.img
            key={image.src}
            src={image.src}
            alt={image.alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--color-text-tertiary)]">
            —
          </div>
        )}
      </div>
      <p
        className={cn(
          'truncate px-2.5 pb-2 text-xs',
          warnLabel ? 'font-medium text-amber-200/90' : 'text-[var(--color-text-secondary)]',
        )}
      >
        {product?.name ?? emptyLabel}
      </p>
    </div>
  );
}

/** Dynamic composition preview — poster layout for share (ADR-011). */
export function RacketPreview({
  blade,
  bladeHandle,
  fh,
  bh,
  playerPhotoUrl,
  playerName,
  playerPhotoZoom,
  playerPhotoOffsetX,
  playerPhotoOffsetY,
}: RacketPreviewProps) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const canShare = Boolean(blade && fh && bh);
  const setupReady = canShare;
  const bladeImage = blade?.images.find((entry) => entry.isPrimary) ?? blade?.images[0];
  const displayName = playerName.trim() || t('builder.preview.defaultName');
  const fhIttfAlert = shouldShowIttfApprovalAlert(fh?.ittfApproval);
  const bhIttfAlert = shouldShowIttfApprovalAlert(bh?.ittfApproval);
  const bladeDiscontinued = Boolean(blade?.discontinued);
  const fhDiscontinued = Boolean(fh?.discontinued);
  const bhDiscontinued = Boolean(bh?.discontinued);

  const sharePayload = () => {
    if (!blade || !fh || !bh) return null;
    return {
      playerPhotoUrl,
      playerName,
      playerPhotoZoom,
      playerPhotoOffsetX,
      playerPhotoOffsetY,
      blade,
      bladeHandle,
      fh,
      bh,
    };
  };

  async function handleShare() {
    const payload = sharePayload();
    if (!payload) return;
    setBusy(true);
    setStatus(null);
    try {
      const result = await shareSetupShareImage(payload);
      setStatus(
        result === 'shared' ? t('builder.preview.shared') : t('builder.preview.downloadedShare'),
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setStatus(null);
      } else {
        setStatus(t('builder.preview.shareFailed'));
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleDownload() {
    const payload = sharePayload();
    if (!payload) return;
    setBusy(true);
    setStatus(null);
    try {
      await downloadSetupShareImage(payload);
      setStatus(t('builder.preview.downloaded'));
    } catch {
      setStatus(t('builder.preview.generateFailed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-elevated)] p-4 sm:p-5">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
          {t('builder.preview.eyebrow')}
        </p>
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-text-primary)]">
          {t('builder.preview.title')}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {t('builder.preview.description')}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-sunken)]">
        <div className="grid min-h-[280px] sm:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
          <div className="relative min-h-[220px] overflow-hidden bg-[var(--color-media-stage)]">
            {playerPhotoUrl ? (
              <img
                src={playerPhotoUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  transform: `translate(${playerPhotoOffsetX * 18}%, ${playerPhotoOffsetY * 18}%) scale(${playerPhotoZoom})`,
                  transformOrigin: 'center center',
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-[var(--color-text-tertiary)]">
                {t('builder.preview.uploadPhoto')}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-sunken)] via-transparent to-transparent" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--color-sunken)] to-transparent max-sm:hidden" />
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-auto sm:top-4">
              <p className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight tracking-tight text-white drop-shadow sm:text-3xl">
                {displayName}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                Setup
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-3 sm:p-4">
            <div className="grid flex-1 grid-cols-[minmax(0,1fr)_5.5rem] gap-2 sm:grid-cols-[minmax(0,1fr)_7rem]">
              <div className="flex items-center justify-center overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-media-stage)] p-3">
                {bladeImage ? (
                  <motion.img
                    key={bladeImage.src}
                    src={bladeImage.src}
                    alt={bladeImage.alt}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-h-44 w-full object-contain sm:max-h-56"
                  />
                ) : (
                  <p className="text-sm text-[var(--color-text-tertiary)]">
                    {t('builder.preview.noBlade')}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <RubberTile
                  label="FH"
                  product={fh}
                  emptyLabel={t('builder.preview.noRubber')}
                />
                <RubberTile
                  label="BH"
                  product={bh}
                  emptyLabel={t('builder.preview.noRubber')}
                />
              </div>
            </div>

            <ul className="space-y-1.5 border-t border-[var(--color-border-subtle)] pt-3 text-sm">
              <li className="flex gap-2">
                <span className="w-20 shrink-0 text-xs uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
                  {t('builder.preview.blade')}
                </span>
                <span
                  className={cn(
                    'truncate',
                    bladeDiscontinued
                      ? 'font-medium text-amber-200/90'
                      : 'text-[var(--color-text-primary)]',
                  )}
                >
                  {blade
                    ? `${blade.name}${bladeHandle ? ` · ${bladeHandle}` : ''}`
                    : '—'}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="w-20 shrink-0 text-xs uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
                  {t('builder.preview.forehand')}
                </span>
                <span
                  className={cn(
                    'truncate',
                    fhIttfAlert || fhDiscontinued
                      ? 'font-medium text-amber-200/90'
                      : 'text-[var(--color-text-primary)]',
                  )}
                >
                  {fh?.name ?? '—'}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="w-20 shrink-0 text-xs uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
                  {t('builder.preview.backhand')}
                </span>
                <span
                  className={cn(
                    'truncate',
                    bhIttfAlert || bhDiscontinued
                      ? 'font-medium text-amber-200/90'
                      : 'text-[var(--color-text-primary)]',
                  )}
                >
                  {bh?.name ?? '—'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {setupReady ? (
        <BuilderDiscontinuedAlert blade={blade} fh={fh} bh={bh} placement="preview" />
      ) : null}
      {setupReady ? <BuilderIttfAlert fh={fh} bh={bh} placement="preview" /> : null}

      <div className="space-y-3 border-t border-[var(--color-border-subtle)] pt-4">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
          {t('builder.preview.shareEyebrow')}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!canShare || busy}
            onClick={() => void handleShare()}
            className="rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[var(--color-canvas)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {busy ? t('builder.preview.generating') : t('builder.preview.share')}
          </button>
          <button
            type="button"
            disabled={!canShare || busy}
            onClick={() => void handleDownload()}
            className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas)] px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {t('builder.preview.downloadPng')}
          </button>
        </div>
        {!canShare ? (
          <p className="text-sm text-[var(--color-text-tertiary)]">{t('builder.preview.needGear')}</p>
        ) : null}
        {status ? <p className="text-sm text-[var(--color-accent)]">{status}</p> : null}
      </div>
    </div>
  );
}
