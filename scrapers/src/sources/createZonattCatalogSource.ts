import * as cheerio from 'cheerio';
import type { BladeHandleType, ProductCategory } from '@ttsetupbuilder/types';
import {
  downloadImageToOwnedStorage,
  fetchHtml,
  RESEARCH_USER_AGENT,
} from '../pipeline/downloadImage.js';
import { normalizeProduct } from '../pipeline/normalizeProduct.js';
import type {
  ListingCandidate,
  LiveScrapeResult,
  ScrapeContext,
  SourceConfig,
  SourceModule,
} from './types.js';

const BASE = 'https://www.zonatt.com';
const SITEMAP_URL = `${BASE}/sitemap.php`;
const AJAX_URL = `${BASE}/ajax.php`;
const HANDLE_TYPES = new Set<BladeHandleType>(['FL', 'ST', 'AN', 'CS', 'PH']);

export type ZonattCatalogKind = {
  /** URL segment before the product slug, e.g. `maderas-de-tenis-de-mesa/madera`. */
  pathInfix: string;
  /** ZonaTT ajax category id (`Id=`). */
  categoryId: string;
  productCategory: ProductCategory;
  /** Strip leading label from PDP title (“Madera …”, “Goma …”). */
  nameStrip: RegExp;
  /** Parse FL/ST/… handles (blades only). */
  parseHandles: boolean;
};

export const ZONATT_MADERAS_KIND: ZonattCatalogKind = {
  pathInfix: 'maderas-de-tenis-de-mesa/madera',
  categoryId: '3',
  productCategory: 'blade',
  nameStrip: /^Madera\s+/i,
  parseHandles: true,
};

export const ZONATT_GOMAS_KIND: ZonattCatalogKind = {
  pathInfix: 'gomas-de-tenis-de-mesa/goma',
  categoryId: '1',
  productCategory: 'rubber',
  nameStrip: /^Goma\s+/i,
  parseHandles: false,
};

/** Blades omitted from sitemap (e.g. long-discontinued PDPs). */
export const ZONATT_MADERAS_EXTRA_URLS = [
  'https://www.zonatt.com/es/maderas-de-tenis-de-mesa/madera-butterfly-ai-fukuhara-pro-zlf',
] as const;

/** Priority rubber PDPs (also on sitemap — processed first so low `--limit` still gets them). */
export const ZONATT_GOMAS_EXTRA_URLS = [
  'https://www.zonatt.com/es/gomas-de-tenis-de-mesa/goma-dhs-hurricane-3-neo-provincial-blue-sponge-39',
  'https://www.zonatt.com/es/gomas-de-tenis-de-mesa/goma-drneubauer-killer-pro',
] as const;

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

function toFullImageUrl(url: string): string {
  return url.replace('/img/thumbs/zonatt/', '/img/zonatt/');
}

function parseHandleTypes(text: string): BladeHandleType[] {
  const found = [...text.toUpperCase().matchAll(/\b(FL|ST|AN|CS|PH|JP)\b/g)].map((match) => {
    const raw = match[1]!;
    return (raw === 'JP' ? 'PH' : raw) as BladeHandleType;
  });
  return [...new Set(found)].filter((value) => HANDLE_TYPES.has(value));
}

function inferBrandFromName(name: string, nameStrip: RegExp): string {
  const cleaned = name.replace(nameStrip, '').replace(/\s+/g, ' ').trim();
  const first = cleaned.split(/\s+/)[0] ?? 'Unknown';
  return slugify(first);
}

export function parseZonattSitemapUrls(xml: string, pathInfix: string): string[] {
  const escaped = pathInfix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`https://www\\.zonatt\\.com/es/${escaped}-[a-z0-9-]+`, 'gi');
  const urls = [...xml.matchAll(re)].map((m) => m[0]!.toLowerCase());
  return [...new Set(urls)];
}

