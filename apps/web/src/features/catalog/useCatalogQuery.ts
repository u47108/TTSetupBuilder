import { useQuery } from '@tanstack/react-query';
import type { CatalogDocument } from '@ttsetupbuilder/types';

const CATALOG_URL = '/data/catalog.json';

async function fetchCatalogDocument(): Promise<CatalogDocument> {
  const response = await fetch(CATALOG_URL);
  if (!response.ok) {
    throw new Error(`Failed to load local catalog (${response.status})`);
  }
  return (await response.json()) as CatalogDocument;
}

/** Loads owned static catalog JSON (ADR-009 / ADR-014) — never a third-party origin. */
export function useCatalogQuery() {
  return useQuery({
    queryKey: ['catalog', 'local'],
    queryFn: fetchCatalogDocument,
    staleTime: Infinity,
  });
}
