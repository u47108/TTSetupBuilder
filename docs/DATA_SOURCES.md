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
| **Images** | Download to owned disk (`apps/web/public/catalog/` or `scrapers/images/`); content-hash filenames; never use remote URLs as `<img src>` in the app. **Blades: no studio knockout** (JPEG + plate kept) — pale wood edges are destroyed by white/black flood-fill + fringe scrub. |
| **Stock ≠ catalog** | TTSetupBuilder is **not** a shop. Keep discontinued / “no disponible” / long-out-of-stock gear when a product page still exists — players still use blades bought years ago. Do not filter ingestion by buyability. |

---

## Source registry

| Source id | URL | Provides | Priority / role | Notes |
|-----------|-----|----------|-----------------|-------|
| `tt11-blades-penholder` | https://tabletennis11.com/en/blades-penholder | Penholder blades, product photos, retail attributes | **Catalog photos** (secondary) | **Cloudflare blocked** for automated GET (2026-07). |
| `tt11-blades` | https://tabletennis11.com/en/blades | Blades (shakehand), photos, specs | **Primary intent** — blades | **Cloudflare blocked** for automated GET. Prefer `dandoy-blades` for live ingestion. |
| `tt11-rubbers` | https://tabletennis11.com/en/rubbers | Rubbers, photos, sponge options | **Primary intent** — rubbers | **Cloudflare blocked** for automated GET. |
| `tabletennis-reviews` | https://tabletennis-reviews.com/ | Community / editorial reviews, product mentions | **Reviews & qualitative context** (not primary photo inventory) | **Different site** from Tabletennis Reference. Useful for review text and cross-links; media may be sparse or third-party — only keep owned downloads. |
| `tabletennis-reference-rubbers` | https://tabletennis-reference.com/rubber (home: [/](https://tabletennis-reference.com/)) | Rubber photos, community ratings/reviews, discontinued PDPs | **Secondary catalog photos** + **reviews** | **Not** `tabletennis-reviews.com`. Batch only (ADR-008/009/014). Stock ≠ catalog. Dry-run plans listing + seeds; **live** = explicit PDP seeds (`img` under `/images/rubber/`, prefer `*_450.jpg`). Multi-page crawl TODO. Operators must check robots.txt + ToS. Caveat: detail/439 titled “Bruce T1” but packaging/ITTF = **Blues T1** (21-043). |
| `tabletennis-reference-rackets` | https://tabletennis-reference.com/racket (home: [/](https://tabletennis-reference.com/)) | Blade/racket photos + reviews, discontinued PDPs | **Secondary catalog photos** + **reviews** | Same site family as rubbers. Dry-run plans listing + seeds; **live** = explicit PDP seeds (Ai Fukuhara PRO ZLF detail/226 `[Discontinued]`, Viscaria detail/858). Parses `[Discontinued]` → `discontinued: true`. Multi-page crawl TODO. Batch only; robots/ToS check required. |
| `ttgearlab-database` | https://ttgearlab.com/category/database/ | Gear database / measured or catalogued equipment | **Specs / lab-oriented catalog** | Category archive; confirm pagination and image rights before bulk download. |
| `ittf-equipment-approval` | https://equipment.ittf.com/#/equipment/approval (+ API) | Official ITTF equipment approval lists | **Official approval** (authoritative status) | Batch via `ittf-admin-api.azurewebsites.net`. SPA `#` routes are UI only. See [ITTF API](#ittf-api--racket-coverings-monitor) below. |
| `ittf-racket-coverings` | https://equipment.ittf.com/#/equipment/racket_coverings (+ API) | Official racket coverings (rubbers) approval | **Official approval** — coverings | **Live API** `Equipment_RacketCoverings/all_list`. Annotates `ittfApproval` on catalog rubbers. |
| `tt-spin-rubbers` | https://www.tt-spin.com/table-tennis-rubbers/ | Rubber catalog / photos | **Catalog photos** — rubbers (secondary) | Respect robots and commercial ToS; rate-limit strictly. |
| `prott-rubbers` | https://www.prott.vip/Product-List.aspx?producttype=2 | Rubber product list | **Catalog photos** — rubbers | ASP.NET list pages; may need pagination query params. |
| `prott-blades` | https://www.prott.vip/Product-List.aspx?producttype=12 | Blade product list | **Catalog photos** — blades | Same as rubbers list pattern. |
| `dandoy-blades` | https://www.dandoy-sports.com/blades.html | Blade catalog | **Primary live photos** — blades | **Live** — multi-page Magento crawl (`--max-pages=5`). |
| `dandoy-rubbers` | https://www.dandoy-sports.com/rubbers.html | Rubber catalog | **Primary live photos** — rubbers | **Live** — same Magento pattern; publish merges with blades. |
| `vpsport-gomas-lisas` | https://www.vpsport.cl/gomas-lisas | Inverted rubbers | **Primary live** — rubbers (CL) | **Live** — Jumpseller; `?page=N`; thumbs ≤720. |
| `vpsport-maderos-clasicos` | https://www.vpsport.cl/maderos-clasicos | Classic blades | **Primary live** — blades (CL) | **Live** — Jumpseller. |
| `vpsport-maderos-japones` | https://www.vpsport.cl/maderos-japones | Japanese-style blades | **Secondary live** — blades | **Live** — Jumpseller. |
| `vpsport-maderos-lapiceros` | https://www.vpsport.cl/maderos-lapiceros | Penhold blades | **Secondary live** — blades | **Live** — Jumpseller. |
| `vpsport-poros-cortos` | https://www.vpsport.cl/poros-cortos | Short pips | **Secondary live** — rubbers | **Live** — Jumpseller. |
| `vpsport-poros-largos` | https://www.vpsport.cl/poros-largos | Long pips | **Secondary live** — rubbers | **Live** — Jumpseller. |
| `vpsport-gomas-anti-topspin` | https://www.vpsport.cl/gomas/anti-topspin | Anti-topspin rubbers | **Secondary live** — rubbers | **Live** — Jumpseller. |
| `zonatt-maderas` | https://www.zonatt.com/sitemap.php (+ category) | Blades (ES) | **Primary live** — blades | **Live** — inventory from **sitemap** (~175 PDPs, incl. OOS); listing/ajax only for mango hints; extras for PDPs missing from sitemap; PDP `og:image`. |
| `zonatt-gomas` | https://www.zonatt.com/sitemap.php (+ category) | Rubbers (ES) | **Primary live** — rubbers | **Live** — sitemap (~441 PDPs, incl. OOS); ajax `Id=1`; priority Hurricane 3 Neo Provincial Blue Sponge 39 + Killer Pro. |
| `cl-rubber-seeds` | Bushido / Foxhara PDPs | Rubbers (CL) | **Secondary** — seeds | **Live** — explicit WooCommerce PDPs only (H3 Neo variants). TT11 remains Cloudflare-blocked. |

