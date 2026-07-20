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
 * ITTF racket-covering approval fact (batch annotation only — never live API in SPA).
 * See scrapers `ittf-cli` and docs/DATA_SOURCES.md.
 */
export type IttfApprovalStatus =
  | 'approved'
  | 'not_found'
  | 'not_approved'
  | 'expired'
  | 'inactive';

/**
 * Multi-dimensional ITTF racket-covering listing facts (batch annotation).
 * Players often change sponge — surface listed colors / OX / expiry so they
 * can verify the covering *as listed*, not only the model name.
 */
export type IttfApprovalInfo = {
  status: IttfApprovalStatus;
  /** Stable ITTF equipment code when present (e.g. `03-041` / `21-043`). */
  equipmentCode?: string;
  /** Best-matched ITTF EquipmentName when fuzzy/exact brand+name hit. */
  matchedName?: string;
  matchedBrand?: string;
  /** How the catalog row was linked to the ITTF snapshot. */
  matchMethod?: 'equipmentCode' | 'brandNameExact' | 'brandNameFuzzy' | 'none';
  /** ISO date of the snapshot used for annotation. */
  snapshotDate?: string;
  checkedAt?: string;
  /** Short machine-readable reason for non-approved states. */
  reason?: string;
  /** Raw ITTF ApprovalStatus when a snapshot row matched. */
  approvalStatus?: boolean | null;
  /** Raw ITTF IsActive when a snapshot row matched. */
  isActive?: boolean | null;
  /** ITTF ExpiresOn (ISO datetime string from snapshot). */
  expiresOn?: string | null;
  /**
   * Top-sheet colors derived from ColorsList (typically Red / Black).
   * Remaining ColorsList entries are treated as sponge colors — the ITTF
   * list API does not split the two dimensions explicitly.
   */
  topSheetColors?: string[];
  /** Sponge colors derived from ColorsList (non top-sheet entries). */
  spongeColors?: string[];
  /** Full ColorsList tokens when present. */
  colors?: string[];
  /**
   * Whether an OX (sponge-less) version is listed.
   * Mapped from HasOXVersion (`1`/`Yes` → true, `0`/`No` → false).
   */
  oxVersion?: boolean | null;
  /** ITTF PimpleType when present (In / Out / Long / …). */
  pimpleType?: string | null;
};

/**
 * Product as published for the SPA + Fuse.js index.
 * Extends Product with provenance and explicit local image paths.
 */
export type CatalogProduct = Product & {
  provenance: ProductProvenance;
  /** Repo-relative or public-path owned files written by scrapers */
  imageLocalPaths: string[];
  /**
   * Official ITTF approval annotation for rubbers/pips (batch only).
   * Absent on blades / non-rubber categories until a matching pipeline exists.
   */
  ittfApproval?: IttfApprovalInfo;
  /**
   * Manufacturer / community source marks the model as discontinued.
   * Stock ≠ catalog (ADR-001 / DATA_SOURCES): still shown in the visual DB.
   * Parsed from titles like `[Discontinued]` (e.g. Tabletennis Reference).
   */
  discontinued?: boolean;
};

/** Static catalog snapshot consumed by apps/web (ADR-010 / ADR-014). */
export type CatalogDocument = {
  version: 1;
  generatedAt: string;
  products: CatalogProduct[];
};
