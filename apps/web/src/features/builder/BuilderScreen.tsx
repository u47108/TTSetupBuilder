import { useCatalogQuery } from '@/features/catalog/useCatalogQuery';
import { BladeHandlePicker } from '@/features/builder/BladeHandlePicker';
import { BuilderDiscontinuedAlert } from '@/features/builder/BuilderDiscontinuedAlert';
import { BuilderIttfAlert } from '@/features/builder/BuilderIttfAlert';
import { BuilderProductPicker } from '@/features/builder/BuilderProductPicker';
import { PlayerPhotoPicker } from '@/features/builder/PlayerPhotoPicker';
import { useBuilderStore } from '@/features/builder/builder-store';
import { RacketPreview } from '@/features/builder/RacketPreview';
import { EmptyState } from '@/shared/components/EmptyState';
import { TextLink } from '@/shared/components/TextLink';
import { useT } from '@/shared/i18n/useT';

export function BuilderScreen() {
  const t = useT();
  const { data, isPending, isError } = useCatalogQuery();
  const products = data?.products ?? [];

  const blade = useBuilderStore((state) => state.blade);
  const bladeHandle = useBuilderStore((state) => state.bladeHandle);
  const fh = useBuilderStore((state) => state.fh);
  const bh = useBuilderStore((state) => state.bh);
  const playerPhotoUrl = useBuilderStore((state) => state.playerPhotoUrl);
  const playerName = useBuilderStore((state) => state.playerName);
  const playerPhotoZoom = useBuilderStore((state) => state.playerPhotoZoom);
  const playerPhotoOffsetX = useBuilderStore((state) => state.playerPhotoOffsetX);
  const playerPhotoOffsetY = useBuilderStore((state) => state.playerPhotoOffsetY);
  const activeSlot = useBuilderStore((state) => state.activeSlot);
  const setActiveSlot = useBuilderStore((state) => state.setActiveSlot);
  const selectProduct = useBuilderStore((state) => state.selectProduct);
  const setBladeHandle = useBuilderStore((state) => state.setBladeHandle);
  const setPlayerPhoto = useBuilderStore((state) => state.setPlayerPhoto);
  const setPlayerName = useBuilderStore((state) => state.setPlayerName);
  const setPlayerPhotoZoom = useBuilderStore((state) => state.setPlayerPhotoZoom);
  const setPlayerPhotoOffset = useBuilderStore((state) => state.setPlayerPhotoOffset);
  const clearPlayerPhoto = useBuilderStore((state) => state.clearPlayerPhoto);
  const clearSlot = useBuilderStore((state) => state.clearSlot);
  const reset = useBuilderStore((state) => state.reset);

  const rubbersUnlocked = Boolean(blade && bladeHandle);
  const photoUnlocked = Boolean(blade && bladeHandle && fh && bh);
  const hasDraft = Boolean(blade || fh || bh || playerPhotoUrl || playerName);

  if (isError) {
    return (
      <EmptyState
        eyebrow={t('builder.eyebrow')}
        title={t('builder.errorTitle')}
        description={t('builder.errorDescription')}
        action={<TextLink to="/products">{t('builder.goProducts')}</TextLink>}
      />
    );
  }

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
          {t('builder.eyebrow')}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
          {t('builder.title')}
        </h1>
        <p className="max-w-2xl text-base text-[var(--color-text-secondary)]">
          {t('builder.description')}
        </p>
        {hasDraft ? (
          <button
            type="button"
            onClick={reset}
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            {t('builder.reset')}
          </button>
        ) : null}
      </header>

      {isPending ? (
        <p className="text-sm text-[var(--color-text-tertiary)]">{t('builder.loading')}</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <aside className="space-y-4" aria-label={t('builder.paletteAria')}>
            <BuilderProductPicker
              label={t('builder.bladeLabel')}
              hint={t('builder.bladeHint')}
              category="blade"
              products={products}
              selected={blade}
              isActive={activeSlot === 'blade'}
              onActivate={() => setActiveSlot('blade')}
              onSelect={(product) => selectProduct('blade', product)}
              onClear={() => clearSlot('blade')}
            />

            {blade ? (
              <BladeHandlePicker
                available={blade.handleTypes ?? ['FL', 'ST']}
                selected={bladeHandle}
                onSelect={setBladeHandle}
              />
            ) : null}

            <BuilderProductPicker
              label={t('builder.fhLabel')}
              hint={t('builder.fhHint')}
              category="rubber"
              products={products}
              selected={fh}
              isActive={activeSlot === 'fh'}
              onActivate={() => setActiveSlot('fh')}
              onSelect={(product) => selectProduct('fh', product)}
              onClear={() => clearSlot('fh')}
              disabled={!rubbersUnlocked}
              disabledReason={t('builder.needBladeHandle')}
            />

            <BuilderProductPicker
              label={t('builder.bhLabel')}
              hint={t('builder.bhHint')}
              category="rubber"
              products={products}
              selected={bh}
              isActive={activeSlot === 'bh'}
              onActivate={() => setActiveSlot('bh')}
              onSelect={(product) => selectProduct('bh', product)}
              onClear={() => clearSlot('bh')}
              disabled={!rubbersUnlocked || !fh}
              disabledReason={t('builder.needFh')}
            />

            <BuilderDiscontinuedAlert blade={blade} fh={fh} bh={bh} />
            <BuilderIttfAlert fh={fh} bh={bh} />

            <PlayerPhotoPicker
              photoUrl={playerPhotoUrl}
              playerName={playerName}
              zoom={playerPhotoZoom}
              offsetX={playerPhotoOffsetX}
              offsetY={playerPhotoOffsetY}
              isActive={activeSlot === 'player'}
              disabled={!photoUnlocked}
              disabledReason={t('builder.needSetupForPhoto')}
              onActivate={() => setActiveSlot('player')}
              onPhoto={setPlayerPhoto}
              onNameChange={setPlayerName}
              onZoomChange={setPlayerPhotoZoom}
              onOffsetChange={setPlayerPhotoOffset}
              onClear={clearPlayerPhoto}
            />
          </aside>

          <RacketPreview
            blade={blade}
            bladeHandle={bladeHandle}
            fh={fh}
            bh={bh}
            playerPhotoUrl={playerPhotoUrl}
            playerName={playerName}
            playerPhotoZoom={playerPhotoZoom}
            playerPhotoOffsetX={playerPhotoOffsetX}
            playerPhotoOffsetY={playerPhotoOffsetY}
          />
        </div>
      )}
    </div>
  );
}
