# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Live scrapers for **Dandoy blades + rubbers** with multi-page crawl and merged SPA catalog publish
- Seed catalog: **120 blades + 120 rubbers** (240 products, 450+ owned images)
- Products grid and product detail gallery from local catalog
- Multi-source ingestion registry (`docs/DATA_SOURCES.md`) and `@ttsetupbuilder/scrapers` CLI
- Catalog contract extensions in `@ttsetupbuilder/types` (`CatalogProduct`, `CatalogDocument`, provenance + `imageLocalPaths`)
- Local Fuse.js search over `apps/web/public/data/catalog.json` (ADR-010)
- Image download helper with content-hash filenames (no hotlinking)
- pnpm workspace monorepo (`pnpm-workspace.yaml`, root `package.json`)
- `apps/web` Vite + React 19 + TypeScript SPA foundation (Feature First, dark-only shell, ADR-006 routes)
- TanStack Query provider, Zustand UI store skeleton, theme Context (dark-only)
- `@ttsetupbuilder/types` minimal shared types (`Product`, `Player`, `Brand`, …)
- ESLint + Prettier aligned with ADR-013
- Architecture Decision Records as source of truth (`docs/adr/` — ADR-000 template through ADR-014)
- Agent instructions (`AGENTS.md`) and Cursor project rule (`.cursor/rules/project.mdc`)
- Product vision document (`docs/PRODUCT_VISION.md`)
- Component library inventory (`docs/ui/COMPONENT_LIBRARY.md`)
- Design system requirements (`docs/ui/DESIGN_SYSTEM.md`)
- Data model document (`docs/DATA_MODEL.md`)
- Functional requirements document (`docs/FUNCTIONAL_REQUIREMENTS.md`)
- Navigation & information architecture document (`docs/NAVIGATION.md`)
- Development roadmap with deployable milestones (`docs/roadmap/DEVELOPMENT_ROADMAP.md`)
- Frontend architecture requirements ([`docs/architecture/FRONTEND_ARCHITECTURE.md`](./docs/architecture/FRONTEND_ARCHITECTURE.md)) — historical Next.js notes; **superseded by ADRs** (Vite + React SPA per ADR-002) where conflicting

### Changed

- Catalog images optimized to **max 720px JPEG q72** (`pnpm optimize-images`); scrape prefers Magento `img` over `full`
- Catalog publish **merges by sourceId** (blades + rubbers coexist in one `catalog.json`)
- TT11 sources marked `cloudflareBlocked` (automated GET fails challenge); prefer Dandoy for live ingestion
- ADR-009 amended: multi-source related registry (not TT11-only); links `docs/DATA_SOURCES.md` and `scrapers/`
- ADR-002 stack table lists Fuse.js as accepted catalog search dependency (per ADR-010)
- Root `README.md` Technology section aligned with ADR-002 (Vite + React 19 SPA, not Next.js); status updated for M1 bootstrap
- `docs/decisions/README.md` now points to canonical `docs/adr/`

### Planned

- System architecture (`docs/architecture/ARCHITECTURE.md`)
- Additional live parsers (ProTT, Dandoy rubbers, etc.) after robots/ToS review

## [0.1.0] - 2026-07-19

### Added

- Initial repository structure
- Documentation stubs (`README`, `ROADMAP`, `CONTRIBUTING`)
- GitHub issue and pull request templates
- MIT license
