import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCatalogQuery } from '@/features/catalog/useCatalogQuery';
import { DiscontinuedNotice } from '@/features/products/DiscontinuedNotice';
import { IttfApprovalNotice } from '@/features/products/IttfApprovalNotice';
import { EmptyState } from '@/shared/components/EmptyState';
import { TextLink } from '@/shared/components/TextLink';
import { useT } from '@/shared/i18n/useT';
import type { MessageKey } from '@/shared/i18n/types';

export function ProductDetailScreen() {
  const t = useT();
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
        eyebrow={t('productDetail.eyebrow')}
        title={t('productDetail.errorTitle')}
        description={t('productDetail.errorDescription')}
        action={<TextLink to="/products">{t('productDetail.back')}</TextLink>}
      />
    );
  }

  if (isPending) {
    return (
      <p className="text-sm text-[var(--color-text-tertiary)]">{t('productDetail.loading')}</p>
    );
  }

  if (!product) {
    return (
      <EmptyState
        eyebrow={t('productDetail.eyebrow')}
        title={
          slug
            ? t('productDetail.missingTitle', { slug })
            : t('productDetail.missingTitle', { slug: '—' })
        }
        description={t('productDetail.missingDescription')}
        action={<TextLink to="/products">{t('productDetail.back')}</TextLink>}
      />
    );
  }

  const images = product.images;
  const active = images[activeIndex] ?? images[0];
  const categoryKey = `category.${product.category}` as MessageKey;

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
            {t(categoryKey)}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
            {product.name}
          </h1>
          {product.description ? (
            <p className="text-base text-[var(--color-text-secondary)]">{product.description}</p>
          ) : null}
        </div>

        {product.discontinued ? <DiscontinuedNotice /> : null}

        {product.category === 'rubber' && product.ittfApproval ? (
          <IttfApprovalNotice info={product.ittfApproval} />
        ) : null}

        <dl className="space-y-3 text-sm text-[var(--color-text-secondary)]">
          <div className="flex justify-between gap-4 border-b border-[var(--color-border-subtle)] py-2">
            <dt>{t('productDetail.brand')}</dt>
            <dd className="text-[var(--color-text-primary)]">{product.brandId}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-[var(--color-border-subtle)] py-2">
            <dt>{t('productDetail.images')}</dt>
            <dd className="text-[var(--color-text-primary)]">{images.length}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-[var(--color-border-subtle)] py-2">
            <dt>{t('productDetail.source')}</dt>
            <dd className="text-[var(--color-text-primary)]">{product.provenance.sourceId}</dd>
          </div>
          {product.discontinued ? (
            <div className="flex justify-between gap-4 border-b border-[var(--color-border-subtle)] py-2">
              <dt>{t('productDetail.discontinued')}</dt>
              <dd className="text-amber-200/90">{t('discontinued.badge')}</dd>
            </div>
          ) : null}
          {product.ittfApproval ? (
            <div className="flex justify-between gap-4 border-b border-[var(--color-border-subtle)] py-2">
              <dt>{t('productDetail.ittf')}</dt>
              <dd className="text-right text-[var(--color-text-primary)]">
                {product.ittfApproval.status}
                {product.ittfApproval.equipmentCode
                  ? ` · ${product.ittfApproval.equipmentCode}`
                  : ''}
              </dd>
            </div>
          ) : null}
        </dl>

        <TextLink to="/products">{t('productDetail.back')}</TextLink>
      </section>
    </div>
  );
}
