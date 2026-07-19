import { motion } from 'framer-motion';
import type { CatalogProduct } from '@ttsetupbuilder/types';

type RacketPreviewProps = {
  blade: CatalogProduct | null;
  fh: CatalogProduct | null;
  bh: CatalogProduct | null;
};

function PartCard({
  title,
  product,
  mirror,
}: {
  title: string;
  product: CatalogProduct | null;
  mirror?: boolean;
}) {
  const image = product?.images.find((entry) => entry.isPrimary) ?? product?.images[0];

  return (
    <div className="space-y-2">
      <p className="text-center text-xs uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
        {title}
      </p>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-media-stage)]">
        {image ? (
          <motion.img
            key={image.src}
            src={image.src}
            alt={image.alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`h-full w-full object-contain p-4 ${mirror ? 'scale-x-[-1]' : ''}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-[var(--color-text-tertiary)]">
            Sin seleccionar
          </div>
        )}
      </div>
      <p className="truncate text-center text-sm text-[var(--color-text-secondary)]">
        {product?.name ?? '—'}
      </p>
    </div>
  );
}

/** Dynamic composition preview — no stored assembled racket photos (ADR-011). */
export function RacketPreview({ blade, fh, bh }: RacketPreviewProps) {
  return (
    <div className="space-y-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-elevated)] p-5 sm:p-6">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
          Vista
        </p>
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-text-primary)]">
          Composición dinámica
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Blade + goma derecha + goma izquierda. Las fotos se componen en UI; no hay imagen de raqueta
          armada en inventario.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <PartCard title="Goma izq." product={bh} mirror />
        <PartCard title="Madero" product={blade} />
        <PartCard title="Goma der." product={fh} />
      </div>
    </div>
  );
}
