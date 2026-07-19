# ADR-005: State Management — Query, Zustand, Context Roles

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-07-19 |
| **Depends on** | [ADR-002](./ADR-002-tech-stack.md) |

## Context

React Context is often overused for everything (catalog data, filters, modals, theme), which causes unnecessary re-renders and unclear ownership. The stack already includes TanStack Query and Zustand (ADR-002); we need a hard split so agents do not invent a fourth global store or put server data in Context.

## Decision

| Concern | Tool | Examples |
|---------|------|----------|
| **Server / local catalog data** | **TanStack Query** | Product lists, product detail, players, search index payloads, normalized JSON/catalog fetches |
| **Client UI state** | **Zustand** | Compare tray selection, builder draft UI flags, modals, non-URL ephemeral UI |
| **Theme only** | **React Context** | Dark theme provider / design tokens bridge |

**Nobody uses Context for everything.** Do not put catalog entities, search results, or builder equipment graphs in Context. Do not put fetchable catalog data primarily in Zustand when TanStack Query is the fit.

URL-shareable exploration state (filters, compare sets, builds) prefers the router/URL (ADR-006) over opaque store-only state where practical.

## Consequences

### Positive

- Predictable caching, stale-while-revalidate, and loading/error patterns via Query.
- Lightweight UI state without Context re-render storms.
- Theme remains a narrow Context use case.

### Negative

- Contributors must learn the split; mixing tools incorrectly is a review reject.
- Some UI that feels “global” still belongs in Zustand or URL, not Context.

## Related docs

- [ADR-002](./ADR-002-tech-stack.md)
- [ADR-006](./ADR-006-routing.md)
- [ADR-010](./ADR-010-search.md)
- [ADR-011](./ADR-011-builder.md)
- [`docs/ui/DESIGN_SYSTEM.md`](../ui/DESIGN_SYSTEM.md) — theme; overridden to dark-only by ADR-007
