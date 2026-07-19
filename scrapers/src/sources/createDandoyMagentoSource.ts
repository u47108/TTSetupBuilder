import * as cheerio from 'cheerio';
import type { ProductCategory } from '@ttsetupbuilder/types';
import { downloadImageToOwnedStorage, fetchHtml } from '../pipeline/downloadImage.js';
import { normalizeProduct } from '../pipeline/normalizeProduct.js';
import type {
  ListingCandidate,
  LiveScrapeResult,
  ScrapeContext,
  SourceConfig,
  SourceModule,
} from './types.js';

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

function inferBrand(name: string): { brandId: string; brandName: string } {
  const cleaned = name.replace(/\s+/g, ' ').trim();
  const byMatch = /^(.+?)\s+By\s+(.+)$/i.exec(cleaned);
  if (byMatch) {
    const brandName = byMatch[2]!.trim().split(/\s+/)[0] ?? 'Unknown';
    return { brandId: slugify(brandName), brandName };
  }
  const first = cleaned.split(/\s+/)[0] ?? 'Unknown';
  return { brandId: slugify(first), brandName: first };
}

function parseListingCards(html: string): ListingCard[] {
  const $ = cheerio.load(html);
  const cards: ListingCard[] = [];

  $('li.product-item').each((_, element) => {
    const item = $(element);
    const link = item.find('a.product-item-link').first();
    const href = link.attr('href')?.trim();
    const name = link.text().replace(/\s+/g, ' ').trim();
    if (!href || !name) return;

    const img =
      item.find('img.product-image-photo').attr('src') ??
      item.find('img.product-image-photo').attr('data-src') ??
      undefined;

    cards.push({
      url: href,
      name,
      listingImageUrl: img,
    });
  });

  return cards;
}

function extractGalleryFullUrls(html: string): string[] {
  const fulls = [
    ...html.matchAll(
      /"full":"(https:\\\/\\\/www\.dandoy-sports\.com\\\/media\\\/catalog\\\/product\\\/[^"]+)"/g,
    ),
  ].map((match) => match[1]!.replace(/\\\//g, '/'));

  const unique = [...new Set(fulls)];
  if (unique.length > 0) return unique;

  const loose = [
    ...html.matchAll(
      /https:\/\/www\.dandoy-sports\.com\/media\/catalog\/product\/[^"'\\\s]+\.(?:jpg|jpeg|png|webp)/gi,
    ),
  ].map((match) => match[0]!);

  return [...new Set(loose)];
}

export type DandoyMagentoOptions = {
  config: SourceConfig;
  category: ProductCategory;
  /** Prefix for product ids, e.g. dandoy-blade / dandoy-rubber */
  idPrefix: string;
  maxImagesPerProduct?: number;
};

/**
 * Shared Magento listing + PDP gallery scraper for Dandoy Sports.
 */
export function createDandoyMagentoSource(options: DandoyMagentoOptions): SourceModule {
  const { config, category, idPrefix, maxImagesPerProduct = 3 } = options;
  const logPrefix = config.id;

  async function scrapeLive(ctx: ScrapeContext): Promise<LiveScrapeResult> {
    const products: ReturnType<typeof normalizeProduct>[] = [];
    let imagesDownloaded = 0;
    let listingPagesFetched = 0;
    const seenUrls = new Set<string>();

    for (let page = 1; page <= ctx.maxPages; page += 1) {
      if (products.length >= ctx.limit) break;

      const listingUrl =
        page === 1 ? config.listingUrl : `${config.listingUrl}?p=${page}`;
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
        let galleryUrls: string[] = [];
        try {
          const pdpHtml = await fetchHtml(card.url, ctx.rateLimitMs);
          galleryUrls = extractGalleryFullUrls(pdpHtml);
        } catch (error) {
          console.warn(`[${logPrefix}] PDP failed for ${card.url}:`, error);
        }

        if (galleryUrls.length === 0 && card.listingImageUrl) {
          galleryUrls = [card.listingImageUrl];
        }

        const imageUrls = galleryUrls.slice(0, maxImagesPerProduct);
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
          slugify(card.name) || `${idPrefix}-${String(products.length + 1)}`;
        const scrapedAt = new Date().toISOString();

        products.push(
          normalizeProduct({
            id: `${idPrefix}-${productSlug}`,
            slug: productSlug,
            name: card.name,
            brandId,
            category,
            description: `Imported from Dandoy Sports (${category}). Source page: ${card.url}`,
            sourceId: config.id,
            sourceUrl: card.url,
            scrapedAt,
            attribution: 'Dandoy Sports (imported for TTSetupBuilder offline catalog)',
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
      return [
        { url: config.listingUrl, titleHint: `${config.name} page 1` },
        { url: `${config.listingUrl}?p=2`, titleHint: `${config.name} page 2` },
        { url: `${config.listingUrl}?p=3`, titleHint: `${config.name} page 3` },
        { url: `${config.listingUrl}?p=4`, titleHint: `${config.name} page 4` },
        { url: `${config.listingUrl}?p=5`, titleHint: `${config.name} page 5` },
      ];
    },
    scrapeLive,
  };
}
