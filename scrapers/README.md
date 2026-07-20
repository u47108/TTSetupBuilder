# @ttsetupbuilder/scrapers

Offline/batch ingestion for TTSetupBuilder. External sites are **sources**, not runtime dependencies ([ADR-009](../docs/adr/ADR-009-data-source-strategy.md), [ADR-014](../docs/adr/ADR-014-offline-first-data-ownership.md)).

```text
Source → Scrape → Normalize → JSON + owned images → apps/web (Fuse.js)
```

Full source registry (URLs, roles, ITTF SPA notes): [`docs/DATA_SOURCES.md`](../docs/DATA_SOURCES.md).

## Ethics (operators)

- **Respect robots.txt and site Terms of Service** before enabling live HTTP.
- No credential stuffing, no auth/paywall bypass.
- Identify traffic: User-Agent includes `TTSetupBuilderResearchBot` and a contact/repo hint.
- Default CLI mode is **dry-run** (no network hammering). Prefer documenting selectors over aggressive full scrapes.
- Store provenance (`sourceId`, `sourceUrl`, `scrapedAt`, license/attribution when known).
- Never hotlink: download images to owned disk only ([ADR-008](../docs/adr/ADR-008-image-strategy.md)).

## Layout

```text
scrapers/
  package.json
  src/
    cli.ts                 # pnpm scrape entry
    config/sources.ts      # registry metadata
    pipeline/              # download image, normalize, write JSON, run
    sources/               # one module per source (stubs + dry-run URLs)
    schema/                # scraped ↔ catalog contract helpers
  data/
    fixtures/              # small committed examples
    raw/                   # gitignored — large scrape dumps
    normalized/            # gitignored — normalized JSON batches
  images/                  # gitignored binaries; prefer publishing to apps/web/public/catalog/
```

Owned catalog images for the SPA: `apps/web/public/catalog/`. Search index JSON: `apps/web/public/data/catalog.json`.

## Commands

```bash
# List sources
pnpm scrape -- --list

# Dry-run (default) — no live parse
pnpm scrape -- --source=dandoy-blades

# LIVE (Dandoy blades) — rate-limited; downloads owned images; publishes SPA catalog
pnpm scrape -- --source=dandoy-blades --no-dry-run --fetch-listing --download-images --publish --limit=8 --max-pages=1
```

### Live parsers

| Source id | Status |
|-----------|--------|
| `dandoy-blades` / `dandoy-rubbers` | **Live** — Magento |
| `vpsport-*` | **Live** — Jumpseller |
| `zonatt-maderas` | **Live** — ZonaTT blades (`div.producto` + `og:image`) |
| `tt11-*` | Stub — Cloudflare blocks automated GET |
| Others | Stub / dry-run only |

### Flags

| Flag | Meaning |
|------|---------|
| `--no-dry-run --fetch-listing` | Enable live parser when available |
| `--download-images` | Write content-hash files under `apps/web/public/catalog/` |
| `--publish` | Write `apps/web/public/data/catalog.json` for Fuse.js / Products UI |
| `--limit=<n>` | Max products (default 8) |
| `--max-pages=<n>` | Max listing pages (default 1) |

Images are stored as **owned JPEG ≤720px** or **WebP with alpha** when a studio white background is detected (`pnpm optimize-images`).

```bash
pnpm optimize-images
```

Dry-run (without `--no-dry-run --fetch-listing`) writes a URL plan under `data/normalized/<sourceId>.dry-run.json` without requesting product pages or images.

## Normalized contract

Types live in `@ttsetupbuilder/types` (`CatalogProduct`, `CatalogDocument`). Every product carries:

- `images[]` (multiplicity — ADR-004)
- `imageLocalPaths[]`
- `provenance.sourceId` / `sourceUrl` / `scrapedAt` (+ optional license fields)