export function parseZonattListingCards(
  html: string,
  options: { nameStrip: RegExp; parseHandles: boolean },
): ListingCard[] {
  const $ = cheerio.load(html);
  const cards: ListingCard[] = [];
  const seen = new Set<string>();

  // Listing page wraps cards in #tab-list; ajax `show-list` returns bare `div.producto`.
  $('div.producto').each((_, element) => {
    const item = $(element);
    const link = item.find('h3 a').first();
    const href = link.attr('href')?.trim();
    const name = (link.attr('title') ?? link.text()).replace(/\s+/g, ' ').trim();
    if (!href || !name) return;

    const url = absoluteUrl(href);
    if (seen.has(url)) return;
    seen.add(url);

    const brandText = item.find('a[href*="/marca/"]').first().text().replace(/\s+/g, ' ').trim();
    const brandId = brandText
      ? slugify(brandText)
      : inferBrandFromName(name, options.nameStrip);

    const thumb =
      item.find('.producto-foto img').attr('src') ??
      item.find('img').first().attr('src') ??
      undefined;

    const infoText = item.find('.info').text();
    const handleTypes = options.parseHandles ? parseHandleTypes(infoText) : [];

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

export function parseZonattAjaxListingPayload(
  raw: string,
  options: { nameStrip: RegExp; parseHandles: boolean },
): ListingCard[] {
  try {
    const parsed = JSON.parse(raw) as { html?: string };
    if (typeof parsed.html === 'string' && parsed.html.length > 0) {
      return parseZonattListingCards(parsed.html, options);
    }
  } catch {
    /* fall through */
  }
  return parseZonattListingCards(raw, options);
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

function parsePdpAsCard(
  url: string,
  html: string,
  options: { nameStrip: RegExp; parseHandles: boolean },
): ListingCard {
  const $ = cheerio.load(html);
  const name = (
    $('h1').first().text() ||
    $('meta[property="og:title"]').attr('content') ||
    url.split('/').pop() ||
    'Unknown'
  )
    .replace(/\s+/g, ' ')
    .trim();
  const brandText = $('h4 a[href*="/marca/"]').first().text().replace(/\s+/g, ' ').trim();
  const image = extractZonattPdpImage(html);
  return {
    url,
    name,
    brandId: brandText ? slugify(brandText) : inferBrandFromName(name, options.nameStrip),
    listingImageUrl: image,
    handleTypes: options.parseHandles ? extractZonattPdpHandles(html) : [],
  };
}

async function fetchZonattAjaxPage(
  offset: number,
  categoryId: string,
  listingUrl: string,
  rateLimitMs: number,
): Promise<string> {
  if (rateLimitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, rateLimitMs));
  }

  const body = new URLSearchParams({
    ac: 'show-list',
    Idioma: 'es',
    o: String(offset),
    Fl: '0',
    Mc: '0',
    Fac1: '0',
    Fac2: '0',
    Fac3: '0',
    Fac4: '0',
    Fac5: '0',
    Id: categoryId,
  });

  const response = await fetch(AJAX_URL, {
    method: 'POST',
    headers: {
      'User-Agent': RESEARCH_USER_AGENT,
      Accept: 'application/json, text/javascript, */*; q=0.01',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      Referer: listingUrl,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`ZonaTT ajax failed (${response.status}) offset=${offset}`);
  }

  return response.text();
}

async function collectListingHints(
  listingUrl: string,
  kind: ZonattCatalogKind,
  ctx: ScrapeContext,
  logPrefix: string,
): Promise<{ hints: Map<string, ListingCard>; pagesFetched: number }> {
  const hints = new Map<string, ListingCard>();
  let pagesFetched = 0;
  const cardOpts = { nameStrip: kind.nameStrip, parseHandles: kind.parseHandles };

  const mergeCards = (cards: ListingCard[]) => {
    for (const card of cards) {
      const key = card.url.toLowerCase();
      const prev = hints.get(key);
      if (!prev) {
        hints.set(key, card);
        continue;
      }
      hints.set(key, {
        ...prev,
        name: prev.name || card.name,
        brandId:
          prev.brandId && prev.brandId !== 'unknown' ? prev.brandId : card.brandId,
        listingImageUrl: prev.listingImageUrl ?? card.listingImageUrl,
        handleTypes: [...new Set([...prev.handleTypes, ...card.handleTypes])],
      });
    }
  };

  try {
    console.info(`[${logPrefix}] listing hints: ${listingUrl}`);
    const listingHtml = await fetchHtml(listingUrl, ctx.rateLimitMs);
    pagesFetched += 1;
    mergeCards(parseZonattListingCards(listingHtml, cardOpts));
  } catch (error) {
    console.warn(`[${logPrefix}] listing page failed:`, error);
  }

  let offset = 0;
  for (let i = 0; i < 80; i += 1) {
    try {
      const raw = await fetchZonattAjaxPage(
        offset,
        kind.categoryId,
        listingUrl,
        ctx.rateLimitMs,
      );
      pagesFetched += 1;
      const cards = parseZonattAjaxListingPayload(raw, cardOpts);
      if (cards.length === 0) break;
      mergeCards(cards);

      let nextOffset: number | null = null;
      try {
        const parsed = JSON.parse(raw) as { offset?: string | number };
        if (parsed.offset != null) nextOffset = Number(parsed.offset);
      } catch {
        /* ignore */
      }

      if (nextOffset == null || !Number.isFinite(nextOffset) || nextOffset <= offset) break;
      offset = nextOffset;
    } catch (error) {
      console.warn(`[${logPrefix}] ajax listing offset=${offset} failed:`, error);
      break;
    }
  }

  console.info(`[${logPrefix}] listing hints for ${hints.size} URLs`);
  return { hints, pagesFetched };
}

export type ZonattCatalogOptions = {
  config: SourceConfig;
  kind: ZonattCatalogKind;
  maxImagesPerProduct?: number;
  extraProductUrls?: readonly string[];
  sitemapUrl?: string;
};

/** ZonaTT catalog — sitemap inventory + PDP og:image (ADR-009). Stock ≠ catalog. */
export function createZonattCatalogSource(options: ZonattCatalogOptions): SourceModule {
  const {
    config,
    kind,
    maxImagesPerProduct = 2,
    extraProductUrls = [],
    sitemapUrl = SITEMAP_URL,
  } = options;
  const logPrefix = config.id;
  const cardOpts = { nameStrip: kind.nameStrip, parseHandles: kind.parseHandles };

  async function ingestCard(
    card: ListingCard,
    ctx: ScrapeContext,
    products: ReturnType<typeof normalizeProduct>[],
  ): Promise<number> {
    let imagesDownloaded = 0;
    console.info(`[${logPrefix}] PDP ${products.length + 1}/${ctx.limit}: ${card.name || card.url}`);

    let imageUrls: string[] = [];
    let handleTypes = card.handleTypes;

    try {
      const pdpHtml = await fetchHtml(card.url, ctx.rateLimitMs);
      const fromPdp = parsePdpAsCard(card.url, pdpHtml, cardOpts);
      card = {
        url: card.url,
        name: card.name || fromPdp.name,
        brandId: card.brandId && card.brandId !== 'unknown' ? card.brandId : fromPdp.brandId,
        listingImageUrl: card.listingImageUrl ?? fromPdp.listingImageUrl,
        handleTypes:
          card.handleTypes.length > 0
            ? [...new Set([...card.handleTypes, ...fromPdp.handleTypes])]
            : fromPdp.handleTypes,
      };

      const pdpImage = extractZonattPdpImage(pdpHtml);
      if (pdpImage) imageUrls.push(pdpImage);
      handleTypes = card.handleTypes;
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
    const displayName = card.name.replace(kind.nameStrip, '').trim() || card.name;

    products.push(
      normalizeProduct({
        id: `zonatt-${productSlug}`,
        slug: productSlug,
        name: displayName,
        brandId: card.brandId,
        category: kind.productCategory,
        handleTypes:
          kind.parseHandles && handleTypes.length > 0 ? handleTypes : undefined,
        description: `Imported from ZonaTT (${config.id}). Includes discontinued / unavailable retail stock when the PDP still exists. Source page: ${card.url}`,
        sourceId: config.id,
        sourceUrl: card.url,
        scrapedAt,
        attribution: 'ZonaTT (imported for TTSetupBuilder offline catalog)',
        license: 'unknown — review before redistribution',
        imageLocalPaths: localPaths,
        publicImageSrcs: publicSrcs,
      }),
    );

    return imagesDownloaded;
  }

  async function scrapeLive(ctx: ScrapeContext): Promise<LiveScrapeResult> {
    const products: ReturnType<typeof normalizeProduct>[] = [];
    let imagesDownloaded = 0;

    console.info(`[${logPrefix}] fetching sitemap inventory: ${sitemapUrl}`);
    const sitemapXml = await fetchHtml(sitemapUrl, ctx.rateLimitMs);
    const sitemapUrls = parseZonattSitemapUrls(sitemapXml, kind.pathInfix);
    console.info(
      `[${logPrefix}] sitemap: ${sitemapUrls.length} PDPs (incluye no disponibles / descatalogados)`,
    );

    const { hints, pagesFetched } = await collectListingHints(
      config.listingUrl,
      kind,
      ctx,
      logPrefix,
    );

    const orderedUrls: string[] = [];
    const seen = new Set<string>();

    // Priority extras first so `--limit` still captures operator-requested PDPs.
    for (const extraUrl of extraProductUrls) {
      const key = extraUrl.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      orderedUrls.push(extraUrl);
      if (!sitemapUrls.includes(key)) {
        console.info(`[${logPrefix}] extra PDP (not on sitemap): ${extraUrl}`);
      } else {
        console.info(`[${logPrefix}] priority PDP: ${extraUrl}`);
      }
    }
    for (const url of sitemapUrls) {
      const key = url.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      orderedUrls.push(url);
    }

    for (const url of orderedUrls) {
      if (products.length >= ctx.limit) break;
      const hint = hints.get(url.toLowerCase());
      const card: ListingCard = hint ?? {
        url,
        name: '',
        brandId: 'unknown',
        handleTypes: [],
      };
      imagesDownloaded += await ingestCard({ ...card, url }, ctx, products);
    }

    return { products, listingPagesFetched: pagesFetched + 1, imagesDownloaded };
  }

  return {
    config,
    async planListing(_ctx: ScrapeContext): Promise<ListingCandidate[]> {
      return [
        { url: sitemapUrl, titleHint: `ZonaTT sitemap (${kind.pathInfix}, incl. OOS)` },
        { url: config.listingUrl, titleHint: config.name },
        ...extraProductUrls.map((url) => ({
          url,
          titleHint: 'ZonaTT priority / extra PDP',
        })),
      ];
    },
    scrapeLive,
  };
}

/** @deprecated Prefer createZonattCatalogSource — kept for import stability. */
export function createZonattMaderasSource(options: {
  config: SourceConfig;
  maxImagesPerProduct?: number;
  extraProductUrls?: readonly string[];
}): SourceModule {
  return createZonattCatalogSource({
    ...options,
    kind: ZONATT_MADERAS_KIND,
    extraProductUrls: options.extraProductUrls ?? ZONATT_MADERAS_EXTRA_URLS,
  });
}
