/**
 * Re-download blade photos as JPEG ≤720 without studio knockout.
 * Damaged WebP alphas cannot be recovered — pale wood was eaten by flood-fill.
 *
 * Usage:
 *   pnpm repair-blade-images
 *   pnpm repair-blade-images -- --id=dandoy-blade-andro-eloi-legacy-offs
 *   pnpm repair-blade-images -- --limit=20
 *   pnpm repair-blade-images -- --force
 */
import { unlink, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CatalogProduct } from '@ttsetupbuilder/types';
import { downloadImageToOwnedStorage, fetchHtml } from './pipeline/downloadImage.js';
import { allowKnockoutForCategory } from './pipeline/optimizeImage.js';
import { extractGalleryUrls } from './sources/createDandoyMagentoSource.js';
import { extractPdpImageUrls } from './sources/createVpsportJumpsellerSource.js';
import { extractZonattPdpImage } from './sources/createZonattCatalogSource.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalogDir = path.resolve(__dirname, '../../apps/web/public/catalog');
const catalogJsonPath = path.resolve(
  __dirname,
  '../../apps/web/public/data/catalog.json',
);
const normalizedDir = path.resolve(__dirname, '../data/normalized');

type CatalogFile = {
  version: number;
  generatedAt: string;
  products: CatalogProduct[];
};

function parseArgs(argv: string[]): {
  id?: string;
  limit?: number;
  rateMs: number;
  force: boolean;
} {
  let id: string | undefined;
  let limit: number | undefined;
  let rateMs = 700;
  let force = false;
  for (const arg of argv) {
    if (arg.startsWith('--id=')) id = arg.slice('--id='.length);
    else if (arg.startsWith('--limit=')) limit = Number(arg.slice('--limit='.length));
    else if (arg.startsWith('--rate-ms=')) rateMs = Number(arg.slice('--rate-ms='.length));
    else if (arg === '--force') force = true;
  }
  return { id, limit, rateMs, force };
}

