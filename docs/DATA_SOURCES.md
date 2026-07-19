# Data sources — image & catalog ingestion

Registry of **approved ingestion sources** for product photography candidates, structured attributes, reviews, and official approval lists.

**Runtime rule (ADR-008, ADR-009, ADR-014):** these sites are **batch inputs only**. The SPA never hotlinks images or calls these origins at runtime. Pipeline:

```text
Source → Scraper (offline/batch) → Normalize → JSON + owned images → Frontend / Fuse.js
```

Canonical scraper package: [`scrapers/`](../scrapers/). Operator ethics and robots policy: [`scrapers/README.md`](../scrapers/README.md).

---

## Policy (all sources)

| Topic | Rule |
|-------|------|
| **Attribution** | Persist `provenance.sourceId`, `sourceUrl`, `scrapedAt`, optional `attribution` / `license` / `mediaRights` on every normalized product. |
| **User-Agent** | Identify as research bot for TTSetupBuilder (see scrapers README). |
| **Rate limit** | Default delay between requests; never parallel-hammer listings. Default CLI mode is **dry-run**. |
| **robots.txt / ToS** | Operators **must** check robots.txt and site Terms before enabling live fetches. Scrapers do not bypass auth or paywalls. |
| **Images** | Download to owned disk (`apps/web/public/catalog/` or `scrapers/images/`); content-hash filenames; never use remote URLs as `<img src>` in the app. |

---

## Source registry

| Source id | URL | Provides | Priority / role | Notes |
|-----------|-----|----------|-----------------|-------|
| `tt11-blades-penholder` | https://tabletennis11.com/en/blades-penholder | Penholder blades, product photos, retail attributes | **Catalog photos** (secondary) | **Cloudflare blocked** for automated GET (2026-07). |
| `tt11-blades` | https://tabletennis11.com/en/blades | Blades (shakehand), photos, specs | **Primary intent** — blades | **Cloudflare blocked** for automated GET. Prefer `dandoy-blades` for live ingestion. |
| `tt11-rubbers` | https://tabletennis11.com/en/rubbers | Rubbers, photos, sponge options | **Primary intent** — rubbers | **Cloudflare blocked** for automated GET. |
| `tabletennis-reviews` | https://tabletennis-reviews.com/ | Community / editorial reviews, product mentions | **Reviews & qualitative context** (not primary photo inventory) | Useful for review text and cross-links; media may be sparse or third-party — only keep owned downloads. |
| `ttgearlab-database` | https://ttgearlab.com/category/database/ | Gear database / measured or catalogued equipment | **Specs / lab-oriented catalog** | Category archive; confirm pagination and image rights before bulk download. |
| `ittf-equipment-approval` | https://equipment.ittf.com/#/equipment/approval | Official ITTF equipment approval lists | **Official approval** (authoritative status) | **SPA with hash routes** (`#/...`). Listing HTML alone may be empty; **API discovery required** (devtools Network). Document endpoints when found; until then dry-run only. |
| `ittf-racket-coverings` | https://equipment.ittf.com/#/equipment/racket_coverings | Official racket coverings (rubbers) approval | **Official approval** — coverings | Same SPA/`#` caveats as approval list. |
| `tt-spin-rubbers` | https://www.tt-spin.com/table-tennis-rubbers/ | Rubber catalog / photos | **Catalog photos** — rubbers (secondary) | Respect robots and commercial ToS; rate-limit strictly. |
| `prott-rubbers` | https://www.prott.vip/Product-List.aspx?producttype=2 | Rubber product list | **Catalog photos** — rubbers | ASP.NET list pages; may need pagination query params. |
| `prott-blades` | https://www.prott.vip/Product-List.aspx?producttype=12 | Blade product list | **Catalog photos** — blades | Same as rubbers list pattern. |
| `dandoy-blades` | https://www.dandoy-sports.com/blades.html | Blade catalog | **Primary live photos** — blades | **Live parser** (`pnpm scrape -- --source=dandoy-blades --no-dry-run --fetch-listing --download-images --publish`). |
| `dandoy-rubbers` | https://www.dandoy-sports.com/rubbers.html | Rubber catalog | **Catalog photos** — rubbers (secondary) | Same Magento pattern as blades; parser TODO. |

### Role legend

| Role | Meaning |
|------|---------|
| **Primary catalog photos** | Prefer for owned gallery bootstrap (ADR-008 photography-first). |
| **Secondary catalog photos** | Fill gaps / alternate angles; lower scrape priority. |
| **Reviews** | Enrich narrative; do not treat as sole product identity. |
| **Official approval** | ITTF status / covering lists — normalize as approval facts, not shop inventory. |

---

## ITTF SPA / API unknown

Routes under `equipment.ittf.com` use client-side `#` navigation. A naive HTTP GET of the hash URL often returns a shell without equipment rows.

**Open work for operators:**

1. Open DevTools → Network while browsing Approval / Racket coverings.
2. Record JSON/XHR endpoints, auth headers (if any — none expected for public lists), and pagination.
3. Add discovered URLs to the corresponding source module comments and enable a **rate-limited** fetch mode only after robots/ToS review.

Until discovery lands, `ittf-*` sources **must** stay dry-run / stub.

---

## How sources feed local search (ADR-010)

1. Operator runs `pnpm --filter @ttsetupbuilder/scrapers scrape -- --source=<id>` (default dry-run).
2. Live runs (explicit flags) write raw + normalized JSON under `scrapers/data/` and images under owned paths.
3. Publish / copy a catalog snapshot to `apps/web/public/data/catalog.json` (and images under `apps/web/public/catalog/`).
4. The SPA loads that JSON and Fuse.js searches **local** fields only — no third-party calls.
