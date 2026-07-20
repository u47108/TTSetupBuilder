# ADR-009: Data Source Strategy — Scrape, Normalize, Serve Locally

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-07-19 |

## Context

External table tennis catalogs (e.g. TT11) are useful **sources** of structured facts and media candidates, but consuming them directly in the browser at runtime creates fragility, TOS/hotlink risk, and coupling to third-party uptime (see ADR-008, ADR-014).

## Decision

Pipeline:

```text
Approved sources → Scraper → Normalize → JSON → Database / static catalog → Frontend
```

| Rule | Detail |
|------|--------|
| **Import offline/batch** | Scrapers collect and normalize into owned artifacts (JSON / DB). |
| **Frontend consumes owned data** | The SPA reads local/owned APIs or static JSON — never live third-party HTML/APIs as the product catalog. |
| **No runtime third-party catalog** | **Never** consume third-party websites directly at runtime for product metadata or images. |

External sites are **ingestion inputs**, not runtime dependencies.

### Related sources (Accepted amendment — 2026-07-19)

Ingestion is **multi-source**, not TT11-only. The approved registry (images, search-enabling catalog facts, reviews, official approval) is documented in [`docs/DATA_SOURCES.md`](../DATA_SOURCES.md) and implemented under [`scrapers/`](../../scrapers/). Roles:

| Role | Examples (source ids) |
|------|------------------------|
| Primary / secondary **catalog photos** | `tt11-blades`, `tt11-rubbers`, `tt11-blades-penholder`, `prott-*`, `dandoy-*`, `tt-spin-rubbers` |
| **Reviews / qualitative** | `tabletennis-reviews` |
| **Specs / lab database** | `ttgearlab-database` |
| **Official ITTF approval** | `ittf-equipment-approval`, `ittf-racket-coverings` — batch via `ittf-admin-api` (`pnpm ittf`); SPA `#` routes are UI only |

Operators must respect robots.txt / ToS; scrapers default to dry-run and store provenance on every row. Full URL table and ethics policy: [`docs/DATA_SOURCES.md`](../DATA_SOURCES.md), [`scrapers/README.md`](../../scrapers/README.md).

## Consequences

### Positive

- Deterministic demos and deploys; works with static hosting.
- Normalization can enforce ADR-004 multiplicity and confidence fields.
- Clear separation of `scrapers/` vs `apps/web`.
- Multiple complementary sources (photos vs reviews vs official lists) without runtime coupling.

### Negative

- Catalog freshness depends on scraper schedule, not live scrape-on-view.
- Engineering cost for normalize + storage before the UI is “full.”
- Multi-source merge/dedup is required so identity stays canonical.

## Related docs

- [ADR-008](./ADR-008-image-strategy.md)
- [ADR-014](./ADR-014-offline-first-data-ownership.md)
- [`docs/DATA_SOURCES.md`](../DATA_SOURCES.md)
- [`docs/DATA_MODEL.md`](../DATA_MODEL.md)
- [`docs/PRODUCT_VISION.md`](../PRODUCT_VISION.md)
- [`docs/roadmap/DEVELOPMENT_ROADMAP.md`](../roadmap/DEVELOPMENT_ROADMAP.md)
- [`scrapers/README.md`](../../scrapers/README.md)
