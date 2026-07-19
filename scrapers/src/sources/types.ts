import type { CatalogProduct, ProductCategory } from '@ttsetupbuilder/types';

/** Role of a source in the ingestion registry (see docs/DATA_SOURCES.md). */
export type SourceRole =
  | 'catalog-photos-primary'
  | 'catalog-photos-secondary'
  | 'reviews'
  | 'specs-lab'
  | 'official-approval';

export type SourceConfig = {
  id: string;
  name: string;
  listingUrl: string;
  categories: ProductCategory[];
  role: SourceRole;
  /** Known CSS / HTML selectors — documentation for future parsers; unused in dry-run. */
  selectorNotes: string[];
  /** SPA hash routes or API unknown — operators must discover endpoints first. */
  requiresApiDiscovery?: boolean;
  /** Default polite delay between live requests (ms). */
  rateLimitMs: number;
  /** True when naive GET hits Cloudflare / bot walls (e.g. TT11). */
  cloudflareBlocked?: boolean;
};

export type ListingCandidate = {
  url: string;
  titleHint?: string;
};

export type ScrapeContext = {
  dryRun: boolean;
  fetchListing: boolean;
  downloadImages: boolean;
  /** Absolute path to scrapers package root */
  packageRoot: string;
  /** Where owned catalog images should land (apps/web/public/catalog by default) */
  imageOutputDir: string;
  rateLimitMs: number;
  /** Max products to ingest in a live run (politeness). */
  limit: number;
  /** Max listing pages to walk. */
  maxPages: number;
  /** Write apps/web/public/data/catalog.json when true. */
  publishCatalog: boolean;
};

export type LiveScrapeResult = {
  products: CatalogProduct[];
  listingPagesFetched: number;
  imagesDownloaded: number;
};

export type SourceModule = {
  config: SourceConfig;
  /**
   * Returns listing URLs for dry-run / planning.
   * Live HTML parsing is TODO per source — must not DDoS.
   */
  planListing: (ctx: ScrapeContext) => Promise<ListingCandidate[]>;
  /**
   * Optional live parser. Only invoked with --no-dry-run --fetch-listing.
   */
  scrapeLive?: (ctx: ScrapeContext) => Promise<LiveScrapeResult>;
};
