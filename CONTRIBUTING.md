# Contributing to TTSetupBuilder

Thanks for your interest in contributing. This project is in early development; documentation and architecture come before feature code.

## Principles

1. **Docs before UI** — Prefer architecture and product decisions before components.
2. **Monorepo boundaries** — Keep app code in `apps/`, shared libraries in `packages/`, scrapers in `scrapers/`.
3. **Small, focused PRs** — One concern per pull request.
4. **Conventional Commits** — Use messages like `feat:`, `fix:`, `docs:`, `chore:`.

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
