# ADR-013: Code Style — Strict TypeScript and Workflow Conventions

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-07-19 |

## Context

Inconsistent style and loose TypeScript (`any`), default exports, and deep barrel files (`index.ts` re-export everything) slow reviews and confuse agents. The project needs enforceable conventions before application bootstrap.

## Decision

| Rule | Detail |
|------|--------|
| **No `any`** | Prefer precise types; use `unknown` + narrowing when necessary. |
| **No default export** | Use named exports only (components, hooks, utilities, pages/screens). |
| **No barrel abuse** | Avoid mega `index.ts` barrels that re-export entire features and create cycles; prefer direct imports or small, intentional public surfaces. |
| **ESLint** | Required; project config when app is bootstrapped. |
| **Prettier** | Required; format on save / CI. |
| **Conventional Commits** | Commit messages follow Conventional Commits. |
| **Feature branches** | Work on feature branches; do not develop solely on `main` for non-trivial changes. |

Feature First layout (ADR-003) applies; style rules apply inside those modules.

## Consequences

### Positive

- Predictable imports and tree-shaking friendliness.
- Stronger type safety for a large catalog domain.
- Homogeneous PRs and agent output.

### Negative

- Slightly more verbose imports than barrels.
- Stricter than some React tutorials (no default export components).

## Related docs

- [ADR-003](./ADR-003-frontend-architecture.md)
- [ADR-012](./ADR-012-testing.md)
- [`CONTRIBUTING.md`](../../CONTRIBUTING.md)
- [`AGENTS.md`](../../AGENTS.md)
