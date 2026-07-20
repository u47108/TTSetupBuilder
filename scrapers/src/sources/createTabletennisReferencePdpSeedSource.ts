import * as cheerio from 'cheerio';
import type { BladeHandleType, ProductCategory } from '@ttsetupbuilder/types';
import { downloadImageToOwnedStorage, fetchHtml } from '../pipeline/downloadImage.js';
import { allowKnockoutForCategory } from '../pipeline/optimizeImage.js';
import { normalizeProduct } from '../pipeline/normalizeProduct.js';
import type {
  ListingCandidate,
  LiveScrapeResult,
  ScrapeContext,
  SourceConfig,
  SourceModule,
} from './types.js';

const DISCONTINUED_MARKER = /\s*\[Discontinued\]\s*/i;
const SCHEMA_DISCONTINUED = /schema\.org\/Discontinued/i;

function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function inferBrand(name: string): string {
  const first = name.replace(/\s+/g, ' ').trim().split(/\s+/)[0] ?? 'Unknown';
  return slugify(first);
}

function absoluteUrl(href: string, base: string): string {
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  return new URL(href, base).href;
}

/** Strip `[Discontinued]` from a title and report whether it was present. */
export function stripDiscontinuedMarker(raw: string): {
  name: string;
  discontinued: boolean;
} {
  const discontinued = DISCONTINUED_MARKER.test(raw);
  const name = raw.replace(DISCONTINUED_MARKER, ' ').replace(/\s+/g, ' ').trim();
  return { name, discontinued };
}

function readJsonLdBlocks(html: string): unknown[] {
  const $ = cheerio.load(html);
  const blocks: unknown[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).html()?.trim();
    if (!raw) return;
    try {
      blocks.push(JSON.parse(raw) as unknown);
    } catch {
      /* ignore malformed JSON-LD */
    }
  });
  return blocks;
}

function jsonLdAvailability(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  if (typeof record.availability === 'string') return record.availability;
  if (record.offers && typeof record.offers === 'object') {
    const offers = record.offers as Record<string, unknown>;
    if (typeof offers.availability === 'string') return offers.availability;
  }
  return undefined;
}

function jsonLdProductName(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  if (record['@type'] === 'Product' && typeof record.name === 'string') {
    return record.name.replace(/\s+/g, ' ').trim();
  }
  return undefined;
}

/** True when PDP marks the model discontinued (title marker or schema.org Offer). */
export function isTabletennisReferenceDiscontinued(html: string): boolean {
  const $ = cheerio.load(html);
  const h2 = $('h2').first().text();
  const title = $('title').first().text();
  if (DISCONTINUED_MARKER.test(h2) || DISCONTINUED_MARKER.test(title)) return true;

  for (const block of readJsonLdBlocks(html)) {
    const availability = jsonLdAvailability(block);
    if (availability && SCHEMA_DISCONTINUED.test(availability)) return true;
  }
  return SCHEMA_DISCONTINUED.test(html);
}

/**
 * Prefer product gallery shots under /images/rubber|racket/{id}_*_450.jpg
 * (avoid related thumbs *_100, logos, user avatars).
 */
export function extractTabletennisReferenceImage(
  html: string,
  pageUrl: string,
  kind: 'rubber' | 'racket',
): string | undefined {
  const $ = cheerio.load(html);
  const pathHint = kind === 'rubber' ? '/images/rubber/' : '/images/racket/';

  const candidates: string[] = [];
  $(`img[src*="${pathHint}"]`).each((_, el) => {
    const src = $(el).attr('src')?.trim();
    if (src) candidates.push(absoluteUrl(src, pageUrl));
  });

  const preferred =
    candidates.find((u) => /_450\.(jpe?g|png|webp)(\?|$)/i.test(u)) ??
    candidates.find((u) => !/_100\.(jpe?g|png|webp)(\?|$)/i.test(u)) ??
    candidates[0];

  if (preferred) return preferred;

  const og = $('meta[property="og:image"]').attr('content')?.trim();
  return og ? absoluteUrl(og, pageUrl) : undefined;
}

export function extractTabletennisReferenceName(html: string, fallbackUrl: string): string {
  const $ = cheerio.load(html);

  // Product title is an h2 on this site; h1 is the site banner ("NO.1 …").
  const h2 = $('h2').first().text().replace(/\s+/g, ' ').trim();
  if (h2 && !/^NO\.?\s*1\b/i.test(h2)) {
    return stripDiscontinuedMarker(h2).name;
  }

  for (const block of readJsonLdBlocks(html)) {
    const productName = jsonLdProductName(block);
    if (productName) return stripDiscontinuedMarker(productName).name;
  }

  const og = $('meta[property="og:title"]').attr('content')?.replace(/\s+/g, ' ').trim();
  if (og) {
    return stripDiscontinuedMarker(
      og
        .replace(/\s*Reviews?\s*$/i, '')
        .replace(/\s*[-|].*$/, '')
        .trim(),
    ).name;
  }

  const h1 = $('h1').first().text().replace(/\s+/g, ' ').trim();
  if (h1 && !/^NO\.?\s*1\b/i.test(h1)) {
    return stripDiscontinuedMarker(h1).name;
  }

  const title = $('title').first().text().replace(/\s+/g, ' ').trim();
  if (title) {
    return stripDiscontinuedMarker(
      title
        .replace(/\s*[-|].*$/, '')
        .replace(/\s*Reviews?\s*$/i, '')
        .trim(),
    ).name;
  }
  return fallbackUrl.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') ?? 'Unknown';
}

