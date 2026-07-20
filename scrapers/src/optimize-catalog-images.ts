/**
 * Re-encodes owned catalog images (max ~720px).
 * Studio white/black backgrounds → transparent WebP; otherwise JPEG.
 * Rewrites catalog.json paths when extension changes.
 *
 * Usage: pnpm optimize-images
 */
import { readdir, readFile, writeFile, unlink, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { optimizeCatalogImage } from './pipeline/optimizeImage.js';

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

async function main(): Promise<void> {
  const entries = await readdir(catalogDir);
  const files = entries.filter((name) => /\.(jpe?g|png|webp|gif|avif)$/i.test(name));
  const renames = new Map<string, string>();

  let savedBytes = 0;
  let processed = 0;
  let knocked = 0;
  let skipped = 0;

  console.info(
    `Optimizing ${files.length} files (JPEG or WebP+alpha if studio white/black bg)…`,
  );

  for (const name of files) {
    const filePath = path.join(catalogDir, name);
    const before = await readFile(filePath);
    const beforeSize = before.length;

    try {
      const optimized = await optimizeCatalogImage(before);
      const base = path.parse(name).name;
      const outName = `${base}${optimized.extension}`;
      const outPath = path.join(catalogDir, outName);

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
    const raw = await readFile(catalogJsonPath, 'utf8');
    let next = raw;
    for (const [from, to] of renames) {
      next = next.split(from).join(to);
    }
    if (next !== raw) {
      await writeFile(catalogJsonPath, next, 'utf8');
      console.info(`Updated ${renames.size} path(s) in catalog.json`);
    }
  }

  console.info(
    `Done. processed=${processed} knockout=${knocked} skipped=${skipped} saved≈${(savedBytes / 1024 / 1024).toFixed(1)} MB`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
