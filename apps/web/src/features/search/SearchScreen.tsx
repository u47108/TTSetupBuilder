import { useDeferredValue, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCatalogQuery } from '@/features/catalog/useCatalogQuery';
import { searchCatalog } from '@/features/search/searchCatalog';
import { EmptyState } from '@/shared/components/EmptyState';
import { TextLink } from '@/shared/components/TextLink';
import { useT } from '@/shared/i18n/useT';
import type { MessageKey } from '@/shared/i18n/types';

export function SearchScreen() {
  const t = useT();
  const { data, isPending, isError } = useCatalogQuery();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const products = data?.products ?? [];
  const results = searchCatalog(products, deferredQuery);
  const hasCatalog = products.length > 0;
  const showResults = deferredQuery.trim().length > 0;

  if (isError) {
    return (
      <EmptyState
        eyebrow={t('search.eyebrow')}
        title={t('search.errorTitle')}
        description={t('search.errorDescription')}
        action={<TextLink to="/products">{t('search.browseProducts')}</TextLink>}
      />
    );
  }

  if (!isPending && !hasCatalog) {
    return (
      <div className="space-y-10">
        <SearchField query={query} onQueryChange={setQuery} disabled={isPending} />
        <EmptyState
          eyebrow={t('search.eyebrow')}
          title={t('search.emptyTitle')}
          description={t('search.emptyDescription')}
          action={<TextLink to="/products">{t('search.browseProducts')}</TextLink>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">
          {t('search.eyebrow')}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
          {t('search.title')}
        </h1>
        <p className="max-w-xl text-base text-[var(--color-text-secondary)]">
          {t('search.description')}
        </p>
        <SearchField query={query} onQueryChange={setQuery} disabled={isPending} />
      </header>

      {isPending ? (
        <p className="text-sm text-[var(--color-text-tertiary)]">{t('search.loading')}</p>
      ) : null}

      {!isPending && showResults && results.length === 0 ? (
        <EmptyState
          eyebrow={t('search.noMatchesEyebrow')}
          title={t('search.noMatchesTitle')}
          description={t('search.noMatchesDescription')}
        />
      ) : null}

      {!isPending && showResults && results.length > 0 ? (
        <ul className="grid gap-6 sm:grid-cols-2">
          {results.map((product, index) => {
            const primary = product.images.find((image) => image.isPrimary) ?? product.images[0];
            const categoryKey = `category.${product.category}` as MessageKey;
            return (
              <motion.li
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.24), duration: 0.35 }}
              >
                <Link
                  to={`/products/${product.slug}`}
                  className="group block space-y-3 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-media-stage)]">
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
      ) : null}

      {!isPending && !showResults && hasCatalog ? (
        <p className="text-sm text-[var(--color-text-secondary)]">
          {t('search.idleHint', { count: products.length })}
        </p>
      ) : null}
    </div>
  );
}

type SearchFieldProps = {
  query: string;
  onQueryChange: (value: string) => void;
  disabled?: boolean;
};

function SearchField({ query, onQueryChange, disabled }: SearchFieldProps) {
  const t = useT();
  return (
    <label className="block max-w-xl space-y-2">
      <span className="sr-only">{t('search.fieldLabel')}</span>
      <input
        type="search"
        value={query}
        disabled={disabled}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={t('search.placeholder')}
        autoComplete="off"
        className="w-full rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-elevated)] px-4 py-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
      />
    </label>
  );
}
