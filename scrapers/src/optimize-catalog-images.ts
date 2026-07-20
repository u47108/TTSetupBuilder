/**
 * Re-encodes owned catalog images (max ~720px).
 * Studio white/black backgrounds → transparent WebP; otherwise JPEG.
 * Blade-referenced files always use allowKnockout=false (pale wood ≈ white plate).
 * Rewrites catalog.json paths when extension changes.
 *
 * Usage: pnpm optimize-images
 */
import { readdir, readFile, writeFile, unlink, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CatalogProduct } from '@ttsetupbuilder/types';
import {
  allowKnockoutForCategory,
  optimizeCatalogImage,
} from './pipeline/optimizeImage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalogDir = path.resolve(__dirname, '../../apps/web/public/catalog');
const catalogJsonPath = path.resolve(
  __dirname,
  '../../apps/web/public/data/catalog.json',
);

async function writeWithRetry(outPath: string, buffer: Buffer): Promise<void> {
  const tmpPath = `${outPath}.tmp-${process.pid}`;
  await writeFile(tmpPath, buffer);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await rename(tmpPath, outPath);
      return;
    } catch {
      try {
        await writeFile(outPath, buffer);
        await unlink(tmpPath).catch(() => undefined);
        return;
      } catch {
        await new Promise((r) => setTimeout(r, 150 * (attempt + 1)));
      }
    }
  }
  // Last resort: leave .tmp sibling hashed name
  const fallback = `${outPath}.new`;
  await rename(tmpPath, fallback).catch(async () => {
    await writeFile(fallback, buffer);
  });
  throw new Error(`Locked write failed for ${outPath} — wrote ${fallback}`);
}

function bladeBasenames(products: CatalogProduct[]): Set<string> {
  const names = new Set<string>();
  for (const product of products) {
    if (product.category !== 'blade') continue;
    for (const image of product.images ?? []) {
      names.add(path.basename(image.src));
    }
    for (const src of product.imageLocalPaths ?? []) {
      names.add(path.basename(src));
    }
  }
  return names;
}

async function main(): Promise<void> {
  const entries = await readdir(catalogDir);
  const files = entries.filter((name) => /\.(jpe?g|png|webp|gif|avif)$/i.test(name));
  const renames = new Map<string, string>();

  const catalogRaw = await readFile(catalogJsonPath, 'utf8');
  const catalog = JSON.parse(catalogRaw) as { products: CatalogProduct[] };
  const bladeFiles = bladeBasenames(catalog.products);

  let savedBytes = 0;
  let processed = 0;
  let knocked = 0;
  let skipped = 0;
  let bladeSafe = 0;
  let bladeWebpWarned = 0;

  console.info(
    `Optimizing ${files.length} files (${bladeFiles.size} blade-linked → JPEG, no knockout)…`,
  );

  for (const name of files) {
    const isBlade = bladeFiles.has(name);
    const filePath = path.join(catalogDir, name);
    const before = await readFile(filePath);
    const beforeSize = before.length;

    try {
      const optimized = await optimizeCatalogImage(before, {
        allowKnockout: isBlade ? false : allowKnockoutForCategory('rubber'),
      });
      const base = path.parse(name).name;
      const outName = `${base}${optimized.extension}`;
      const outPath = path.join(catalogDir, outName);

      if (isBlade) {
        bladeSafe += 1;
        if (name.endsWith('.webp')) {
          bladeWebpWarned += 1;
        }
      }

      // Skip tiny wins only when format stays the same and already small
      if (
        !optimized.knockedOutBackground &&
        outName === name &&
        optimized.buffer.length >= beforeSize * 0.95 &&
        beforeSize < 60_000
      ) {
        skipped += 1;
        continue;
      }

      if (isBlade && (optimized.knockedOutBackground || optimized.extension === '.webp')) {
        throw new Error(`Invariant: blade optimize produced knockout/WebP for ${name}`);
      }

      await writeWithRetry(outPath, optimized.buffer);

      if (outName !== name) {
        await unlink(filePath);
        renames.set(`/catalog/${name}`, `/catalog/${outName}`);
      }

      if (optimized.knockedOutBackground) knocked += 1;
      savedBytes += Math.max(0, beforeSize - optimized.buffer.length);
      processed += 1;
      if (processed % 40 === 0) {
        console.info(`  …${processed}/${files.length} (knockout=${knocked})`);
      }
    } catch (error) {
      console.warn(`skip ${name}:`, error);
      skipped += 1;
    }
  }

  if (renames.size > 0) {
    let next = catalogRaw;
    for (const [from, to] of renames) {
      next = next.split(from).join(to);
    }
    if (next !== catalogRaw) {
      await writeFile(catalogJsonPath, next, 'utf8');
      console.info(`Updated ${renames.size} path(s) in catalog.json`);
    }
  }

  console.info(
    `Done. processed=${processed} knockout=${knocked} bladeSafe=${bladeSafe} skipped=${skipped} saved≈${(savedBytes / 1024 / 1024).toFixed(1)} MB`,
  );
  if (bladeWebpWarned > 0) {
    console.info(
      `Note: ${bladeWebpWarned} blade WebP(s) flattened to JPEG. Jagged wood edges cannot be recovered — run pnpm repair-blade-images for those products.`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
