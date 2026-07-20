import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { optimizeCatalogImage } from './optimizeImage.js';

/** Polite research User-Agent — operators must still obey robots.txt / ToS. */
export const RESEARCH_USER_AGENT =
  'Mozilla/5.0 (compatible; TTSetupBuilderResearchBot/0.1; +https://github.com/u47108/TTSetupBuilder)';

export type DownloadImageResult = {
  localPath: string;
  publicSrc: string;
  contentHash: string;
  contentType: string | null;
  bytes: number;
};

/**
 * Downloads a remote image, optimizes to catalog JPEG/WebP (max ~720px), stores by content-hash.
 * Never use the remote URL as a runtime <img src> (ADR-008).
 *
 * `allowKnockout` is required: pass `allowKnockoutForCategory(category)` so blades
 * never get studio alpha knockout (pale wood ≈ white plate → shredded edges).
 */
export async function downloadImageToOwnedStorage(options: {
  url: string;
  outputDir: string;
  /** Public URL path prefix for the SPA, e.g. /catalog */
  publicPrefix?: string;
  rateLimitMs?: number;
  /**
   * When false, skip studio knockout (JPEG only). Required — use
   * `allowKnockoutForCategory(category)` (blades → false).
   */
  allowKnockout: boolean;
}): Promise<DownloadImageResult> {
  const {
    url,
    outputDir,
    publicPrefix = '/catalog',
    rateLimitMs = 1500,
    allowKnockout,
  } = options;

  if (rateLimitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, rateLimitMs));
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent': RESEARCH_USER_AGENT,
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      Referer: new URL(url).origin + '/',
    },
  });

  if (!response.ok) {
    throw new Error(`Image download failed (${response.status}) for ${url}`);
  }

  const raw = Buffer.from(await response.arrayBuffer());
  const optimized = await optimizeCatalogImage(raw, { allowKnockout });

  if (
    !allowKnockout &&
    (optimized.knockedOutBackground || optimized.extension === '.webp')
  ) {
    throw new Error(
      `Invariant: allowKnockout=false must produce JPEG without knockout (got ${optimized.extension}, knocked=${optimized.knockedOutBackground}) for ${url}`,
    );
  }

  const contentHash = createHash('sha256').update(optimized.buffer).digest('hex');
  const filename = `${contentHash.slice(0, 16)}${optimized.extension}`;

  await mkdir(outputDir, { recursive: true });
  const localPath = path.join(outputDir, filename);
  await writeFile(localPath, optimized.buffer);

  const publicSrc = `${publicPrefix.replace(/\/$/, '')}/${filename}`;

  return {
    localPath,
    publicSrc,
    contentHash,
    contentType: optimized.contentType,
    bytes: optimized.buffer.length,
  };
}

export async function fetchHtml(url: string, rateLimitMs = 1500): Promise<string> {
  if (rateLimitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, rateLimitMs));
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent': RESEARCH_USER_AGENT,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!response.ok) {
    throw new Error(`HTML fetch failed (${response.status}) for ${url}`);
  }

  const text = await response.text();
  if (/just a moment|cf-challenge|cloudflare/i.test(text) && text.length < 20_000) {
    throw new Error(
      `Cloudflare / bot challenge intercepted ${url}. Use an alternate source or manual export.`,
    );
  }

  return text;
}
