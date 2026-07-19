# ADR-014: Offline-First & Data Ownership

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-07-19 |

## Context

Third-party equipment websites are valuable for **ingestion** but unreliable as **runtime dependencies** (uptime, HTML changes, hotlink protection, legal/TOS). TTSetupBuilder’s product promise is a durable visual database under our control.

## Decision

| Principle | Normative rule |
|-----------|----------------|
| **Ownership** | All product **metadata** used by the app belongs to **TTSetupBuilder** (normalized, stored locally / in owned systems). |
| **No runtime third-party dependency** | The app **never** depends on third-party websites being reachable at runtime for catalog data or images. |
| **Import path** | External data enters only via **scrapers → normalize → local storage** (JSON/DB/media). |
| **Frontend contract** | The frontend **only consumes local / owned data** (APIs or static assets we publish). |
| **External sites’ role** | External sites are **data sources for import**, never runtime dependencies. |

This ADR is the umbrella for [ADR-008](./ADR-008-image-strategy.md), [ADR-009](./ADR-009-data-source-strategy.md), and [ADR-010](./ADR-010-search.md).

## Consequences

### Positive

- Static hosting and offline-friendly snapshots are viable.
- Broken retailer sites do not take down the product experience.
- Clear legal/engineering story: we store what we serve.

### Negative

- Freshness is a pipeline concern, not “always live scrape.”
- Storage and rights tracking are mandatory (media provenance).

## Related docs

- [ADR-001](./ADR-001-project-scope.md)
- [ADR-008](./ADR-008-image-strategy.md)
- [ADR-009](./ADR-009-data-source-strategy.md)
- [ADR-010](./ADR-010-search.md)
- [`docs/DATA_MODEL.md`](../DATA_MODEL.md)
- [`docs/PRODUCT_VISION.md`](../PRODUCT_VISION.md)
