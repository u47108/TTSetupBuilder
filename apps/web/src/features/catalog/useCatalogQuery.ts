import { useQuery } from '@tanstack/react-query';
import type { CatalogDocument } from '@ttsetupbuilder/types';
import { publicAssetUrl } from '@/shared/lib/publicAssetUrl';

async function fetchCatalogDocument(): Promise<CatalogDocument> {
  const response = await fetch(publicAssetUrl('/data/catalog.json'));
  if (!response.ok) {
    throw new Error(`Failed to load local catalog (${response.status})`);
  }
  const doc = (await response.json()) as CatalogDocument;
  return {
    ...doc,
    products: doc.products.map((product) => ({
      ...product,
      images: product.images.map((image) => ({
        ...image,
        src: publicAssetUrl(image.src),
      })),
      imageLocalPaths: product.imageLocalPaths?.map((path) => publicAssetUrl(path)),
    })),
  };
}

/** Loads owned static catalog JSON (ADR-009 / ADR-014) — never a third-party origin. */
export function useCatalogQuery() {
  return useQuery({
    queryKey: ['catalog', 'local', import.meta.env.BASE_URL],
    queryFn: fetchCatalogDocument,
    staleTime: Infinity,
  });
}
