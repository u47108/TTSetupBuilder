# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Live scraper **`zonatt-maderas`** ([ZonaTT](https://www.zonatt.com/es/maderas-de-tenis-de-mesa)) — inventory from sitemap (incl. no disponibles / descatalogados); mango AN/FL/ST/PH
- Live scraper **`zonatt-gomas`** — ZonaTT rubbers from sitemap (priority: Hurricane 3 Neo Provincial Blue Sponge 39, Killer Pro)
- Live seed source **`cl-rubber-seeds`** — Bushido / Foxhara WooCommerce PDPs (H3 Neo variants)
- Blade handle type **`PH`** (penhold) in `@ttsetupbuilder/types` and builder picker
- **GitHub Pages** deploy via Actions (`deploy-pages.yml`); URL `https://u47108.github.io/TTSetupBuilder/`
- Builder: tomada FL/ST/AN/CS/PH, foto del jugador con zoom/pan, poster share PNG
- Catalog images: studio white/black backgrounds → transparent WebP (`pnpm optimize-images`; black via edge flood-fill; white fringe scrub for dark UI)
- Live scrapers for **VP Sport (Jumpseller)** — 7 categories (gomas lisas, maderos, poros, anti-topspin)
- Live scrapers for **Dandoy blades + rubbers** with multi-page crawl and merged SPA catalog publish
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

- Local SPA catalog (~**997** products) merges Dandoy + VP Sport + ZonaTT (maderas + gomas) + CL rubber seeds by `sourceId`
- Catalog images optimized to **max 720px JPEG q72** or **WebP+alpha** when studio white/black bg detected
- Catalog publish **merges by sourceId** (blades + rubbers coexist in one `catalog.json`)
- TT11 sources marked `cloudflareBlocked` (automated GET fails challenge); prefer Dandoy / VP Sport / ZonaTT for live ingestion
- ADR-009 amended: multi-source related registry (not TT11-only); links `docs/DATA_SOURCES.md` and `scrapers/`
- ADR-002 stack table lists Fuse.js as accepted catalog search dependency (per ADR-010)
- Root `README.md` Technology section aligned with ADR-002 (Vite + React 19 SPA, not Next.js); status updated for catalog + builder
- `docs/decisions/README.md` now points to canonical `docs/adr/`

### Planned

- System architecture (`docs/architecture/ARCHITECTURE.md`)
- Additional live parsers (ProTT, etc.) after robots/ToS review

## [0.1.0] - 2026-07-19

### Added

- Initial repository structure
- Documentation stubs (`README`, `ROADMAP`, `CONTRIBUTING`)
- GitHub issue and pull request templates
- MIT license