function extractRemoteUrls(sourceId: string | undefined, html: string, max: number): string[] {
  if (!sourceId) return [];
  if (sourceId.startsWith('dandoy')) {
    return extractGalleryUrls(html).slice(0, max);
  }
  if (sourceId.startsWith('vpsport')) {
    return extractPdpImageUrls(html, max);
  }
  if (sourceId.startsWith('zonatt')) {
    const og = extractZonattPdpImage(html);
    return og ? [og] : [];
  }
  const og = html.match(
    /property=["']og:image["']\s+content=["']([^"']+)["']/i,
  )?.[1];
  if (og) return [og];
  return [];
}

function needsRepair(product: CatalogProduct, force: boolean): boolean {
  if (force) return true;
  return (product.images ?? []).some((image) => image.src.endsWith('.webp'));
}

async function persistCatalog(
  catalog: CatalogFile,
  touchedSourceIds: Set<string>,
): Promise<void> {
  catalog.generatedAt = new Date().toISOString();
  await writeFile(catalogJsonPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');

  for (const sourceId of touchedSourceIds) {
    const mirrorPath = path.join(normalizedDir, `${sourceId}.json`);
    try {
      const raw = await readFile(mirrorPath, 'utf8');
      const mirror = JSON.parse(raw) as CatalogFile;
      const repaired = new Map(
        catalog.products
          .filter((p) => p.provenance?.sourceId === sourceId)
          .map((p) => [p.id, p]),
      );
      mirror.products = mirror.products.map((p) => {
        const fromCatalog = repaired.get(p.id);
        if (!fromCatalog) return p;
        // Image repair only touches catalog rows; keep ingest flags from mirror when stale.
        return fromCatalog.discontinued === true
          ? fromCatalog
          : p.discontinued === true
            ? { ...fromCatalog, discontinued: true }
            : fromCatalog;
      });
      mirror.generatedAt = catalog.generatedAt;
      await writeFile(mirrorPath, `${JSON.stringify(mirror, null, 2)}\n`, 'utf8');
    } catch {
      // mirror may not exist
    }
  }
}

async function main(): Promise<void> {
  const { id, limit, rateMs, force } = parseArgs(process.argv.slice(2));
  const catalog = JSON.parse(await readFile(catalogJsonPath, 'utf8')) as CatalogFile;

  let blades = catalog.products.filter(
    (p) => p.category === 'blade' && needsRepair(p, force),
  );
  if (id) blades = blades.filter((p) => p.id === id);
  if (limit !== undefined && Number.isFinite(limit)) blades = blades.slice(0, limit);

  console.info(
    `Repairing ${blades.length} blade product(s) → JPEG without knockout (rate=${rateMs}ms${force ? ', force' : ''})…`,
  );

  let repaired = 0;
  let failed = 0;
  let imagesWritten = 0;
  const orphanCandidates = new Set<string>();
  const touchedSources = new Set<string>();
  const PERSIST_EVERY = 15;

  for (let i = 0; i < blades.length; i += 1) {
    const product = blades[i]!;
    const sourceUrl = product.provenance?.sourceUrl;
    const sourceId = product.provenance?.sourceId;
    const maxImages = Math.max(1, Math.min(2, product.images?.length ?? 1));

    console.info(`[${i + 1}/${blades.length}] ${product.name} (${product.id})`);

    if (!sourceUrl) {
      console.warn('  skip: no provenance.sourceUrl');
      failed += 1;
      continue;
    }

    let remoteUrls: string[] = [];
    try {
      const html = await fetchHtml(sourceUrl, rateMs);
      remoteUrls = extractRemoteUrls(sourceId, html, maxImages);
    } catch (error) {
      console.warn(`  PDP failed:`, error);
      failed += 1;
      continue;
    }

    if (remoteUrls.length === 0) {
      console.warn('  skip: no remote gallery URLs');
      failed += 1;
      continue;
    }

    const oldSrcs = (product.images ?? []).map((image) => image.src);
    const publicSrcs: string[] = [];

    for (const url of remoteUrls) {
      try {
        const downloaded = await downloadImageToOwnedStorage({
          url,
          outputDir: catalogDir,
          publicPrefix: '/catalog',
          rateLimitMs: rateMs,
          allowKnockout: allowKnockoutForCategory('blade'),
        });
        publicSrcs.push(downloaded.publicSrc);
        imagesWritten += 1;
        console.info(`  + ${downloaded.publicSrc}`);
      } catch (error) {
        console.warn(`  image skip ${url}:`, error);
      }
    }

    if (publicSrcs.length === 0) {
      failed += 1;
      continue;
    }

    for (const src of oldSrcs) {
      if (!publicSrcs.includes(src)) orphanCandidates.add(src);
    }

    product.images = publicSrcs.map((src, index) => ({
      id: `${product.id}-img-${index + 1}`,
      src,
      alt: `${product.name} photo ${index + 1}`,
      isPrimary: index === 0,
    }));
    product.imageLocalPaths = [...publicSrcs];
    if (sourceId) touchedSources.add(sourceId);

    repaired += 1;
    if (repaired % PERSIST_EVERY === 0 || i === blades.length - 1) {
      await persistCatalog(catalog, touchedSources);
      touchedSources.clear();
      console.info(`  …checkpoint repaired=${repaired}`);
    }
  }

  if (touchedSources.size > 0) {
    await persistCatalog(catalog, touchedSources);
  }

  const stillUsed = new Set<string>();
  for (const product of catalog.products) {
    for (const image of product.images ?? []) stillUsed.add(image.src);
    for (const src of product.imageLocalPaths ?? []) stillUsed.add(src);
  }

  let deleted = 0;
  for (const src of orphanCandidates) {
    if (stillUsed.has(src)) continue;
    if (!src.startsWith('/catalog/')) continue;
    const filePath = path.join(catalogDir, path.basename(src));
    try {
      await unlink(filePath);
      deleted += 1;
    } catch {
      // already gone
    }
  }

  console.info(
    `Done. repairedProducts=${repaired} failed=${failed} imagesWritten=${imagesWritten} orphansDeleted=${deleted}`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