### Role legend

| Role | Meaning |
|------|---------|
| **Primary catalog photos** | Prefer for owned gallery bootstrap (ADR-008 photography-first). |
| **Secondary catalog photos** | Fill gaps / alternate angles; lower scrape priority. |
| **Reviews** | Enrich narrative; do not treat as sole product identity. |
| **Official approval** | ITTF status / covering lists — normalize as approval facts, not shop inventory. |

---

## ITTF API — racket coverings monitor

Official approval data lives on **`https://ittf-admin-api.azurewebsites.net`** (Swagger: `/swagger/docs/v1`). The SPA at `equipment.ittf.com` is UI only — prefer the admin API for batch ingestion.

### Endpoints (verified 2026-07)

| Endpoint | Notes |
|----------|--------|
| `GET /api/Equipment_RacketCoverings/all_list` | Paginated coverings. **Requires** `custom_filter=[]` and a real `sortby` (e.g. `BrandName`). Returns `{ rows, Count }`. |
| `GET /api/Download/Equipment_RacketCoverings` | Same list shape; useful for exports. |
| `GET /api/Equipment_RacketCovering/{id}/Details` | Full detail for one covering. |
| `GET /api/Equipment_Balls/all_list` | Balls — use `sortby=EquipmentBallId` + `custom_filter=[]`. |
| `GET /api/Equipment_Tables/all_list` | Tables — `sortby=EquipmentTableId`. |
| `GET /api/Equipment_Nets/all_list` | Nets — `sortby=EquipmentNetId`. |
| `GET /api/Equipment_Floors/all_list` | Floors — `sortby=EquipmentFloorId`. |
| `GET /api/EquipmentTypes/all_list` | Types: Balls, Rackets, Nets, Floors, Tables, Racket Coverings, Net Gauges. |

