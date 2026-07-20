import { useRef } from 'react';
import {
  PLAYER_PHOTO_ZOOM_MAX,
  PLAYER_PHOTO_ZOOM_MIN,
} from '@/features/builder/builder-store';
import { useT } from '@/shared/i18n/useT';
import { cn } from '@/shared/lib/cn';

type PlayerPhotoPickerProps = {
  photoUrl: string | null;
  playerName: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
  isActive: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onActivate: () => void;
  onPhoto: (file: File) => void;
  onNameChange: (name: string) => void;
  onZoomChange: (zoom: number) => void;
  onOffsetChange: (x: number, y: number) => void;
  onClear: () => void;
};

const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif';

/** Optional player selfie/portrait for the shareable setup card. Stays local (blob URL). */
export function PlayerPhotoPicker({
  photoUrl,
  playerName,
  zoom,
  offsetX,
  offsetY,
  isActive,
  disabled = false,
  disabledReason,
  onActivate,
  onPhoto,
  onNameChange,
  onZoomChange,
  onOffsetChange,
  onClear,
}: PlayerPhotoPickerProps) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  return (
    <section
      className={cn(
        'rounded-2xl border p-4 transition-colors',
        isActive
          ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]'
          : 'border-[var(--color-border-subtle)] bg-[var(--color-elevated)]',
        disabled && 'opacity-55',
      )}
    >
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 text-left"
        onClick={onActivate}
        disabled={disabled}
      >
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">
            {t('builder.photo.label')}
          </p>
          <p className="text-sm text-[var(--color-text-secondary)]">{t('builder.photo.hint')}</p>
        </div>
        {photoUrl ? (
          <span className="shrink-0 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-canvas)] px-2 py-1 text-xs text-[var(--color-text-secondary)]">
            {t('builder.photo.ready')}
          </span>
        ) : null}
      </button>

      {disabled ? (
        <p className="mt-4 text-sm text-[var(--color-text-tertiary)]">
          {disabledReason ?? t('builder.photo.locked')}
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {photoUrl ? (
            <div className="space-y-3">
              <div
                className="relative aspect-[3/4] max-h-64 w-full cursor-grab overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-media-stage)] active:cursor-grabbing"
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId);
                  dragRef.current = {
                    pointerId: event.pointerId,
                    startX: event.clientX,
                    startY: event.clientY,
                    originX: offsetX,
                    originY: offsetY,
                  };
                }}
                onPointerMove={(event) => {
                  const drag = dragRef.current;
                  if (!drag || drag.pointerId !== event.pointerId) return;
                  const rect = event.currentTarget.getBoundingClientRect();
                  const dx = (event.clientX - drag.startX) / Math.max(rect.width, 1);
                  const dy = (event.clientY - drag.startY) / Math.max(rect.height, 1);
                  onOffsetChange(drag.originX + dx * 2, drag.originY + dy * 2);
                }}
                onPointerUp={(event) => {
                  if (dragRef.current?.pointerId === event.pointerId) {
                    dragRef.current = null;
                  }
                }}
                onPointerCancel={() => {
                  dragRef.current = null;
                }}
              >
                <img
                  src={photoUrl}
                  alt=""
                  draggable={false}
                  className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
                  style={{
                    transform: `translate(${offsetX * 18}%, ${offsetY * 18}%) scale(${zoom})`,
                    transformOrigin: 'center center',
                  }}
                />
                <p className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-white/80">
                  {t('builder.photo.dragHint')}
                </p>
              </div>

              <label className="block space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs text-[var(--color-text-tertiary)]">
                  <span>{t('builder.photo.zoom')}</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={PLAYER_PHOTO_ZOOM_MIN}
                  max={PLAYER_PHOTO_ZOOM_MAX}
                  step={0.01}
                  value={zoom}
                  onChange={(event) => onZoomChange(Number(event.target.value))}
                  className="w-full accent-[var(--color-accent)]"
                />
                <div className="flex justify-between text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
                  <span>{t('builder.photo.zoomOut')}</span>
                  <span>{t('builder.photo.zoomIn')}</span>
                </div>
              </label>

              <label className="block space-y-1">
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  {t('builder.photo.nameLabel')}
                </span>
                <input
                  type="text"
                  value={playerName}
                  onChange={(event) => onNameChange(event.target.value)}
                  placeholder={t('builder.photo.namePlaceholder')}
                  maxLength={40}
                  className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                />
              </label>

              <button
                type="button"
                className="text-xs text-[var(--color-accent)] hover:underline"
                onClick={onClear}
              >
                {t('builder.photo.remove')}
              </button>
            </div>
          ) : null}

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onPhoto(file);
              event.target.value = '';
            }}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-xl border border-dashed border-[var(--color-border-subtle)] bg-[var(--color-canvas)] px-3 py-3 text-sm text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            {photoUrl ? t('builder.photo.change') : t('builder.photo.upload')}
          </button>
        </div>
      )}
    </section>
  );
}
