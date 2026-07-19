/**
 * Re-encodes existing owned catalog images (smaller JPEG, max ~720px).
 * Renames non-jpg → .jpg and rewrites catalog.json paths.
 *
 * Usage: pnpm optimize-images
 */
import { readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { optimizeCatalogImage } from './pipeline/optimizeImage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalogDir = path.resolve(__dirname, '../../apps/web/public/catalog');
const catalogJsonPath = path.resolve(
  __dirname,
  '../../apps/web/public/data/catalog.json',
);

async function main(): Promise<void> {
  const entries = await readdir(catalogDir);
  const files = entries.filter((name) => /\.(jpe?g|png|webp|gif|avif)$/i.test(name));
  const renames = new Map<string, string>();

  let savedBytes = 0;
  let processed = 0;
  let skipped = 0;

  console.info(`Optimizing ${files.length} files in ${catalogDir} (max 720px JPEG q72)…`);

  for (const name of files) {
    const filePath = path.join(catalogDir, name);
    const before = await readFile(filePath);
    const beforeSize = before.length;

    try {
      const optimized = await optimizeCatalogImage(before);
      if (optimized.buffer.length >= beforeSize * 0.95 && beforeSize < 60_000) {
        skipped += 1;
        continue;
      }

      const base = path.parse(name).name;
      const outName = `${base}.jpg`;
      const outPath = path.join(catalogDir, outName);
      await writeFile(outPath, optimized.buffer);

      if (outName !== name) {
        await unlink(filePath);
        renames.set(`/catalog/${name}`, `/catalog/${outName}`);
      }

      savedBytes += Math.max(0, beforeSize - optimized.buffer.length);
      processed += 1;
      if (processed % 50 === 0) {
        console.info(`  …${processed}/${files.length}`);
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
    `Done. processed=${processed} skipped=${skipped} saved≈${(savedBytes / 1024 / 1024).toFixed(1)} MB`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
