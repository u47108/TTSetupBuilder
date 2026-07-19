import path from 'node:path';
import type { CatalogDocument } from '@ttsetupbuilder/types';
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
};

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
    const catalog: CatalogDocument = {
      version: 1,
      generatedAt: scrapedAt,
      products: live.products.map((product) => ({
        ...product,
        // Keep SPA-relative paths only — never absolute machine paths in published JSON
        imageLocalPaths: product.images.map((image) => image.src),
      })),
    };

    const outputPath = path.join(
      ctx.packageRoot,
      'data',
      'normalized',
      `${source.config.id}.json`,
    );
    await writeJsonFile(outputPath, catalog);

    let catalogPath: string | undefined;
    if (ctx.publishCatalog) {
      catalogPath = path.resolve(ctx.packageRoot, '../apps/web/public/data/catalog.json');
      await writeJsonFile(catalogPath, catalog);
      console.info(`[${sourceId}] published SPA catalog → ${catalogPath}`);
    }

    return {
      sourceId: source.config.id,
      mode: 'live',
      outputPath,
      candidateCount: live.products.length,
      productCount: live.products.length,
      imagesDownloaded: live.imagesDownloaded,
      catalogPath,
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
      `[${sourceId}] --download-images ignored without a live parser run. Try: dandoy-blades with --no-dry-run --fetch-listing --download-images --publish`,
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
