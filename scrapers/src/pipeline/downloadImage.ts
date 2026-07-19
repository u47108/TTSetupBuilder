import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

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
 * Downloads a remote image to owned disk using a content-hash filename.
 * Never use the remote URL as a runtime <img src> (ADR-008).
 */
export async function downloadImageToOwnedStorage(options: {
  url: string;
  outputDir: string;
  /** Public URL path prefix for the SPA, e.g. /catalog */
  publicPrefix?: string;
  rateLimitMs?: number;
}): Promise<DownloadImageResult> {
  const { url, outputDir, publicPrefix = '/catalog', rateLimitMs = 1500 } = options;

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

  const buffer = Buffer.from(await response.arrayBuffer());
  const contentHash = createHash('sha256').update(buffer).digest('hex');
  const ext =
    extensionFromContentType(response.headers.get('content-type')) ??
    extensionFromUrl(url) ??
    '.bin';
  const filename = `${contentHash.slice(0, 16)}${ext}`;

  await mkdir(outputDir, { recursive: true });
  const localPath = path.join(outputDir, filename);
  await writeFile(localPath, buffer);

  const publicSrc = `${publicPrefix.replace(/\/$/, '')}/${filename}`;

  return {
    localPath,
    publicSrc,
    contentHash,
    contentType: response.headers.get('content-type'),
    bytes: buffer.length,
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

function extensionFromContentType(contentType: string | null): string | undefined {
  if (!contentType) return undefined;
  const normalized = contentType.split(';')[0]?.trim().toLowerCase();
  switch (normalized) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    case 'image/avif':
      return '.avif';
    default:
      return undefined;
  }
}

function extensionFromUrl(url: string): string | undefined {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname).toLowerCase();
    if (ext && ext.length <= 5) return ext;
  } catch {
    /* ignore */
  }
  return undefined;
}
