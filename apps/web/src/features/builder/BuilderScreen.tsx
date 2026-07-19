import { useCatalogQuery } from '@/features/catalog/useCatalogQuery';
import { BuilderProductPicker } from '@/features/builder/BuilderProductPicker';
import { useBuilderStore } from '@/features/builder/builder-store';
import { RacketPreview } from '@/features/builder/RacketPreview';
import { EmptyState } from '@/shared/components/EmptyState';
import { TextLink } from '@/shared/components/TextLink';

export function BuilderScreen() {
  const { data, isPending, isError } = useCatalogQuery();
  const products = data?.products ?? [];

  const blade = useBuilderStore((state) => state.blade);
  const fh = useBuilderStore((state) => state.fh);
  const bh = useBuilderStore((state) => state.bh);
  const activeSlot = useBuilderStore((state) => state.activeSlot);
  const setActiveSlot = useBuilderStore((state) => state.setActiveSlot);
  const selectProduct = useBuilderStore((state) => state.selectProduct);
  const clearSlot = useBuilderStore((state) => state.clearSlot);
  const reset = useBuilderStore((state) => state.reset);

  if (isError) {
    return (
      <EmptyState
        eyebrow="Builder"
        title="No se pudo cargar el catálogo local."
        description="El builder solo usa JSON e imágenes propias."
        action={<TextLink to="/products">Ir a productos</TextLink>}
      />
    );
  }

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
          Builder
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
          Arma tu setup
        </h1>
        <p className="max-w-2xl text-base text-[var(--color-text-secondary)]">
          En la paleta elige en orden: madero, goma derecha y goma izquierda. Busca por nombre o marca
          en el catálogo local.
        </p>
        {blade || fh || bh ? (
          <button
            type="button"
            onClick={reset}
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            Reiniciar setup
          </button>
        ) : null}
      </header>

      {isPending ? (
        <p className="text-sm text-[var(--color-text-tertiary)]">Cargando catálogo…</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <aside className="space-y-4" aria-label="Paleta del builder">
            <BuilderProductPicker
              label="1 · Madero"
              hint="Selecciona primero la madera"
              category="blade"
              products={products}
              selected={blade}
              isActive={activeSlot === 'blade'}
              onActivate={() => setActiveSlot('blade')}
              onSelect={(product) => selectProduct('blade', product)}
              onClear={() => clearSlot('blade')}
            />

            <BuilderProductPicker
              label="2 · Goma derecha"
              hint="Forehand / lado derecho"
              category="rubber"
              products={products}
              selected={fh}
              isActive={activeSlot === 'fh'}
              onActivate={() => setActiveSlot('fh')}
              onSelect={(product) => selectProduct('fh', product)}
              onClear={() => clearSlot('fh')}
              disabled={!blade}
              disabledReason="Elige el madero antes de la goma derecha."
            />

            <BuilderProductPicker
              label="3 · Goma izquierda"
              hint="Backhand / lado izquierdo"
              category="rubber"
              products={products}
              selected={bh}
              isActive={activeSlot === 'bh'}
              onActivate={() => setActiveSlot('bh')}
              onSelect={(product) => selectProduct('bh', product)}
              onClear={() => clearSlot('bh')}
              disabled={!blade || !fh}
              disabledReason="Elige madero y goma derecha antes."
            />
          </aside>

          <RacketPreview blade={blade} fh={fh} bh={bh} />
        </div>
      )}
    </div>
  );
}