export type TabletennisReferencePdpSeed = {
  url: string;
  /** Canonical catalog name when the site title is wrong/noisy (e.g. Bruce→Blues). */
  nameHint?: string;
  category?: ProductCategory;
  /**
   * Force discontinued flag. When omitted, inferred from PDP `[Discontinued]`
   * (even if `nameHint` replaces the noisy title).
   */
  discontinued?: boolean;
  handleTypes?: BladeHandleType[];
};

export type TabletennisReferencePdpSeedOptions = {
  config: SourceConfig;
  /** Extra listing/home URLs for dry-run plans (full crawl stays TODO). */
  planUrls?: readonly ListingCandidate[];
  seeds: readonly TabletennisReferencePdpSeed[];
  kind: 'rubber' | 'racket';
  idPrefix?: string;
  attribution?: string;
};

/**
 * Minimal Tabletennis Reference PDP seeds — live image fetch for explicit URLs only.
 * Multi-page listing crawl is intentionally not implemented (selector notes / dry-run plan).
 */
export function createTabletennisReferencePdpSeedSource(
  options: TabletennisReferencePdpSeedOptions,
): SourceModule {
  const {
    config,
    seeds,
    kind,
    planUrls = [],
    idPrefix = config.id,
    attribution = `${config.name} (imported for TTSetupBuilder offline catalog)`,
  } = options;
  const logPrefix = config.id;

  async function scrapeLive(ctx: ScrapeContext): Promise<LiveScrapeResult> {
    const products: ReturnType<typeof normalizeProduct>[] = [];
    let imagesDownloaded = 0;

    for (const seed of seeds) {
      if (products.length >= ctx.limit) break;

      console.info(`[${logPrefix}] PDP ${products.length + 1}/${ctx.limit}: ${seed.url}`);
      let name = seed.nameHint ?? '';
      let imageUrl: string | undefined;
      const category: ProductCategory =
        seed.category ?? config.categories[0] ?? (kind === 'rubber' ? 'rubber' : 'blade');

      let discontinuedFromPage = false;
      try {
        const html = await fetchHtml(seed.url, ctx.rateLimitMs);
        discontinuedFromPage = isTabletennisReferenceDiscontinued(html);
        name = seed.nameHint
          ? stripDiscontinuedMarker(seed.nameHint).name
          : extractTabletennisReferenceName(html, seed.url);
        imageUrl = extractTabletennisReferenceImage(html, seed.url, kind);
      } catch (error) {
        console.warn(`[${logPrefix}] PDP failed for ${seed.url}:`, error);
        if (!name) continue;
        if (seed.nameHint) {
          name = stripDiscontinuedMarker(seed.nameHint).name;
        }
      }

      const discontinued =
        seed.discontinued === true ||
        (seed.discontinued !== false && discontinuedFromPage);

      const publicSrcs: string[] = [];
      const localPaths: string[] = [];

      if (ctx.downloadImages && imageUrl) {
        try {
          const downloaded = await downloadImageToOwnedStorage({
            url: imageUrl,
            outputDir: ctx.imageOutputDir,
            publicPrefix: '/catalog',
            rateLimitMs: ctx.rateLimitMs,
            allowKnockout: allowKnockoutForCategory(category),
          });
          publicSrcs.push(downloaded.publicSrc);
          localPaths.push(downloaded.localPath);
          imagesDownloaded += 1;
        } catch (error) {
          console.warn(`[${logPrefix}] image skip ${imageUrl}:`, error);
        }
      }

      const productSlug = slugify(name) || `seed-${products.length + 1}`;
      products.push(
        normalizeProduct({
          id: `${idPrefix}-${productSlug}`,
          slug: productSlug,
          name,
          brandId: inferBrand(name),
          category,
          handleTypes: seed.handleTypes,
          discontinued: discontinued || undefined,
          description: `Imported from ${config.name} (${config.id}). Source page: ${seed.url}`,
          sourceId: config.id,
          sourceUrl: seed.url,
          scrapedAt: new Date().toISOString(),
          attribution,
          license: 'unknown — review before redistribution',
          imageLocalPaths: localPaths,
          publicImageSrcs: publicSrcs,
        }),
      );
    }

    return { products, listingPagesFetched: 0, imagesDownloaded };
  }

  return {
    config,
    async planListing(ctx: ScrapeContext): Promise<ListingCandidate[]> {
      if (ctx.fetchListing && !ctx.dryRun) {
        console.info(
          `[${logPrefix}] live mode: explicit PDP seeds only (no multi-page listing crawl).`,
        );
      } else {
        console.info(
          `[${logPrefix}] plan only (dry-run or stub) — listing URLs + seed PDPs; full crawl TODO.`,
        );
      }

      const planned: ListingCandidate[] = [
        { url: config.listingUrl, titleHint: `${config.name} listing` },
        ...planUrls,
        ...seeds.map((seed) => ({
          url: seed.url,
          titleHint: seed.nameHint ?? `${config.name} PDP seed`,
        })),
      ];

      const seen = new Set<string>();
      return planned.filter((c) => {
        if (seen.has(c.url)) return false;
        seen.add(c.url);
        return true;
      });
    },
    scrapeLive,
  };
}
