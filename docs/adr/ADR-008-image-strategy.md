# ADR-008: Image Strategy — Owned Assets, No Hotlinking

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-07-19 |

## Context

Hotlinking product images from third-party sites (e.g. retailer or catalog sites such as TT11 / ProTT patterns) is brittle: broken URLs, hotlink protection, TOS risk, and poor performance. A photography-first app cannot treat remote hotlinks as the media pipeline.

## Decision

| Rule | Detail |
|------|--------|
| **Never hotlink** | Do not use third-party image URLs as runtime `src` for product media. |
| **Owned storage** | Every image belongs to the **local repository** and/or **owned storage** under TTSetupBuilder control. |
| **Derivatives** | Generate **thumbnails**, **WebP** (and other agreed formats), and **multiple resolutions**. |
| **Loading** | Use **lazy loading** for off-screen images; prioritize LCP candidates intentionally. |

Ingestion may copy/normalize images via scrapers (ADR-009); the frontend only serves owned assets. Avoid repeating historical hotlink failures from external TT equipment sites.

## Consequences

### Positive

- Stable galleries and predictable performance.
- Rights/provenance can be tracked with owned files (align DATA_MODEL media).
- Offline-friendly and static-host friendly.

### Negative

- Storage and pipeline cost (download, convert, version).
- Bootstrap needs an image pipeline before rich catalogs look complete.

## Related docs

- [`docs/DATA_MODEL.md`](../DATA_MODEL.md)
- [ADR-004](./ADR-004-data-model.md)
- [ADR-009](./ADR-009-data-source-strategy.md)
- [ADR-014](./ADR-014-offline-first-data-ownership.md)
- [`docs/ui/DESIGN_SYSTEM.md`](../ui/DESIGN_SYSTEM.md)
