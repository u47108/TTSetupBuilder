import Fuse, { type IFuseOptions } from 'fuse.js';
import type { CatalogProduct } from '@ttsetupbuilder/types';

const FUSE_OPTIONS: IFuseOptions<CatalogProduct> = {
  keys: [
    { name: 'name', weight: 0.45 },
    { name: 'slug', weight: 0.2 },
    { name: 'brandId', weight: 0.15 },
    { name: 'category', weight: 0.1 },
    { name: 'description', weight: 0.1 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  includeScore: true,
};

/** Client-side fuzzy search over owned catalog rows (ADR-010). */
export function searchCatalog(products: CatalogProduct[], query: string): CatalogProduct[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  if (products.length === 0) return [];

  const fuse = new Fuse(products, FUSE_OPTIONS);
  return fuse.search(trimmed).map((result) => result.item);
}
