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

const BASE = 'https://www.vpsport.cl';
const HANDLE_TYPES = new Set<BladeHandleType>(['FL', 'ST', 'AN', 'CS', 'PH']);

type ListingCard = {
  url: string;
  name: string;
  listingImageUrl?: string;
};

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

function inferBrand(name: string): { brandId: string } {
  const cleaned = name
    .replace(/^Goma\s+/i, '')
    .replace(/^Madero\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  const first = cleaned.split(/\s+/)[0] ?? 'Unknown';
  return { brandId: slugify(first) };
}

function absoluteUrl(href: string): string {
  if (href.startsWith('http')) return href;
  return `${BASE}${href.startsWith('/') ? '' : '/'}${href}`;
}

function toCatalogMaster(url: string): string {
  const match = /^(https:\/\/cdnx\.jumpseller\.com\/vpsport-spa\/image\/\d+)/.exec(url);
  if (match) {
    // Prefer full master (often PNG) over /thumb/720/720 — same cutout, more pixels.
    return match[1]!;
  }
  return url;
}

function parseListingCards(html: string): ListingCard[] {
  const $ = cheerio.load(html);
  const cards: ListingCard[] = [];
  const seen = new Set<string>();

  $('button.product-block__quick-view[data-product-url]').each((_, element) => {
    const button = $(element);
    const href = button.attr('data-product-url')?.trim();
    const name = button.attr('data-product-name')?.replace(/\s+/g, ' ').trim();
    if (!href || !name) return;

    const url = absoluteUrl(href);
    if (seen.has(url)) return;
    seen.add(url);

    const article = button.closest('article.product-block');
    const srcset =
      article.find('source[srcset]').first().attr('srcset') ??
      article.find('img').first().attr('src') ??
      undefined;
    const firstSrc = srcset?.split(/\s+/)[0];

    cards.push({
      url,
      name,
      listingImageUrl: firstSrc ? toCatalogMaster(firstSrc) : undefined,
    });
  });

  return cards;
}

export function extractPdpImageUrls(html: string, max: number): string[] {
  const ids = [
    ...html.matchAll(/cdnx\.jumpseller\.com\/vpsport-spa\/image\/(\d+)/g),
  ].map((match) => match[1]!);

  const unique = [...new Set(ids)];
  return unique
    .slice(0, max)
    .map((id) => `https://cdnx.jumpseller.com/vpsport-spa/image/${id}`);
}

/**
 * VP Sport “Tomada” option — classic blades usually FL (flared) and ST (straight).
 */
export function extractHandleTypes(html: string): BladeHandleType[] {
  const tomadaBlock = html.match(
    /"name"\s*:\s*"Tomada"[\s\S]*?"values"\s*:\s*\[([\s\S]*?)\]/,
  );
  const haystack = tomadaBlock?.[1] ?? html;
  const found = [...haystack.matchAll(/"name"\s*:\s*"(FL|ST|AN|CS|PH)"/g)].map(
    (match) => match[1] as BladeHandleType,
  );
  return [...new Set(found)].filter((value) => HANDLE_TYPES.has(value));
}

export type VpsportOptions = {
  config: SourceConfig;
  category: ProductCategory;
  maxImagesPerProduct?: number;
};

export function createVpsportJumpsellerSource(options: VpsportOptions): SourceModule {
  const { config, category, maxImagesPerProduct = 2 } = options;
  const logPrefix = config.id;

  async function scrapeLive(ctx: ScrapeContext): Promise<LiveScrapeResult> {
    const products: ReturnType<typeof normalizeProduct>[] = [];
    let imagesDownloaded = 0;
    let listingPagesFetched = 0;
    const seenUrls = new Set<string>();

    for (let page = 1; page <= ctx.maxPages; page += 1) {
      if (products.length >= ctx.limit) break;

      const listingUrl =
        page === 1 ? config.listingUrl : `${config.listingUrl}?page=${page}`;
      console.info(`[${logPrefix}] fetching listing page ${page}: ${listingUrl}`);
      const listingHtml = await fetchHtml(listingUrl, ctx.rateLimitMs);
      listingPagesFetched += 1;

      const cards = parseListingCards(listingHtml);
      console.info(`[${logPrefix}] parsed ${cards.length} cards on page ${page}`);
      if (cards.length === 0) break;

      for (const card of cards) {
        if (products.length >= ctx.limit) break;
        if (seenUrls.has(card.url)) continue;
        seenUrls.add(card.url);

        console.info(`[${logPrefix}] PDP ${products.length + 1}/${ctx.limit}: ${card.name}`);

        let imageUrls: string[] = [];
        let handleTypes: BladeHandleType[] | undefined;
        try {
          const pdpHtml = await fetchHtml(card.url, ctx.rateLimitMs);
          imageUrls = extractPdpImageUrls(pdpHtml, maxImagesPerProduct);
          if (category === 'blade') {
            const handles = extractHandleTypes(pdpHtml);
            handleTypes = handles.length > 0 ? handles : undefined;
            if (handleTypes) {
              console.info(`[${logPrefix}]   tomada: ${handleTypes.join(', ')}`);
            }
          }
        } catch (error) {
          console.warn(`[${logPrefix}] PDP failed for ${card.url}:`, error);
        }

        if (imageUrls.length === 0 && card.listingImageUrl) {
          imageUrls = [card.listingImageUrl];
        }

        const publicSrcs: string[] = [];
        const localPaths: string[] = [];

        if (ctx.downloadImages) {
          for (const imageUrl of imageUrls) {
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
        }

        const { brandId } = inferBrand(card.name);
        const productSlug: string =
          slugify(card.name) || `vpsport-${String(products.length + 1)}`;
        const scrapedAt = new Date().toISOString();

        products.push(
          normalizeProduct({
            id: `vpsport-${productSlug}`,
            slug: productSlug,
            name: card.name,
            brandId,
            category,
            handleTypes,
            description: `Imported from VP Sport (${config.id}). Source page: ${card.url}`,
            sourceId: config.id,
            sourceUrl: card.url,
            scrapedAt,
            attribution: 'VP Sport (imported for TTSetupBuilder offline catalog)',
            license: 'unknown — review before redistribution',
            imageLocalPaths: localPaths,
            publicImageSrcs: publicSrcs,
          }),
        );
      }
    }

    return { products, listingPagesFetched, imagesDownloaded };
  }

  return {
    config,
    async planListing(_ctx: ScrapeContext): Promise<ListingCandidate[]> {
      return [1, 2, 3].map((page) => ({
        url: page === 1 ? config.listingUrl : `${config.listingUrl}?page=${page}`,
        titleHint: `${config.name} page ${page}`,
      }));
    },
    scrapeLive,
  };
}
