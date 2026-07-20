import * as cheerio from 'cheerio';
import type { BladeHandleType } from '@ttsetupbuilder/types';
import { downloadImageToOwnedStorage, fetchHtml } from '../pipeline/downloadImage.js';
import { normalizeProduct } from '../pipeline/normalizeProduct.js';
import type {
  ListingCandidate,
  LiveScrapeResult,
  ScrapeContext,
  SourceConfig,
  SourceModule,
} from './types.js';

const BASE = 'https://www.zonatt.com';
const HANDLE_TYPES = new Set<BladeHandleType>(['FL', 'ST', 'AN', 'CS', 'PH']);

type ListingCard = {
  url: string;
  name: string;
  brandId: string;
  listingImageUrl?: string;
  handleTypes: BladeHandleType[];
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

function absoluteUrl(href: string): string {
  if (href.startsWith('http')) return href;
  return `${BASE}${href.startsWith('/') ? '' : '/'}${href}`;
}

/** Prefer full `/img/zonatt/…` over listing thumbs. */
function toFullImageUrl(url: string): string {
  return url.replace('/img/thumbs/zonatt/', '/img/zonatt/');
}

function parseHandleTypes(text: string): BladeHandleType[] {
  const found = [...text.toUpperCase().matchAll(/\b(FL|ST|AN|CS|PH|JP)\b/g)].map((match) => {
    const raw = match[1]!;
    // JP penhold ≈ PH in this catalog
    return (raw === 'JP' ? 'PH' : raw) as BladeHandleType;
  });
  return [...new Set(found)].filter((value) => HANDLE_TYPES.has(value));
}

function inferBrandFromName(name: string): string {
  const cleaned = name
    .replace(/^Madera\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  const first = cleaned.split(/\s+/)[0] ?? 'Unknown';
  return slugify(first);
}

export function parseZonattListingCards(html: string): ListingCard[] {
  const $ = cheerio.load(html);
  const cards: ListingCard[] = [];
  const seen = new Set<string>();

  $('#tab-list div.producto, .productos-populares-list div.producto').each((_, element) => {
    const item = $(element);
    const link = item.find('h3 a').first();
    const href = link.attr('href')?.trim();
    const name = (link.attr('title') ?? link.text()).replace(/\s+/g, ' ').trim();
    if (!href || !name) return;

    const url = absoluteUrl(href);
    if (seen.has(url)) return;
    seen.add(url);

    const brandText = item.find('a[href*="/marca/"]').first().text().replace(/\s+/g, ' ').trim();
    const brandId = brandText ? slugify(brandText) : inferBrandFromName(name);

    const thumb =
      item.find('.producto-foto img').attr('src') ??
      item.find('img').first().attr('src') ??
      undefined;

    const infoText = item.find('.info').text();
    const handleTypes = parseHandleTypes(infoText);

    cards.push({
      url,
      name,
      brandId,
      listingImageUrl: thumb ? toFullImageUrl(absoluteUrl(thumb)) : undefined,
      handleTypes,
    });
  });

  return cards;
}

export function extractZonattPdpImage(html: string): string | undefined {
  const $ = cheerio.load(html);
  const og = $('meta[property="og:image"]').attr('content')?.trim();
  if (og) return og;

  const zoom = $('img.zoom-foto').attr('src')?.trim();
  if (zoom) return absoluteUrl(zoom);

  const match = html.match(/https:\/\/www\.zonatt\.com\/img\/zonatt\/[^"'\\\s]+\.(?:png|jpe?g|webp)/i);
  return match?.[0];
}

export function extractZonattPdpHandles(html: string): BladeHandleType[] {
  const $ = cheerio.load(html);
  const fromLinks: BladeHandleType[] = [];
  $('a.abstract[data-type="Item_Faceta_4"], select[name="Item_Faceta_4"] option').each(
    (_, element) => {
      const text = $(element).text().replace(/\s+/g, ' ').trim().toUpperCase();
      fromLinks.push(...parseHandleTypes(text));
    },
  );
  if (fromLinks.length > 0) return [...new Set(fromLinks)];

  const mangoBlock = html.match(/Mango:[\s\S]{0,400}/i)?.[0] ?? '';
  return parseHandleTypes(mangoBlock);
}

export type ZonattOptions = {
  config: SourceConfig;
  maxImagesPerProduct?: number;
};

/** ZonaTT custom catalog — blades listing + PDP og:image (ADR-009). */
export function createZonattMaderasSource(options: ZonattOptions): SourceModule {
  const { config, maxImagesPerProduct = 2 } = options;
  const logPrefix = config.id;

  async function scrapeLive(ctx: ScrapeContext): Promise<LiveScrapeResult> {
    const products: ReturnType<typeof normalizeProduct>[] = [];
    let imagesDownloaded = 0;
    let listingPagesFetched = 0;
    const seenUrls = new Set<string>();

    // Category appears to ship all blades on one HTML page; still honor maxPages for future offsets.
    for (let page = 1; page <= ctx.maxPages; page += 1) {
      if (products.length >= ctx.limit) break;

      const listingUrl =
        page === 1 ? config.listingUrl : `${config.listingUrl}?Pg=${page}`;
      console.info(`[${logPrefix}] fetching listing page ${page}: ${listingUrl}`);
      const listingHtml = await fetchHtml(listingUrl, ctx.rateLimitMs);
      listingPagesFetched += 1;

      const cards = parseZonattListingCards(listingHtml);
      console.info(`[${logPrefix}] parsed ${cards.length} cards on page ${page}`);
      if (cards.length === 0) break;

      for (const card of cards) {
        if (products.length >= ctx.limit) break;
        if (seenUrls.has(card.url)) continue;
        seenUrls.add(card.url);

        console.info(`[${logPrefix}] PDP ${products.length + 1}/${ctx.limit}: ${card.name}`);

        let imageUrls: string[] = [];
        let handleTypes = card.handleTypes;

        try {
          const pdpHtml = await fetchHtml(card.url, ctx.rateLimitMs);
          const pdpImage = extractZonattPdpImage(pdpHtml);
          if (pdpImage) imageUrls.push(pdpImage);

          const pdpHandles = extractZonattPdpHandles(pdpHtml);
          if (pdpHandles.length > 0) {
            handleTypes = [...new Set([...handleTypes, ...pdpHandles])];
          }
        } catch (error) {
          console.warn(`[${logPrefix}] PDP failed for ${card.url}:`, error);
        }

        if (imageUrls.length === 0 && card.listingImageUrl) {
          imageUrls = [card.listingImageUrl];
        }
        imageUrls = imageUrls.slice(0, maxImagesPerProduct);

        if (handleTypes.length > 0) {
          console.info(`[${logPrefix}]   mango: ${handleTypes.join(', ')}`);
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
              });
              publicSrcs.push(downloaded.publicSrc);
              localPaths.push(downloaded.localPath);
              imagesDownloaded += 1;
            } catch (error) {
              console.warn(`[${logPrefix}] image skip ${imageUrl}:`, error);
            }
          }
        }

        const productSlug = slugify(card.name) || `zonatt-${String(products.length + 1)}`;
        const scrapedAt = new Date().toISOString();

        products.push(
          normalizeProduct({
            id: `zonatt-${productSlug}`,
            slug: productSlug,
            name: card.name.replace(/^Madera\s+/i, '').trim() || card.name,
            brandId: card.brandId,
            category: 'blade',
            handleTypes: handleTypes.length > 0 ? handleTypes : undefined,
            description: `Imported from ZonaTT (${config.id}). Source page: ${card.url}`,
            sourceId: config.id,
            sourceUrl: card.url,
            scrapedAt,
            attribution: 'ZonaTT (imported for TTSetupBuilder offline catalog)',
            license: 'unknown — review before redistribution',
            imageLocalPaths: localPaths,
            publicImageSrcs: publicSrcs,
          }),
        );
      }

      // Single-page category: stop after first successful parse
      if (page === 1 && cards.length > 0) break;
    }

    return { products, listingPagesFetched, imagesDownloaded };
  }

  return {
    config,
    async planListing(_ctx: ScrapeContext): Promise<ListingCandidate[]> {
      return [
        {
          url: config.listingUrl,
          titleHint: config.name,
        },
      ];
    },
    scrapeLive,
  };
}
