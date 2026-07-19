# apps/web

Vite + React 19 SPA for TTSetupBuilder (ADR-002, ADR-003).

## Requirements

- Node.js 22+
- pnpm 9+

## Setup

From the repository root:

```bash
pnpm install
pnpm --filter web dev
```

Open the URL printed by Vite (typically `http://localhost:5173`).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm --filter web dev` | Start Vite dev server |
| `pnpm --filter web build` | Typecheck + production build |
| `pnpm --filter web preview` | Preview the production build |
| `pnpm --filter web lint` | ESLint |
| `pnpm --filter web typecheck` | TypeScript project references check |

Root shortcuts: `pnpm dev`, `pnpm build`, `pnpm lint`.

## Structure (Feature First)

```text
src/
  app/           # shell, providers, router
  features/      # domain screens (home, products, players, …)
  shared/        # UI primitives, cn(), Zustand UI store
```

Canonical routes: `/`, `/products`, `/products/:slug`, `/players`, `/players/:slug`, `/brands`, `/search`, `/compare`, `/builder` (ADR-006).

Path alias: `@/` → `src/`.
