import { useDeferredValue, useMemo, useState } from 'react';
import type { CatalogProduct, ProductCategory } from '@ttsetupbuilder/types';
import { searchCatalog } from '@/features/search/searchCatalog';
import { useT } from '@/shared/i18n/useT';
import { cn } from '@/shared/lib/cn';

type BuilderProductPickerProps = {
  label: string;
  hint: string;
  category: ProductCategory;
  products: CatalogProduct[];
  selected: CatalogProduct | null;
  isActive: boolean;
  onActivate: () => void;
  onSelect: (product: CatalogProduct) => void;
  onClear: () => void;
  disabled?: boolean;
  disabledReason?: string;
};

export function BuilderProductPicker({
  label,
  hint,
  category,
  products,
  selected,
  isActive,
  onActivate,
  onSelect,
  onClear,
  disabled = false,
  disabledReason,
}: BuilderProductPickerProps) {
  const t = useT();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const pool = useMemo(
    () => products.filter((product) => product.category === category),
    [products, category],
  );

  const results = useMemo(() => {
    const trimmed = deferredQuery.trim();
    if (!trimmed) {
      return pool.slice(0, 12);
    }
    return searchCatalog(pool, trimmed).slice(0, 20);
  }, [pool, deferredQuery]);

  const primary = selected?.images.find((image) => image.isPrimary) ?? selected?.images[0];

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
            {label}
          </p>
          <p className="text-sm text-[var(--color-text-secondary)]">{hint}</p>
        </div>
        {selected ? (
          <span className="shrink-0 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-canvas)] px-2 py-1 text-xs text-[var(--color-text-secondary)]">
            {t('builder.selected')}
          </span>
        ) : null}
      </button>

      {selected ? (
        <div className="mt-4 flex items-center gap-3">
          <div className="h-16 w-16 overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-media-stage)]">
            {primary ? (
              <img src={primary.src} alt={primary.alt} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="truncate font-[family-name:var(--font-display)] text-[var(--color-text-primary)]">
              {selected.name}
            </p>
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">
              {selected.brandId}
              {selected.discontinued ? ` · ${t('discontinued.badge')}` : ''}
            </p>
            <button
              type="button"
              className="text-xs text-[var(--color-accent)] hover:underline"
              onClick={onClear}
            >
              {t('builder.clear')}
            </button>
          </div>
        </div>
      ) : null}

      {disabled ? (
        <p className="mt-4 text-sm text-[var(--color-text-tertiary)]">
          {disabledReason ?? t('builder.completePrevious')}
        </p>
      ) : isActive ? (
        <div className="mt-4 space-y-3">
          <label className="block space-y-2">
            <span className="sr-only">{t('builder.searchPlaceholder', { label })}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('builder.searchPlaceholder', { label: label.toLowerCase() })}
              autoComplete="off"
              className="w-full rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-canvas)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            />
          </label>

          {pool.length === 0 ? (
            <p className="text-sm text-[var(--color-text-tertiary)]">
              {category === 'blade' ? t('builder.emptyBlades') : t('builder.emptyRubbers')}
            </p>
          ) : results.length === 0 ? (
            <p className="text-sm text-[var(--color-text-tertiary)]">{t('builder.noMatches')}</p>
          ) : (
            <ul className="max-h-64 space-y-1 overflow-y-auto pr-1">
              {results.map((product) => {
                const thumb =
                  product.images.find((image) => image.isPrimary) ?? product.images[0];
                const isSelected = selected?.id === product.id;
                return (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(product)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors',
                        isSelected
                          ? 'bg-[var(--color-accent-muted)]'
                          : 'hover:bg-[var(--color-canvas)]',
                      )}
                    >
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-media-stage)]">
                        {thumb ? (
                          <img
                            src={thumb.src}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-[var(--color-text-primary)]">
                          {product.name}
                        </p>
                        <p className="truncate text-xs text-[var(--color-text-tertiary)]">
                          {product.brandId}
                          {product.discontinued ? ` · ${t('discontinued.badge')}` : ''}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <button
          type="button"
          className="mt-4 text-sm text-[var(--color-accent)] hover:underline"
          onClick={onActivate}
        >
          {t('builder.openSearch')}
        </button>
      )}
    </section>
  );
}
