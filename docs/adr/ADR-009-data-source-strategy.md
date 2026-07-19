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
TT11 (and similar sources) → Scraper → Normalize → JSON → Database → Frontend
```

| Rule | Detail |
|------|--------|
| **Import offline/batch** | Scrapers collect and normalize into owned artifacts (JSON / DB). |
| **Frontend consumes owned data** | The SPA reads local/owned APIs or static JSON — never live third-party HTML/APIs as the product catalog. |
| **No runtime third-party catalog** | **Never** consume third-party websites directly at runtime for product metadata or images. |

External sites are **ingestion inputs**, not runtime dependencies.

## Consequences

### Positive

- Deterministic demos and deploys; works with static hosting.
- Normalization can enforce ADR-004 multiplicity and confidence fields.
- Clear separation of `scrapers/` vs `apps/web`.

### Negative

- Catalog freshness depends on scraper schedule, not live scrape-on-view.
- Engineering cost for normalize + storage before the UI is “full.”

## Related docs

- [ADR-008](./ADR-008-image-strategy.md)
- [ADR-014](./ADR-014-offline-first-data-ownership.md)
- [`docs/DATA_MODEL.md`](../DATA_MODEL.md)
- [`docs/PRODUCT_VISION.md`](../PRODUCT_VISION.md)
- [`docs/roadmap/DEVELOPMENT_ROADMAP.md`](../roadmap/DEVELOPMENT_ROADMAP.md)
