import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CatalogDocument } from '@ttsetupbuilder/types';
import { fetchAllRacketCoverings } from './ittf/api.js';
import { buildFixtureCatalogProducts, buildFixtureSnapshot } from './ittf/fixtures.js';
import { annotateCatalogRubbers } from './ittf/matchApproval.js';
import {
  diffSnapshots,
  findPreviousSnapshotDate,
  formatDiffSummary,
  listSnapshotDates,
  loadSnapshot,
  localSnapshotDate,
  saveSnapshot,
  writeDiffReport,
} from './ittf/snapshot.js';
import { writeJsonFile } from './pipeline/writeJson.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
const defaultCatalogPath = path.resolve(packageRoot, '../apps/web/public/data/catalog.json');

type Flags = {
  command?: string;
  help: boolean;
  date?: string;
  catalog?: string;
  writeCatalog: boolean;
  seedFixtures: boolean;
  pageSize: number;
};

function parseArgs(argv: string[]): Flags {
  const flags: Flags = {
    help: false,
    writeCatalog: true,
    seedFixtures: false,
    pageSize: 100,
  };
  const positionals: string[] = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]!;
    if (arg === '--help' || arg === '-h') flags.help = true;
    else if (arg === '--no-write-catalog') flags.writeCatalog = false;
    else if (arg === '--seed-fixtures') flags.seedFixtures = true;
    else if (arg.startsWith('--date=')) flags.date = arg.slice('--date='.length);
    else if (arg === '--date') flags.date = argv[++i];
    else if (arg.startsWith('--catalog=')) flags.catalog = arg.slice('--catalog='.length);
    else if (arg === '--catalog') flags.catalog = argv[++i];
    else if (arg.startsWith('--page-size=')) flags.pageSize = Number(arg.slice('--page-size='.length));
    else if (arg === '--page-size') flags.pageSize = Number(argv[++i]);
    else if (!arg.startsWith('-')) positionals.push(arg);
  }
  flags.command = positionals[0];
  if (!Number.isFinite(flags.pageSize) || flags.pageSize < 1) flags.pageSize = 100;
  return flags;
}

function printHelp(): void {
  console.log(`ITTF approval monitor + catalog annotation (batch only — ADR-009 / ADR-014)

Usage:
  pnpm ittf -- snapshot              Fetch full racket-coverings list → data/ittf/snapshots/YYYY-MM-DD.json
  pnpm ittf -- diff [--date=YYYY-MM-DD]
  pnpm ittf -- annotate [--date=...] [--catalog=path] [--seed-fixtures]
  pnpm ittf -- run                   snapshot + diff + annotate (nightly)
  pnpm ittf -- seed-fixtures         Write fixture snapshot + Prasidha demo products (offline UI QA)

Flags:
  --date=YYYY-MM-DD     Snapshot date (default: today local)
  --catalog=<path>      Catalog JSON (default: apps/web/public/data/catalog.json)
  --no-write-catalog    Annotate report only; do not mutate catalog.json
  --seed-fixtures       Merge Prasidha restricted fixtures into catalog before annotate
  --page-size=<n>       ITTF pagination page size (default 100)

Notes:
  - Keyed by EquipmentCode when present; otherwise EquipmentRacketCoveringId for diffs.
  - Annotation writes ittfApproval on category=rubber only (local data for SPA).
  - SPA never calls ITTF at runtime.
`);
}

async function readCatalog(catalogPath: string): Promise<CatalogDocument> {
  const raw = await readFile(catalogPath, 'utf8');
  return JSON.parse(raw) as CatalogDocument;
}

async function cmdSnapshot(flags: Flags): Promise<void> {
  const date = flags.date ?? localSnapshotDate();
  console.info(`Fetching ITTF racket coverings (pageSize=${flags.pageSize})…`);
  const snapshot = await fetchAllRacketCoverings({
    pageSize: flags.pageSize,
    onProgress: (fetched, total) => {
      if (fetched === total || fetched % 300 === 0) {
        console.info(`  … ${fetched}/${total}`);
      }
    },
  });
  const out = await saveSnapshot(packageRoot, snapshot, date);
  console.info(`Saved snapshot count=${snapshot.count} → ${out}`);

  const prevDate = await findPreviousSnapshotDate(packageRoot, date);
  const previous = prevDate ? await loadSnapshot(packageRoot, prevDate) : null;
  const report = diffSnapshots(previous, snapshot, date, prevDate);
  const reportPath = await writeDiffReport(packageRoot, report, date);
  console.info(formatDiffSummary(report));
  console.info(`Diff report → ${reportPath}`);
}

async function cmdDiff(flags: Flags): Promise<void> {
  const date = flags.date ?? (await listSnapshotDates(packageRoot)).at(-1);
  if (!date) {
    throw new Error('No snapshots found. Run: pnpm ittf -- snapshot');
  }
  const current = await loadSnapshot(packageRoot, date);
  if (!current) throw new Error(`Missing snapshot for ${date}`);
  const prevDate = await findPreviousSnapshotDate(packageRoot, date);
  const previous = prevDate ? await loadSnapshot(packageRoot, prevDate) : null;
  const report = diffSnapshots(previous, current, date, prevDate);
  const reportPath = await writeDiffReport(packageRoot, report, date);
  console.info(formatDiffSummary(report));
  console.info(`Diff report → ${reportPath}`);
}

