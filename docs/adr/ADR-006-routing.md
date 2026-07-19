# ADR-006: Routing — SPA Canonical Paths

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-07-19 |
| **Depends on** | [ADR-002](./ADR-002-tech-stack.md), [ADR-003](./ADR-003-frontend-architecture.md) |

## Context

[`docs/NAVIGATION.md`](../NAVIGATION.md) defines a rich information architecture (equipment hubs, collections, videos, admin, account, etc.). For the SPA bootstrap we need a **canonical initial route set** that is stable for React Router and agents, without blocking later expansion.

## Decision

**Canonical SPA routes** (React Router):

| Path | Purpose |
|------|---------|
| `/` | Home / explore |
| `/products` | Product catalog browse |
| `/products/:slug` | Product detail |
| `/players` | Player index |
| `/players/:slug` | Player profile |
| `/brands` | Brand index |
| `/search` | Dedicated search |
| `/compare` | Compare workspace |
| `/builder` | Racket builder |

These paths are **canonical for the SPA** when they conflict with older or broader IA sketches. Align with [`docs/NAVIGATION.md`](../NAVIGATION.md) where possible (jobs, chrome, anti-patterns), but **ADR-006 wins** for the path strings above (e.g. `/products` as the catalog browse entry rather than only `/equipment`).

### Future / non-blocking

Routes such as `/admin/*`, `/account/*`, `/videos`, `/collections`, brand detail (`/brands/:slug`), saved builds (`/builder/:buildId`), etc. may be added later. They should follow NAVIGATION jobs and ADR-001 (no ecommerce chrome) and do not require changing this ADR unless they conflict with the table above.

## Consequences

### Positive

- Clear bootstrap surface for Feature First screens (ADR-003).
- Shareable URLs for core exploration verbs.
- Agents have a fixed list to implement first.

### Negative

- NAVIGATION’s fuller sitemap is not all implemented at once; docs must not be read as “every path exists today.”
- Renames (e.g. equipment vs products) need an ADR update if we change the canonical table.

## Related docs

- [`docs/NAVIGATION.md`](../NAVIGATION.md)
- [ADR-003](./ADR-003-frontend-architecture.md)
- [ADR-010](./ADR-010-search.md)
- [ADR-011](./ADR-011-builder.md)
- [`docs/FUNCTIONAL_REQUIREMENTS.md`](../FUNCTIONAL_REQUIREMENTS.md)
