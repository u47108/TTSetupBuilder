# ADR-002: Tech Stack — Vite + React SPA

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-07-19 |
| **Supersedes** | Prior Next.js 15 / App Router / SSR assumptions in root `README.md` and [`docs/architecture/FRONTEND_ARCHITECTURE.md`](../architecture/FRONTEND_ARCHITECTURE.md) |

## Context

Earlier documentation described a **Next.js 15 App Router** frontend with RSC-first defaults, SSR/ISR, and Next-specific caching. Product needs for the first shippable app do **not** require SSR: the catalog is owned locally (see ADR-009 / ADR-014), deployment targets include static hosts (**GitHub Pages**, **Cloudflare Pages**), and the preferred developer experience is fast HMR with a simple SPA pipeline.

Those Next.js assumptions are **superseded** by this ADR. Where older docs conflict, **this ADR wins**.

## Decision

We adopt the following stack for the web application:

| Layer | Choice |
|-------|--------|
| UI library | **React 19** |
| Bundler / dev server | **Vite** |
| Language | **TypeScript** |
| Styling | **TailwindCSS** |
| Server/local catalog data | **TanStack Query** |
| Client UI state | **Zustand** |
| Routing | **React Router** |
| Motion | **Framer Motion** |
| Runtime | **Node.js 22 LTS** |
| Package manager | **pnpm** |

**Architecture shape:** a **SPA** (Single Page Application). **No SSR is required** for the accepted product path.

**Deployment:** static-asset hosting compatible with **GitHub Pages** and **Cloudflare Pages** (and similar CDN/static hosts).

### Explicit non-choices (for now)

- Next.js / App Router / RSC as the application framework
- SSR/ISR as a default delivery model
- Alternative package managers as the project standard (npm/yarn may appear in docs only as non-canonical)

Any addition of a major library (new framework, state library, CSS system, router, or test runner) requires updating this ADR (or a superseding ADR) **before** adoption in code.

## Consequences

### Positive

- Fast HMR and a simple mental model for contributors and agents.
- Static deployment without a Node server at the edge for HTML rendering.
- Fits offline-first / local JSON catalog consumption (ADR-009, ADR-010, ADR-014).
- Clear package manager and Node version for CI and local setup.

### Negative

- No built-in SSR/SEO HTML per route; SEO must rely on static hosting strategies, prerender (if later ADR), or client-side metadata — not Next.js defaults.
- Existing Next.js-oriented sections in [`FRONTEND_ARCHITECTURE.md`](../architecture/FRONTEND_ARCHITECTURE.md) are outdated until rewritten; treat them as historical until aligned.
- Agents must not scaffold `create-next-app` or introduce App Router conventions unless a new ADR reopens the stack.

## Related docs

- [`docs/adr/README.md`](./README.md) — ADR index and supersession note
- [`docs/architecture/FRONTEND_ARCHITECTURE.md`](../architecture/FRONTEND_ARCHITECTURE.md) — superseded where conflicting
- [ADR-003](./ADR-003-frontend-architecture.md) — Feature First layout on this stack
- [ADR-005](./ADR-005-state-management.md) — Query / Zustand / Context split
- [ADR-006](./ADR-006-routing.md) — React Router routes
- [ADR-012](./ADR-012-testing.md) — Vitest / Playwright on Vite
