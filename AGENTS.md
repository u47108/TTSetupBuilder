# AGENTS.md — TTSetupBuilder

Instructions for AI coding agents and human contributors working in this repository.

## Read first (in order)

1. **ADRs** — [`docs/adr/`](./docs/adr/) (**source of truth** for architecture)
2. [`README.md`](./README.md)
3. [`docs/PRODUCT_VISION.md`](./docs/PRODUCT_VISION.md)
4. [`docs/FUNCTIONAL_REQUIREMENTS.md`](./docs/FUNCTIONAL_REQUIREMENTS.md)
5. [`docs/DATA_MODEL.md`](./docs/DATA_MODEL.md)
6. [`docs/architecture/FRONTEND_ARCHITECTURE.md`](./docs/architecture/FRONTEND_ARCHITECTURE.md) — **superseded by ADRs where conflicting** (especially Next.js / SSR; see [ADR-002](./docs/adr/ADR-002-tech-stack.md))
7. [`docs/ui/DESIGN_SYSTEM.md`](./docs/ui/DESIGN_SYSTEM.md) — visual language; **dark-only overrides** light-theme future notes ([ADR-007](./docs/adr/ADR-007-ui-design.md))
8. [`docs/ui/COMPONENT_LIBRARY.md`](./docs/ui/COMPONENT_LIBRARY.md)

Also read [ADR-014](./docs/adr/ADR-014-offline-first-data-ownership.md) early: offline-first and data ownership constrain scrapers, images, and the frontend.

## Non-negotiable rules

- **Never violate an ADR.** If implementation would conflict with an Accepted ADR, **stop and explain** the conflict instead of “just coding around it.”
- **Architecture decisions always have priority over generated code.** Prefer changing a proposal or opening an ADR amendment over shipping code that contradicts Accepted ADRs.
- This product is a **visual database**, not ecommerce ([ADR-001](./docs/adr/ADR-001-project-scope.md)).
- **Photography first**; no hotlinked third-party images ([ADR-008](./docs/adr/ADR-008-image-strategy.md)).
- Frontend is **Vite + React SPA**, Feature First — not Next.js Pages/App Router as the app framework ([ADR-002](./docs/adr/ADR-002-tech-stack.md), [ADR-003](./docs/adr/ADR-003-frontend-architecture.md)).
- Do not add major libraries without updating [ADR-002](./docs/adr/ADR-002-tech-stack.md) (or a superseding ADR).
- Frontend consumes **owned/local data only** at runtime ([ADR-009](./docs/adr/ADR-009-data-source-strategy.md), [ADR-014](./docs/adr/ADR-014-offline-first-data-ownership.md)).

## Documentation vs code

Prefer updating docs/ADRs when decisions change. Do not invent ecommerce UI, light theme (for now), or SSR stacks that contradict Accepted ADRs.
