import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCatalogQuery } from '@/features/catalog/useCatalogQuery';
import { EmptyState } from '@/shared/components/EmptyState';
import { TextLink } from '@/shared/components/TextLink';

export function ProductDetailScreen() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isPending, isError } = useCatalogQuery();
  const product = useMemo(
    () => data?.products.find((entry) => entry.slug === slug),
    [data?.products, slug],
  );
  const [activeIndex, setActiveIndex] = useState(0);

  if (isError) {
    return (
      <EmptyState
        eyebrow="Product detail"
        title="Catalog failed to load."
        description="Owned /data/catalog.json is required."
        action={<TextLink to="/products">Back to products</TextLink>}
      />
    );
  }

  if (isPending) {
    return (
      <p className="text-sm text-[var(--color-text-tertiary)]">Loading product from local catalog…</p>
    );
  }

  if (!product) {
    return (
      <EmptyState
        eyebrow="Product detail"
        title={slug ? `“${slug}” is not in the owned catalog.` : 'Product not loaded yet.'}
        description="Detail pages only resolve products published into local JSON — never live third-party pages."
        action={<TextLink to="/products">Back to products</TextLink>}
      />
    );
  }

  const images = product.images;
  const active = images[activeIndex] ?? images[0];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <section className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-media-stage)]">
          {active ? (
            <motion.img
              key={active.id}
              src={active.src}
              alt={active.alt}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="h-full w-full object-contain p-6"
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(145deg,rgb(45_212_191_/_0.08),transparent_42%)]" />
          )}
        </div>
        {images.length > 1 ? (
          <ul className="grid grid-cols-4 gap-3">
            {images.map((image, index) => (
              <li key={image.id}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`aspect-square w-full overflow-hidden rounded-xl border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${
                    index === activeIndex
                      ? 'border-[var(--color-accent)]'
                      : 'border-[var(--color-border-subtle)]'
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
            {product.category}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
            {product.name}
          </h1>
          {product.description ? (
            <p className="text-base text-[var(--color-text-secondary)]">{product.description}</p>
          ) : null}
        </div>

        <dl className="space-y-3 text-sm text-[var(--color-text-secondary)]">
          <div className="flex justify-between gap-4 border-b border-[var(--color-border-subtle)] py-2">
            <dt>Brand</dt>
            <dd className="text-[var(--color-text-primary)]">{product.brandId}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-[var(--color-border-subtle)] py-2">
            <dt>Images</dt>
            <dd className="text-[var(--color-text-primary)]">{images.length}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-[var(--color-border-subtle)] py-2">
            <dt>Source</dt>
            <dd className="text-[var(--color-text-primary)]">{product.provenance.sourceId}</dd>
          </div>
        </dl>

        <TextLink to="/products">Back to products</TextLink>
      </section>
    </div>
  );
}
