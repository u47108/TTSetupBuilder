import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCE_CONFIGS } from './config/sources.js';
import { runSource } from './pipeline/runSource.js';
import type { ScrapeContext } from './sources/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
const defaultImageOutputDir = path.resolve(packageRoot, '../apps/web/public/catalog');

type CliFlags = {
  source?: string;
  list: boolean;
  dryRun: boolean;
  fetchListing: boolean;
  downloadImages: boolean;
  publish: boolean;
  limit: number;
  maxPages: number;
  help: boolean;
};

function parseArgs(argv: string[]): CliFlags {
  const flags: CliFlags = {
    list: false,
    dryRun: true,
    fetchListing: false,
    downloadImages: false,
    publish: false,
    limit: 8,
    maxPages: 1,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]!;
    if (arg === '--list') flags.list = true;
    else if (arg === '--help' || arg === '-h') flags.help = true;
    else if (arg === '--dry-run') flags.dryRun = true;
    else if (arg === '--no-dry-run') flags.dryRun = false;
    else if (arg === '--fetch-listing') flags.fetchListing = true;
    else if (arg === '--download-images') flags.downloadImages = true;
    else if (arg === '--publish') flags.publish = true;
    else if (arg.startsWith('--source=')) flags.source = arg.slice('--source='.length);
    else if (arg === '--source') flags.source = argv[++i];
    else if (arg.startsWith('--limit=')) flags.limit = Number(arg.slice('--limit='.length));
    else if (arg === '--limit') flags.limit = Number(argv[++i]);
    else if (arg.startsWith('--max-pages=')) flags.maxPages = Number(arg.slice('--max-pages='.length));
    else if (arg === '--max-pages') flags.maxPages = Number(argv[++i]);
  }

  // Safety: without explicit --no-dry-run and --fetch-listing, stay dry-run
  if (!flags.fetchListing) {
    flags.dryRun = true;
  }

  if (!Number.isFinite(flags.limit) || flags.limit < 1) flags.limit = 8;
  if (!Number.isFinite(flags.maxPages) || flags.maxPages < 1) flags.maxPages = 1;

  return flags;
}

function printHelp(): void {
  console.log(`TTSetupBuilder scrapers — offline/batch ingestion (ADR-009 / ADR-014)

Usage:
  pnpm scrape -- --list
  pnpm scrape -- --source=dandoy-blades
  pnpm scrape -- --source=dandoy-blades --no-dry-run --fetch-listing --download-images --publish --limit=8

Flags:
  --source=<id>       Source id from docs/DATA_SOURCES.md
  --list              Print registered sources
  --dry-run           Default: plan URLs only, write *.dry-run.json
  --no-dry-run        Enable live parsers when available
  --fetch-listing     Opt-in network listing/PDP work
  --download-images   Download owned images into apps/web/public/catalog
  --publish           Write apps/web/public/data/catalog.json
  --limit=<n>         Max products per live run (default 8)
  --max-pages=<n>     Max listing pages (default 1)

Live parsers today:
  dandoy-blades
  dandoy-rubbers

Blocked / stub:
  tt11-* (Cloudflare challenge on automated GET)

Publish merges into catalog.json by sourceId (replaces that source’s rows, keeps others).

Ethics: respect robots.txt and ToS. Identify as TTSetupBuilderResearchBot. No auth bypass.
`);
}

function printList(): void {
  console.log('Registered sources:\n');
  for (const source of SOURCE_CONFIGS) {
    const api = source.requiresApiDiscovery ? ' [API discovery]' : '';
    const cf = source.cloudflareBlocked ? ' [Cloudflare blocked]' : '';
    console.log(`  ${source.id}${api}${cf}`);
    console.log(`    ${source.name}`);
    console.log(`    ${source.listingUrl}`);
    console.log(`    role=${source.role} rateLimitMs=${source.rateLimitMs}\n`);
  }
}

async function main(): Promise<void> {
  const flags = parseArgs(process.argv.slice(2));

  if (flags.help) {
    printHelp();
    return;
  }

  if (flags.list) {
    printList();
    return;
  }

  if (!flags.source) {
    console.error('Missing --source=<id>. Use --list or --help.');
    process.exitCode = 1;
    return;
  }

  const ctx: ScrapeContext = {
    dryRun: flags.dryRun,
    fetchListing: flags.fetchListing,
    downloadImages: flags.downloadImages,
    packageRoot,
    imageOutputDir: defaultImageOutputDir,
    rateLimitMs:
      SOURCE_CONFIGS.find((s) => s.id === flags.source)?.rateLimitMs ?? 1500,
    limit: flags.limit,
    maxPages: flags.maxPages,
    publishCatalog: flags.publish,
  };

  console.info(
    `Running source=${flags.source} dryRun=${ctx.dryRun} fetchListing=${ctx.fetchListing} downloadImages=${ctx.downloadImages} publish=${ctx.publishCatalog} limit=${ctx.limit}`,
  );

  const result = await runSource(flags.source, ctx);
  console.info(
    `Done mode=${result.mode} products=${result.productCount} images=${result.imagesDownloaded} → ${result.outputPath}`,
  );
  if (result.catalogPath) {
    console.info(
      `SPA catalog: ${result.catalogPath}${
        result.catalogTotalProducts != null ? ` (total ${result.catalogTotalProducts})` : ''
      }`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
