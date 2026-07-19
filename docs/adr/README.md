# Architecture Decision Records (ADRs)

**Canonical location for architecture decisions.** ADRs are the **source of truth** for TTSetupBuilder. If another document conflicts with an Accepted ADR, the **ADR wins**.

> **Supersession notice (2026-07-19):** [ADR-002](./ADR-002-tech-stack.md) adopts **Vite + React 19 SPA** (no SSR required). Prior **Next.js 15 / App Router / SSR / RSC-first** assumptions in [`docs/architecture/FRONTEND_ARCHITECTURE.md`](../architecture/FRONTEND_ARCHITECTURE.md) and older README technology lists are **superseded**. Do not scaffold Next.js unless a new ADR reopens the stack.

## How to use ADRs

1. Read [ADR-001](./ADR-001-project-scope.md) through [ADR-014](./ADR-014-offline-first-data-ownership.md) before implementing features.
2. **Never violate an Accepted ADR** in code. If implementation would conflict, stop and propose an ADR change instead.
3. New significant decisions: copy [ADR-000-template.md](./ADR-000-template.md), pick the next number, set Status to `Proposed`, open a PR.
4. Only mark `Accepted` after review. Use `Deprecated` / `Superseded` with links when replacing a decision.

## Index

| ID | Title | Status | Date |
|----|-------|--------|------|
| [ADR-000](./ADR-000-template.md) | Template | — | — |
| [ADR-001](./ADR-001-project-scope.md) | Project Scope — Visual Database, Not Ecommerce | Accepted | 2026-07-19 |
| [ADR-002](./ADR-002-tech-stack.md) | Tech Stack — Vite + React SPA | Accepted | 2026-07-19 |
| [ADR-003](./ADR-003-frontend-architecture.md) | Frontend Architecture — Feature First | Accepted | 2026-07-19 |
| [ADR-004](./ADR-004-data-model.md) | Data Model — Multiplicity First | Accepted | 2026-07-19 |
| [ADR-005](./ADR-005-state-management.md) | State Management — Query, Zustand, Context Roles | Accepted | 2026-07-19 |
| [ADR-006](./ADR-006-routing.md) | Routing — SPA Canonical Paths | Accepted | 2026-07-19 |
| [ADR-007](./ADR-007-ui-design.md) | UI Design — Dark-Only, Photography First | Accepted | 2026-07-19 |
| [ADR-008](./ADR-008-image-strategy.md) | Image Strategy — Owned Assets, No Hotlinking | Accepted | 2026-07-19 |
| [ADR-009](./ADR-009-data-source-strategy.md) | Data Source Strategy — Scrape, Normalize, Serve Locally | Accepted | 2026-07-19 |
| [ADR-010](./ADR-010-search.md) | Search — Fuse.js, Offline-First, Client-Side | Accepted | 2026-07-19 |
| [ADR-011](./ADR-011-builder.md) | Builder — Compose Blade + FH + BH Dynamically | Accepted | 2026-07-19 |
| [ADR-012](./ADR-012-testing.md) | Testing — Vitest, RTL, Playwright, Coverage Gate | Accepted | 2026-07-19 |
| [ADR-013](./ADR-013-code-style.md) | Code Style — Strict TypeScript and Workflow Conventions | Accepted | 2026-07-19 |
| [ADR-014](./ADR-014-offline-first-data-ownership.md) | Offline-First & Data Ownership | Accepted | 2026-07-19 |

## Proposing changes

1. Open a PR that adds or updates an ADR under `docs/adr/`.
2. Summarize context, decision, and consequences; link related docs under `docs/`.
3. Update this index table and [`CHANGELOG.md`](../../CHANGELOG.md) under Unreleased when Accepted.
4. If the change supersedes another ADR or older architecture doc, say so explicitly in the new ADR (see ADR-002).

## Related

- Agent instructions: [`AGENTS.md`](../../AGENTS.md)
- Legacy pointer: [`docs/decisions/README.md`](../decisions/README.md) → this folder
- Product docs: [`PRODUCT_VISION.md`](../PRODUCT_VISION.md), [`DATA_MODEL.md`](../DATA_MODEL.md), [`NAVIGATION.md`](../NAVIGATION.md)
