import * as cheerio from 'cheerio';
import type { ProductCategory } from '@ttsetupbuilder/types';
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

function extractWooImage(html: string): string | undefined {
  const $ = cheerio.load(html);
  const og = $('meta[property="og:image"]').attr('content')?.trim();
  if (og) return og;

  const gallery = $('img.wp-post-image, .woocommerce-product-gallery__image img')
    .first()
    .attr('data-large_image')
    ?.trim();
  if (gallery) return gallery;

  const src =
    $('img.wp-post-image, .woocommerce-product-gallery__image img').first().attr('src')?.trim() ??
    $('img.wp-post-image').first().attr('data-src')?.trim();
  return src || undefined;
}

function extractWooName(html: string, fallbackUrl: string): string {
  const $ = cheerio.load(html);
  const fromH1 = $('h1.product_title, h1.entry-title, h1').first().text().replace(/\s+/g, ' ').trim();
  if (fromH1) return fromH1;
  const og = $('meta[property="og:title"]').attr('content')?.trim();
  if (og) return og.replace(/\s*[-|].*$/, '').trim();
  return fallbackUrl.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') ?? 'Unknown';
}

export type WooPdpSeed = {
  url: string;
  /** Override display name when og/h1 is noisy. */
  nameHint?: string;
  category?: ProductCategory;
};

export type WooPdpSeedOptions = {
  config: SourceConfig;
  seeds: readonly WooPdpSeed[];
  idPrefix?: string;
  attribution?: string;
};

/**
 * One-off WooCommerce (or og:image) PDP seeds — for shops without a full category crawler yet.
 */
export function createWooPdpSeedSource(options: WooPdpSeedOptions): SourceModule {
  const {
    config,
    seeds,
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
      const category = seed.category ?? config.categories[0] ?? 'rubber';

      try {
        const html = await fetchHtml(seed.url, ctx.rateLimitMs);
        name = seed.nameHint || extractWooName(html, seed.url);
        imageUrl = extractWooImage(html);
      } catch (error) {
        console.warn(`[${logPrefix}] PDP failed for ${seed.url}:`, error);
        if (!name) continue;
      }

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
    async planListing(): Promise<ListingCandidate[]> {
      return seeds.map((seed) => ({
        url: seed.url,
        titleHint: seed.nameHint ?? config.name,
      }));
    },
    scrapeLive,
  };
}
