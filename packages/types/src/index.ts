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
