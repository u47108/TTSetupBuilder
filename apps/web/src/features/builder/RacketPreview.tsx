import { useState } from 'react';
import { motion } from 'framer-motion';
import type { BladeHandleType, CatalogProduct } from '@ttsetupbuilder/types';
import {
  downloadSetupShareImage,
  shareSetupShareImage,
} from '@/features/builder/exportSetupShareImage';

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
}: {
  label: string;
  product: CatalogProduct | null;
}) {
  const image = product?.images.find((entry) => entry.isPrimary) ?? product?.images[0];

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
      <p className="truncate px-2.5 pb-2 text-xs text-[var(--color-text-secondary)]">
        {product?.name ?? 'Sin goma'}
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
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const canShare = Boolean(blade && fh && bh);
  const bladeImage = blade?.images.find((entry) => entry.isPrimary) ?? blade?.images[0];
  const displayName = playerName.trim() || 'Mi setup';

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
      setStatus(result === 'shared' ? 'Compartido.' : 'PNG descargado — súbelo a Instagram / X.');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setStatus(null);
      } else {
        setStatus('No se pudo compartir. Prueba descargar el PNG.');
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
      setStatus('PNG descargado — listo para redes.');
    } catch {
      setStatus('No se pudo generar la imagen.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-elevated)] p-4 sm:p-5">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
          Vista
        </p>
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-text-primary)]">
          Poster del setup
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Estilo tarjeta de jugador: foto + madero + gomas. El PNG exportado usa el mismo layout.
        </p>
      </div>

      {/* Live poster — same layout as PNG export (no flipped packaging) */}
      <div className="overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-sunken)]">
        <div className="grid min-h-[280px] sm:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
          {/* Portrait */}
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
                Sube tu foto
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

          {/* Gear stage */}
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
                  <p className="text-sm text-[var(--color-text-tertiary)]">Sin madero</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <RubberTile label="FH" product={fh} />
                <RubberTile label="BH" product={bh} />
              </div>
            </div>

            <ul className="space-y-1.5 border-t border-[var(--color-border-subtle)] pt-3 text-sm">
              <li className="flex gap-2">
                <span className="w-20 shrink-0 text-xs uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
                  Blade
                </span>
                <span className="truncate text-[var(--color-text-primary)]">
                  {blade
                    ? `${blade.name}${bladeHandle ? ` · ${bladeHandle}` : ''}`
                    : '—'}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="w-20 shrink-0 text-xs uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
                  Forehand
                </span>
                <span className="truncate text-[var(--color-text-primary)]">{fh?.name ?? '—'}</span>
              </li>
              <li className="flex gap-2">
                <span className="w-20 shrink-0 text-xs uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
                  Backhand
                </span>
                <span className="truncate text-[var(--color-text-primary)]">{bh?.name ?? '—'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-3 border-t border-[var(--color-border-subtle)] pt-4">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
          Compartir
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!canShare || busy}
            onClick={() => void handleShare()}
            className="rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-medium text-[var(--color-canvas)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {busy ? 'Generando…' : 'Compartir en redes'}
          </button>
          <button
            type="button"
            disabled={!canShare || busy}
            onClick={() => void handleDownload()}
            className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas)] px-4 py-2.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Descargar PNG
          </button>
        </div>
        {!canShare ? (
          <p className="text-sm text-[var(--color-text-tertiary)]">
            Completa madero + ambas gomas. La foto del jugador es opcional pero queda mucho mejor.
          </p>
        ) : null}
        {status ? <p className="text-sm text-[var(--color-accent)]">{status}</p> : null}
      </div>
    </div>
  );
}
