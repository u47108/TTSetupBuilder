import type {
  BladeHandleType,
  CatalogProduct,
  ProductCategory,
} from '@ttsetupbuilder/types';

export type NormalizeProductInput = {
  id: string;
  slug: string;
  name: string;
  brandId: string;
  category: ProductCategory;
  description?: string;
  handleTypes?: BladeHandleType[];
  /** Manufacturer / source marks model discontinued (stock ≠ catalog). */
  discontinued?: boolean;
  sourceId: string;
  sourceUrl: string;
  scrapedAt?: string;
  attribution?: string;
  license?: string;
  /** Owned local paths already on disk */
  imageLocalPaths: string[];
  /** Optional public src prefixes for SPA (e.g. /catalog/abc.jpg) */
  publicImageSrcs?: string[];
};

/**
 * Builds a CatalogProduct with multiplicity of images and provenance (ADR-004, ADR-008, ADR-009).
 */
export function normalizeProduct(input: NormalizeProductInput): CatalogProduct {
  const scrapedAt = input.scrapedAt ?? new Date().toISOString();
  const imageLocalPaths = [...input.imageLocalPaths];

  const images =
    input.publicImageSrcs && input.publicImageSrcs.length > 0
      ? input.publicImageSrcs.map((src, index) => ({
          id: `${input.id}-img-${index + 1}`,
          src,
          alt: `${input.name} photo ${index + 1}`,
          isPrimary: index === 0,
        }))
      : imageLocalPaths.map((localPath, index) => ({
          id: `${input.id}-img-${index + 1}`,
          src: localPath,
          alt: `${input.name} photo ${index + 1}`,
          isPrimary: index === 0,
        }));

  return {
    id: input.id,
    slug: input.slug,
    name: input.name,
    brandId: input.brandId,
    category: input.category,
    description: input.description,
    handleTypes: input.handleTypes,
    ...(input.discontinued === true ? { discontinued: true } : {}),
    images,
    imageLocalPaths,
    provenance: {
      sourceId: input.sourceId,
      sourceUrl: input.sourceUrl,
      scrapedAt,
      attribution: input.attribution,
      license: input.license,
      mediaRights: 'unknown',
    },
  };
}
