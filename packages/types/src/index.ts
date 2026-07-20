/**
 * Shared domain types for TTSetupBuilder.
 * Catalog products always carry multiple images (ADR-004) and owned paths only (ADR-008).
 */

/** Product category for table tennis equipment. */
export type ProductCategory =
  | 'blade'
  | 'rubber'
  | 'ball'
  | 'shoe'
  | 'apparel'
  | 'accessory'
  | 'other';

/** Owned media asset reference — never a third-party hotlink (ADR-008). */
export type ProductImage = {
  id: string;
  /** Path or URL within owned storage / repo assets */
  src: string;
  alt: string;
  width?: number;
  height?: number;
  isPrimary?: boolean;
};

/** Shakehand / penhold handle shapes (VP Sport “Tomada”, ZonaTT “Mango”, etc.). */
export type BladeHandleType = 'FL' | 'ST' | 'AN' | 'CS' | 'PH';

/**
 * Catalog product. Images are a collection (ADR-004), not a singleton URL.
 */
export type Product = {
  id: string;
  slug: string;
  name: string;
  brandId: string;
  category: ProductCategory;
  images: ProductImage[];
  description?: string;
  /**
   * Available blade handle types when known (e.g. FL flared, ST straight).
   * Only meaningful for `category: 'blade'`.
   */
  handleTypes?: BladeHandleType[];
};

export type Brand = {
  id: string;
  slug: string;
  name: string;
};

export type Player = {
  id: string;
  slug: string;
  displayName: string;
  countryCode?: string;
};

/** Aligns with DATA_MODEL media_rights vocabulary. */
export type MediaRights =
  | 'unknown'
  | 'owned'
  | 'licensed'
  | 'fair_use_claim'
  | 'manufacturer_press'
  | 'user_upload'
  | 'restricted';

/**
 * Ingestion provenance — required on scraped/normalized catalog rows (ADR-009).
 */
export type ProductProvenance = {
  /** Registry source id, e.g. `tt11-blades` */
  sourceId: string;
  /** Canonical page or listing URL this row came from */
  sourceUrl: string;
  /** ISO-8601 timestamp when scraped */
  scrapedAt: string;
  license?: string;
  attribution?: string;
  mediaRights?: MediaRights;
};

/**
 * Product as published for the SPA + Fuse.js index.
 * Extends Product with provenance and explicit local image paths.
 */
export type CatalogProduct = Product & {
  provenance: ProductProvenance;
  /** Repo-relative or public-path owned files written by scrapers */
  imageLocalPaths: string[];
};

/** Static catalog snapshot consumed by apps/web (ADR-010 / ADR-014). */
export type CatalogDocument = {
  version: 1;
  generatedAt: string;
  products: CatalogProduct[];
};
