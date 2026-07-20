# Contributing to TTSetupBuilder

Thanks for your interest in contributing. This project is in early development; documentation and architecture come before feature code.

## Principles

1. **Docs before UI** — Prefer architecture and product decisions before components.
2. **Monorepo boundaries** — Keep app code in `apps/`, shared libraries in `packages/`, scrapers in `scrapers/`.
3. **Small, focused PRs** — One concern per pull request.
4. **Conventional Commits** — Use messages like `feat:`, `fix:`, `docs:`, `chore:`.

## Version and changelog (automatic)

Every normal commit bumps the **patch** version in the root `package.json` and `apps/web/package.json` (kept in sync) and appends an entry to [`CHANGELOG.md`](./CHANGELOG.md).

- **Hook:** Husky `prepare-commit-msg` runs `scripts/bump-version-changelog.mjs` (Node, cross-platform).
- **Message → section:** Conventional Commit type maps to Keep a Changelog headings (`feat` → Added, `fix` → Fixed, others → Changed).
- **Release block:** A new `## [x.y.z] - YYYY-MM-DD` section is inserted under `[Unreleased]` with the commit subject as a bullet.
- **Footer version:** `apps/web` exposes the bumped version via Vite `__APP_VERSION__` (from `apps/web/package.json`).
- **Skipped:** merge/squash/amend commits, empty messages, merges (`Merge …`). Set `SKIP_VERSION_BUMP=1` to bypass once.

After `pnpm install`, `prepare` installs Husky hooks. To skip automation for a single commit:

```bash
SKIP_VERSION_BUMP=1 git commit -m "docs: typo only"
```

On Windows PowerShell:

```powershell
$env:SKIP_VERSION_BUMP=1; git commit -m "docs: typo only"
```

## Getting started

1. Fork and clone the repository.
2. Create a branch from `main`: `git checkout -b docs/your-change`.
3. Make your changes.
4. Open a pull request using the template.

The Next.js app in `apps/web` is not bootstrapped yet. Do not add application code until that step is complete and architecture docs exist.

## Documentation

| Path | Purpose |
|------|---------|
| `docs/architecture/` | System design and technical decisions |
| `docs/ui/` | UI/UX references and design notes |
| `docs/roadmap/` | Detailed phase planning |
| `docs/decisions/` | Architecture Decision Records (ADRs) |
| `docs/screenshots/` | Visual references |

## Issues

Use the issue templates for bugs and feature requests. For questions, open a discussion-style issue and label it clearly.

## Code of conduct

Be respectful and constructive. We optimize for long-term maintainability of an open equipment knowledge base.
