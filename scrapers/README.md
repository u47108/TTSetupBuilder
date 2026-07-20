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
    ittf-cli.ts            # pnpm ittf — snapshot / diff / annotate
    ittf/                  # ITTF admin API client, match, fixtures
    config/sources.ts      # registry metadata
    pipeline/              # download image, normalize, write JSON, run
    sources/               # one module per source (stubs + dry-run URLs)
    schema/                # scraped ↔ catalog contract helpers
  data/
    fixtures/              # small committed examples
    ittf/snapshots/        # dated ITTF JSON snapshots (gitignored large dumps OK)
    ittf/reports/          # diff + approval reports
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

### ITTF approval monitor (batch only)

Official racket-covering facts from `ittf-admin-api.azurewebsites.net` — **not** shop inventory. Annotates `ittfApproval` on `category=rubber` in the owned catalog. The SPA never calls ITTF at runtime ([ADR-014](../docs/adr/ADR-014-offline-first-data-ownership.md)).

```bash
# Nightly-style: fetch all pages → snapshot → diff → annotate catalog.json
pnpm ittf -- run

# Offline UI fixtures (Prasidha without Approval Code → alert on product detail)
pnpm ittf -- seed-fixtures

# Snapshot only / annotate only
pnpm ittf -- snapshot
pnpm ittf -- annotate --seed-fixtures
```

Visual QA after `seed-fixtures`: `/products/prasidha-action`, `/products/prasidha-osaka`, `/products/prasidha-long-a`.

Details: [`docs/DATA_SOURCES.md`](../docs/DATA_SOURCES.md#ittf-api--racket-coverings-monitor).

### Live parsers

| Source id | Status |
|-----------|--------|
| `dandoy-blades` / `dandoy-rubbers` | **Live** — Magento |
| `vpsport-*` | **Live** — Jumpseller |
| `zonatt-maderas` | **Live** — ZonaTT blades via **sitemap** (incl. OOS) + PDP `og:image`; listing/ajax for mango hints |
| `zonatt-gomas` | **Live** — ZonaTT rubbers via **sitemap** (incl. OOS) + PDP `og:image` |
| `cl-rubber-seeds` | **Live** — Bushido / Foxhara WooCommerce PDP seeds |
| `ittf-racket-coverings` | **Live API monitor** — `pnpm ittf` (approval facts) |
| `tt11-*` | Stub — Cloudflare blocks automated GET |
| `tabletennis-reference-rubbers` | **Partial live** — explicit PDP seeds only (e.g. detail/439 Blues T1); multi-page `/rubber` crawl TODO. Not `tabletennis-reviews`. |
| `tabletennis-reference-rackets` | Stub — dry-run `/racket` (+ home); live PDP seeds TODO |
| Others | Stub / dry-run only |

### Flags

| Flag | Meaning |
|------|---------|
| `--no-dry-run --fetch-listing` | Enable live parser when available |
| `--download-images` | Write content-hash files under `apps/web/public/catalog/` |
| `--publish` | Write `apps/web/public/data/catalog.json` for Fuse.js / Products UI |
| `--limit=<n>` | Max products (default 8) |
| `--max-pages=<n>` | Max listing pages (default 1) |

Images are stored as **owned JPEG ≤720px**, or **WebP with alpha** when a studio white/black plate is detected on **non-blade** products (`pnpm optimize-images`).

**Blades never get knockout** — pale wood ≈ studio white and fringe scrub shreds edges on dark UI (see Viscaria-style jagged alpha). Scrapers pass `allowKnockoutForCategory(category)`; `pnpm optimize-images` forces JPEG for blade-linked files. Blade JPEGs on white plates also scrub retail **dark matte rings** (black contour halo). Already-damaged blade WebPs need `pnpm repair-blade-images` (re-download; add `--force` to redo JPEGs).

```bash
pnpm optimize-images
pnpm repair-blade-images -- --id=<product-id>          # WebP blades
pnpm repair-blade-images -- --id=<product-id> --force  # re-download JPEG too
```

Dry-run (without `--no-dry-run --fetch-listing`) writes a URL plan under `data/normalized/<sourceId>.dry-run.json` without requesting product pages or images.

## Normalized contract

Types live in `@ttsetupbuilder/types` (`CatalogProduct`, `CatalogDocument`). Every product carries:

- `images[]` (multiplicity — ADR-004)
- `imageLocalPaths[]`
- `provenance.sourceId` / `sourceUrl` / `scrapedAt` (+ optional license fields)