There is **no** dedicated Blades / Adhesives controller in the public swagger. “Rackets” exists as an equipment type but `Equipments/all_list` returned empty in discovery.

### Row shape (racket coverings)

Key fields: `EquipmentCode`, `ApprovalStatus`, `IsActive`, `ExpiresOn`, `BrandName`, `EquipmentName`, `ImageList`, `PimpleType`, `EquipmentRacketCoveringId`.

- **Stable key for diffs:** `EquipmentCode` when present; otherwise `EquipmentRacketCoveringId`.
- **Not homologated:** `ApprovalStatus=false` and/or empty/`null` `EquipmentCode` (SPA shows Approval Code `-`, e.g. many Prasidha models).

### Catalog annotation (`ittfApproval`)

Batch CLI annotates `category=rubber` products in `apps/web/public/data/catalog.json`:

```json
"ittfApproval": {
  "status": "approved | not_found | not_approved | expired | inactive",
  "equipmentCode": "21-043",
  "matchedName": "Blues T1",
  "matchedBrand": "Donic",
  "matchMethod": "brandNameExact",
  "snapshotDate": "2026-07-19",
  "reason": "…",
  "approvalStatus": true,
  "isActive": true,
  "expiresOn": "2026-12-31T00:00:00",
  "topSheetColors": ["Red", "Black"],
  "spongeColors": [],
  "colors": ["Red", "Black"],
  "oxVersion": null,
  "pimpleType": "In"
}
```

Match order: explicit `equipmentCode` → exact Brand+Name → fuzzy Brand+Name. The SPA **only reads this local field** (ADR-014) — never calls ITTF at runtime.

Listing dimensions come from the snapshot row (`ColorsList`, `HasOXVersion`, `ExpiresOn`, `ApprovalStatus`, `IsActive`, `PimpleType`). The ITTF `all_list` API does **not** split top-sheet vs sponge; we treat Red/Black as top sheet and other `ColorsList` tokens as sponge so players can verify the covering *as listed* (players often change sponge).

Alert statuses (amber UI): `not_found`, `not_approved`, `expired`, `inactive`. Approved matches still show a quiet checklist (code / colors / Ox / expiry).

### Catalog field (`discontinued`)

Set **at scrape/normalize time** when ingesting a PDP — not inferred later in the SPA from the display name.

Tabletennis Reference: `isTabletennisReferenceDiscontinued(html)` looks for `[Discontinued]` on the product `h2` (site `h1` is the banner) and/or `schema.org/Discontinued` on the Offer. The marker is stripped from `name`; `normalizeProduct` writes `discontinued: true` onto the catalog row. Stock ≠ catalog — discontinued models stay in the visual archive. The builder/detail UI only reads this owned field (ADR-014).

### Commands

```bash
# Nightly: fetch full list + diff vs previous day + annotate catalog rubbers
pnpm --filter @ttsetupbuilder/scrapers ittf -- run

# Or step by step
pnpm --filter @ttsetupbuilder/scrapers ittf -- snapshot
pnpm --filter @ttsetupbuilder/scrapers ittf -- diff
pnpm --filter @ttsetupbuilder/scrapers ittf -- annotate --seed-fixtures

# Offline UI QA (Prasidha without Approval Code)
pnpm --filter @ttsetupbuilder/scrapers ittf -- seed-fixtures
```

Artifacts: `scrapers/data/ittf/snapshots/YYYY-MM-DD.json`, `scrapers/data/ittf/reports/*-diff.json`, `*-catalog-approval.json`.

### Future (design only — not implemented)

- History API / multi-day timelines beyond dated snapshots
- Alerts: email / Telegram / Discord / RSS from diff reports
- Blade approval if/when a public list endpoint appears

---

## How sources feed local search (ADR-010)

1. Operator runs `pnpm --filter @ttsetupbuilder/scrapers scrape -- --source=<id>` (default dry-run).
2. Live runs (explicit flags) write raw + normalized JSON under `scrapers/data/` and images under owned paths.
3. Publish / copy a catalog snapshot to `apps/web/public/data/catalog.json` (and images under `apps/web/public/catalog/`).
4. The SPA loads that JSON and Fuse.js searches **local** fields only — no third-party calls.
