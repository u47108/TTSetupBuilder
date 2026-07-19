import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { CatalogDocument, CatalogProduct } from '@ttsetupbuilder/types';
import { getSourceModule } from '../sources/registry.js';
import type { ScrapeContext } from '../sources/types.js';
import { normalizeProduct } from './normalizeProduct.js';
import { writeJsonFile } from './writeJson.js';

export type RunSourceResult = {
  sourceId: string;
  mode: 'dry-run' | 'stub-plan' | 'live';
  outputPath: string;
  candidateCount: number;
  productCount: number;
  imagesDownloaded: number;
  catalogPath?: string;
  catalogTotalProducts?: number;
};

function toPublicProduct(product: CatalogProduct): CatalogProduct {
  return {
    ...product,
    imageLocalPaths: product.images.map((image) => image.src),
  };
}

/**
 * Replace all products from this sourceId, keep other sources (multi-source catalog).
 */
async function mergePublishCatalog(
  catalogPath: string,
  sourceId: string,
  incoming: CatalogProduct[],
  scrapedAt: string,
): Promise<CatalogDocument> {
  let existing: CatalogDocument = { version: 1, generatedAt: scrapedAt, products: [] };
  try {
    const raw = await readFile(catalogPath, 'utf8');
    existing = JSON.parse(raw) as CatalogDocument;
  } catch {
    /* first publish */
  }

  const kept = (existing.products ?? []).filter(
    (product) => product.provenance?.sourceId !== sourceId,
  );
  const merged: CatalogDocument = {
    version: 1,
    generatedAt: scrapedAt,
    products: [...kept, ...incoming.map(toPublicProduct)].sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  };
  await writeJsonFile(catalogPath, merged);
  return merged;
}

/**
 * Loads source config, plans listing URLs, optionally runs live scrape + image download.
 */
export async function runSource(sourceId: string, ctx: ScrapeContext): Promise<RunSourceResult> {
  const source = getSourceModule(sourceId);
  if (!source) {
    throw new Error(
      `Unknown source "${sourceId}". Run with --list to see registered ids (docs/DATA_SOURCES.md).`,
    );
  }

  if (source.config.cloudflareBlocked && ctx.fetchListing && !ctx.dryRun) {
    throw new Error(
      `Source "${sourceId}" is blocked by Cloudflare for automated fetches. Use an alternate source (e.g. dandoy-blades) or a manual export.`,
    );
  }

  const wantLive = !ctx.dryRun && ctx.fetchListing && typeof source.scrapeLive === 'function';

  if (wantLive && source.scrapeLive) {
    const live = await source.scrapeLive(ctx);
    const scrapedAt = new Date().toISOString();
    const publicProducts = live.products.map(toPublicProduct);
    const catalog: CatalogDocument = {
      version: 1,
      generatedAt: scrapedAt,
      products: publicProducts,
    };

    const outputPath = path.join(
      ctx.packageRoot,
      'data',
      'normalized',
      `${source.config.id}.json`,
    );
    await writeJsonFile(outputPath, catalog);

    let catalogPath: string | undefined;
    let catalogTotalProducts: number | undefined;
    if (ctx.publishCatalog) {
      catalogPath = path.resolve(ctx.packageRoot, '../apps/web/public/data/catalog.json');
      const merged = await mergePublishCatalog(
        catalogPath,
        source.config.id,
        publicProducts,
        scrapedAt,
      );
      catalogTotalProducts = merged.products.length;
      console.info(
        `[${sourceId}] merged SPA catalog → ${catalogPath} (source=${publicProducts.length}, total=${merged.products.length})`,
      );
    }

    return {
      sourceId: source.config.id,
      mode: 'live',
      outputPath,
      candidateCount: live.products.length,
      productCount: live.products.length,
      imagesDownloaded: live.imagesDownloaded,
      catalogPath,
      catalogTotalProducts,
    };
  }

  const candidates = await source.planListing(ctx);
  const scrapedAt = new Date().toISOString();
  const mode = ctx.dryRun || !ctx.fetchListing ? ('dry-run' as const) : ('stub-plan' as const);

  const sampleNormalizedCatalog: CatalogDocument = {
    version: 1,
    generatedAt: scrapedAt,
    products: candidates[0]
      ? [
          normalizeProduct({
            id: `${source.config.id}-placeholder`,
            slug: `${source.config.id}-placeholder`,
            name: `[stub] ${source.config.name}`,
            brandId: 'unknown',
            category: source.config.categories[0] ?? 'other',
            sourceId: source.config.id,
            sourceUrl: candidates[0].url,
            scrapedAt,
            attribution: source.config.name,
            imageLocalPaths: [],
            description:
              'Dry-run placeholder — replace with real normalized rows after ethical scrape + owned image download.',
          }),
        ]
      : [],
  };

  const dryRunDocument = {
    version: 1 as const,
    mode,
    sourceId: source.config.id,
    listingUrl: source.config.listingUrl,
    role: source.config.role,
    requiresApiDiscovery: source.config.requiresApiDiscovery ?? false,
    cloudflareBlocked: source.config.cloudflareBlocked ?? false,
    selectorNotes: source.config.selectorNotes,
    scrapedAt,
    ethicsReminder:
      'Operators must respect robots.txt and site ToS. No auth bypass. Prefer rate-limited dry-run.',
    candidates,
    sampleNormalizedCatalog,
    note: source.scrapeLive
      ? 'Live parser available: use --no-dry-run --fetch-listing --download-images --publish'
      : 'Full scrape not implemented for this source yet.',
  };

  const outName = `${source.config.id}.dry-run.json`;
  const outputPath = path.join(ctx.packageRoot, 'data', 'normalized', outName);
  await writeJsonFile(outputPath, dryRunDocument);

  if (ctx.downloadImages && !wantLive) {
    console.warn(
      `[${sourceId}] --download-images ignored without a live parser run.`,
    );
  }

  return {
    sourceId: source.config.id,
    mode,
    outputPath,
    candidateCount: candidates.length,
    productCount: 0,
    imagesDownloaded: 0,
  };
}
