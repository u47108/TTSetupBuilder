# ADR-003: Frontend Architecture — Feature First

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-07-19 |
| **Depends on** | [ADR-002](./ADR-002-tech-stack.md) |

## Context

Framework docs and many scaffolds encourage **Pages**-centric trees (`pages/`, App Router `app/` route folders as the primary organization) or classic **MVC**-like splits (`models/`, `views/`, `controllers/`). For a photography-first catalog with builder, compare, search, and players, those layouts scatter a single feature across unrelated directories and make ownership unclear.

We need a structure that scales with features (products, players, builder, search) on a Vite + React SPA (ADR-002), without Next.js route-file conventions.

## Decision

Organize the frontend **Feature First**.

| Rule | Meaning |
|------|---------|
| **Feature First** | Code lives under feature modules (e.g. `features/products`, `features/builder`, `features/search`). |
| **No MVC** | Do not structure the app as models / views / controllers folders. |
| **No Pages folder** | Do not use a top-level `pages/` (or Next-style `app/` route tree) as the primary organization. Routes compose features; they do not own the domain code. |

Typical feature module contents (illustrative, not mandatory filenames):

```text
features/<feature>/
  components/
  hooks/
  api/ or queries/
  store/          # Zustand slices when needed
  types/
  <Feature>Page.tsx or routes entry composed by the router
```

Shared UI primitives and design-system building blocks may live in shared packages or `shared/` / `packages/ui`, but **domain behavior stays in features**.

Routing (ADR-006) mounts feature screens; it does not dictate folder layout.

## Consequences

### Positive

- Clear ownership: a feature change stays mostly inside one tree.
- Easier for agents to locate “where products live” without hunting across MVC layers.
- Aligns with SPA composition rather than framework file-based routing.

### Negative

- Shared cross-feature concerns need discipline (extract shared carefully; avoid barrel abuse — ADR-013).
- Contributors used to `pages/` scaffolds must unlearn that layout.

## Related docs

- [ADR-002](./ADR-002-tech-stack.md)
- [ADR-006](./ADR-006-routing.md)
- [ADR-013](./ADR-013-code-style.md)
- [`docs/architecture/FRONTEND_ARCHITECTURE.md`](../architecture/FRONTEND_ARCHITECTURE.md) — historical Next.js structure; Feature First + Vite supersede conflicting layout guidance
- [`docs/ui/COMPONENT_LIBRARY.md`](../ui/COMPONENT_LIBRARY.md)
