/**
 * Enrich existing VP Sport blades with Tomada handle types (FL/ST/…) without re-downloading images.
 *
 * Usage: pnpm --filter @ttsetupbuilder/scrapers enrich-handles
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CatalogDocument, CatalogProduct } from '@ttsetupbuilder/types';
import { fetchHtml } from './pipeline/downloadImage.js';
import { extractHandleTypes } from './sources/createVpsportJumpsellerSource.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalogPath = path.resolve(__dirname, '../../apps/web/public/data/catalog.json');

async function main(): Promise<void> {
  const doc = JSON.parse(await readFile(catalogPath, 'utf8')) as CatalogDocument;
  const blades = doc.products.filter(
    (product) =>
      product.category === 'blade' &&
      product.provenance.sourceId.startsWith('vpsport-') &&
      Boolean(product.provenance.sourceUrl),
  );

  console.info(`Enriching ${blades.length} VP Sport blades with Tomada (FL/ST)…`);
  let updated = 0;

  for (const [index, blade] of blades.entries()) {
    const url = blade.provenance.sourceUrl;
    console.info(`[${index + 1}/${blades.length}] ${blade.name}`);
    try {
      const html = await fetchHtml(url, 800);
      const handleTypes = extractHandleTypes(html);
      if (handleTypes.length === 0) {
        console.info('  (no Tomada options)');
        continue;
      }
      blade.handleTypes = handleTypes;
      updated += 1;
      console.info(`  → ${handleTypes.join(', ')}`);
    } catch (error) {
      console.warn(`  skip:`, error);
    }
  }

  const byId = new Map(doc.products.map((product) => [product.id, product]));
  for (const blade of blades) {
    byId.set(blade.id, blade);
  }

  const next: CatalogDocument = {
    version: 1,
    generatedAt: new Date().toISOString(),
    products: [...byId.values()].sort((a, b) => a.name.localeCompare(b.name)),
  };

  await writeFile(catalogPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  console.info(`Done. updated=${updated}/${blades.length} → ${catalogPath}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
