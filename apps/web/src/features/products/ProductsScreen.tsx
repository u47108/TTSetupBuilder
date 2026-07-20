import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCatalogQuery } from '@/features/catalog/useCatalogQuery';
import { EmptyState } from '@/shared/components/EmptyState';
import { TextLink } from '@/shared/components/TextLink';
import { useT } from '@/shared/i18n/useT';
import type { MessageKey } from '@/shared/i18n/types';

export function ProductsScreen() {
  const t = useT();
  const { data, isPending, isError } = useCatalogQuery();
  const products = data?.products ?? [];

  if (isError) {
    return (
      <EmptyState
        eyebrow={t('products.eyebrow')}
        title={t('products.errorTitle')}
        description={t('products.errorDescription')}
        action={<TextLink to="/search">{t('products.trySearch')}</TextLink>}
      />
    );
  }

  if (!isPending && products.length === 0) {
    return (
      <EmptyState
        eyebrow={t('products.eyebrow')}
        title={t('products.emptyTitle')}
        description={t('products.emptyDescription')}
        action={<TextLink to="/search">{t('products.goSearch')}</TextLink>}
      />
    );
  }

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
          {t('products.eyebrow')}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
          {t('products.title')}
        </h1>
        <p className="max-w-xl text-base text-[var(--color-text-secondary)]">
          {isPending
            ? t('products.loading')
            : t('products.count', { count: products.length })}
        </p>
      </header>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => {
          const primary = product.images.find((image) => image.isPrimary) ?? product.images[0];
          const categoryKey = `category.${product.category}` as MessageKey;
          return (
            <motion.li
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.35 }}
            >
              <Link
                to={`/products/${product.slug}`}
                className="group block space-y-3 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-media-stage)]">
                  {primary ? (
                    <img
                      src={primary.src}
                      alt={primary.alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(145deg,rgb(45_212_191_/_0.08),transparent_42%)]" />
                  )}
                </div>
                <div className="space-y-1 px-0.5">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
                    {t(categoryKey)}
                    {product.discontinued ? ` · ${t('products.discontinued')}` : ''}
                    {product.category === 'rubber' &&
                    product.ittfApproval &&
                    product.ittfApproval.status !== 'approved'
                      ? ` · ${t('products.ittfAlert')}`
                      : ''}
                  </p>
                  <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-text-primary)]">
                    {product.name}
                  </h2>
                </div>
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