async function mergeFixtureProducts(doc: CatalogDocument): Promise<CatalogDocument> {
  const fixtures = buildFixtureCatalogProducts();
  const byId = new Map(doc.products.map((p) => [p.id, p]));
  for (const fixture of fixtures) {
    byId.set(fixture.id, fixture);
  }
  return {
    ...doc,
    generatedAt: new Date().toISOString(),
    products: [...byId.values()].sort((a, b) => a.name.localeCompare(b.name)),
  };
}

async function cmdAnnotate(flags: Flags): Promise<void> {
  const catalogPath = flags.catalog ?? defaultCatalogPath;
  const date = flags.date ?? (await listSnapshotDates(packageRoot)).at(-1);
  if (!date) {
    throw new Error('No snapshots found. Run snapshot or seed-fixtures first.');
  }
  const snapshot = await loadSnapshot(packageRoot, date);
  if (!snapshot) throw new Error(`Missing snapshot for ${date}`);

  let doc = await readCatalog(catalogPath);
  if (flags.seedFixtures) {
    doc = await mergeFixtureProducts(doc);
  }

  const { products, stats } = annotateCatalogRubbers(doc.products, snapshot, date);
  const rubberCount = products.filter((p) => p.category === 'rubber').length;
  console.info(
    `Annotated rubbers=${rubberCount} approved=${stats.approved} not_found=${stats.not_found} not_approved=${stats.not_approved} expired=${stats.expired} inactive=${stats.inactive}`,
  );

  const reportPath = path.join(
    packageRoot,
    'data',
    'ittf',
    'reports',
    `${date}-catalog-approval.json`,
  );
  await writeJsonFile(reportPath, {
    version: 1,
    snapshotDate: date,
    checkedAt: new Date().toISOString(),
    stats,
    samples: products
      .filter((p) => p.category === 'rubber' && p.ittfApproval && p.ittfApproval.status !== 'approved')
      .slice(0, 40)
      .map((p) => ({
        id: p.id,
        name: p.name,
        brandId: p.brandId,
        ittfApproval: p.ittfApproval,
      })),
  });
  console.info(`Approval report → ${reportPath}`);

  if (flags.writeCatalog) {
    const next: CatalogDocument = {
      version: 1,
      generatedAt: new Date().toISOString(),
      products,
    };
    await writeJsonFile(catalogPath, next);
    console.info(`Updated catalog → ${catalogPath}`);
  }
}

async function cmdSeedFixtures(): Promise<void> {
  const snapshot = buildFixtureSnapshot();
  const fixturePath = path.join(packageRoot, 'data', 'ittf', 'snapshots', 'fixture-demo.json');
  await writeJsonFile(fixturePath, snapshot);
  console.info(`Fixture snapshot (${snapshot.count} rows) → ${fixturePath}`);

  const today = localSnapshotDate();
  const existing = await loadSnapshot(packageRoot, today);
  if (!existing) {
    await saveSnapshot(packageRoot, snapshot, today);
    console.info(`Wrote starter snapshot for ${today} (no live snapshot yet)`);
  }

  const catalogPath = defaultCatalogPath;
  let doc = await readCatalog(catalogPath);
  doc = await mergeFixtureProducts(doc);

  const annotateDate = today;
  const snap = (await loadSnapshot(packageRoot, annotateDate)) ?? snapshot;
  const { products, stats } = annotateCatalogRubbers(doc.products, snap, annotateDate);
  await writeJsonFile(catalogPath, {
    version: 1,
    generatedAt: new Date().toISOString(),
    products,
  });
  console.info(
    `Seeded fixtures + annotate (snapshot=${annotateDate}) → ${catalogPath}`,
  );
  console.info(
    `  not_approved=${stats.not_approved} not_found=${stats.not_found} approved=${stats.approved} expired=${stats.expired} inactive=${stats.inactive}`,
  );
  console.info('Visual QA routes:');
  console.info('  /products/prasidha-action');
  console.info('  /products/prasidha-osaka');
  console.info('  /products/prasidha-long-a');
  console.info('  /products/andro-rasanter-r47-ittf-demo  (contrast — should look approved if matched)');
}

async function main(): Promise<void> {
  const flags = parseArgs(process.argv.slice(2));
  if (flags.help || !flags.command) {
    printHelp();
    if (!flags.command) process.exitCode = 1;
    return;
  }

  switch (flags.command) {
    case 'snapshot':
      await cmdSnapshot(flags);
      break;
    case 'diff':
      await cmdDiff(flags);
      break;
    case 'annotate':
      await cmdAnnotate(flags);
      break;
    case 'run':
      await cmdSnapshot(flags);
      await cmdAnnotate(flags);
      break;
    case 'seed-fixtures':
      await cmdSeedFixtures();
      break;
    default:
      console.error(`Unknown command: ${flags.command}`);
      printHelp();
      process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
