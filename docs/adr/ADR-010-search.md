# ADR-010: Search — Fuse.js, Offline-First, Client-Side

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-07-19 |
| **Depends on** | [ADR-002](./ADR-002-tech-stack.md), [ADR-009](./ADR-009-data-source-strategy.md) |

## Context

Catalog search must feel instant for exploration and remain usable without depending on a third-party search SaaS or live remote catalog. Owned local data (ADR-009 / ADR-014) enables client-side search.

## Decision

| Decision | Detail |
|----------|--------|
| **Library** | **Fuse.js** for fuzzy client-side search |
| **Offline first** | Search runs against **local / owned** catalog data already available to the app |
| **Instant search** | Results update as the user types (debouncing as needed for performance) |
| **Client side** | No mandatory round-trip to an external search service for core catalog search |

Server-side or hosted search may be proposed later via a new ADR if scale demands it; until then Fuse.js + local data is canonical. Route: `/search` (ADR-006).

## Consequences

### Positive

- Instant UX aligned with photography-first browsing.
- Works with static hosting and offline-friendly packaging of catalog snapshots.
- No runtime coupling to external search vendors.

### Negative

- Index size and memory bound client capability; very large catalogs may need pagination/sharding strategies or a future ADR.
- Fuse.js must be listed/aligned with ADR-002 when introduced in package.json (treat as accepted search dependency of this ADR).

## Related docs

- [ADR-006](./ADR-006-routing.md)
- [ADR-009](./ADR-009-data-source-strategy.md)
- [ADR-014](./ADR-014-offline-first-data-ownership.md)
- [`docs/NAVIGATION.md`](../NAVIGATION.md)
- [`docs/FUNCTIONAL_REQUIREMENTS.md`](../FUNCTIONAL_REQUIREMENTS.md)
