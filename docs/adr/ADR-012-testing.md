# ADR-012: Testing — Vitest, RTL, Playwright, Coverage Gate

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-07-19 |
| **Depends on** | [ADR-002](./ADR-002-tech-stack.md) |

## Context

A Vite + React SPA needs a testing stack that fits the toolchain (not Jest-first Next defaults) and a clear quality bar before features merge.

## Decision

| Layer | Tool |
|-------|------|
| Unit / component | **Vitest** |
| Component testing utilities | **React Testing Library (RTL)** |
| E2E | **Playwright** |
| Coverage | **> 80%** (project gate; configure in CI when app exists) |

Prefer testing behavior users care about (RTL) over implementation details. E2E covers critical flows: browse, search, product detail, compare, builder composition.

## Consequences

### Positive

- Native fit with Vite.
- Explicit coverage expectation for agents and CI.
- Separates fast unit tests from browser E2E.

### Negative

- Coverage >80% is a discipline cost; some UI chrome may need pragmatic exclusions documented in config — not silent lowering of the gate without ADR update.
- Playwright CI time must be budgeted.

## Related docs

- [ADR-002](./ADR-002-tech-stack.md)
- [ADR-013](./ADR-013-code-style.md)
- [`docs/roadmap/DEVELOPMENT_ROADMAP.md`](../roadmap/DEVELOPMENT_ROADMAP.md)
