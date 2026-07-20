import { useMemo } from 'react';
import { useCatalogQuery } from '@/features/catalog/useCatalogQuery';
import { useT } from '@/shared/i18n/useT';

export function CatalogHeaderCount() {
  const t = useT();
  const { data } = useCatalogQuery();

  const counts = useMemo(() => {
    if (!data) return null;
    let blades = 0;
    let rubbers = 0;
    for (const product of data.products) {
      if (product.category === 'blade') blades += 1;
      else if (product.category === 'rubber') rubbers += 1;
    }
    return { blades, rubbers };
  }, [data]);

  if (!counts) return null;

  return (
    <p
      className="hidden text-xs tabular-nums text-[var(--color-text-tertiary)] md:block"
      aria-label={t('shell.catalogCountAria', counts)}
    >
      {t('shell.catalogCount', counts)}
    </p>
  );
}
