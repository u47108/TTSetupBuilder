# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Footer author credit — Luis Nuñez (EN/ES i18n) and GitHub contact link ([u47108](https://github.com/u47108)) alongside app version in AppShell

## [0.1.0] - 2026-07-20

Web app (`apps/web`) **v0.1.0** — first functional SPA release: local catalog, builder, search, compare, EN/ES i18n, ITTF offline notices, GitHub Pages deploy.

### Fixed

- Viscaria blade photos: `vpsport-viscaria-alc` primary from clean full-blade studio JPEG (no knockout); `vpsport-viscaria-cs` primary replaced shredded/handle-crop WebP with full CS blade JPEG from VP Sport CDN master
- Catalog image pipeline: do not scrub alpha on images without a detected studio plate (pale wood cutouts were shredded into jagged WebP); blades always JPEG via `allowKnockoutForCategory`; `downloadImageToOwnedStorage` requires `allowKnockout`; `optimize-images` re-encodes blade files without knockout
- Blade white-plate cutouts: scrub retail dark matte fringe (black contour halo) on download; VP Sport prefers full CDN master over `/thumb/720/720`; `repair-blade-images --force` re-downloads JPEG blades

### Added

- **Discontinued product alert** — scraper sets catalog `discontinued` at PDP ingest (Tabletennis Reference h2 `[Discontinued]` / schema.org Offer); SPA amber builder/detail notices read that field (EN/ES; stock ≠ catalog)
- Scraper source **`tabletennis-reference-rackets`** live PDP seeds: Ai Fukuhara PRO ZLF (detail/226, discontinued) + Viscaria (detail/858)
- Scraper sources **`tabletennis-reference-rubbers`** / **`tabletennis-reference-rackets`** (tabletennis-reference.com — distinct from `tabletennis-reviews`); secondary photos + reviews; dry-run listing plans; rubbers live = explicit PDP seeds (e.g. Blues T1 detail/439)
- Owned catalog photo for fixture **Donic Blues T1** (`/catalog/aefd272a97acc080.webp`) from Tabletennis Reference PDP detail/439 (page title “Bruce T1”; packaging/ITTF = Blues T1)
- **i18n EN/ES** in `apps/web` — custom message dictionaries + `useT()`; locale in Zustand UI store (`localStorage` + `document.documentElement.lang`); AppShell language toggle (no i18next; ADR-002 / ADR-005)
- **Builder ITTF alert** on `/builder` — amber banner in the palette when FH and/or BH rubber has non-approved `ittfApproval` (`not_found` / `not_approved` / `expired` / `inactive`); does not overlay racket preview images
- **ITTF racket-coverings monitor** (`pnpm ittf`) — batch snapshot/diff/annotate via `ittf-admin-api`; catalog field `ittfApproval`; SPA notice for non-approved rubbers (ADR-014: no live ITTF calls)
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
- Catalog contract extensions in `@ttsetupbuilder/types` (`CatalogProduct`, `CatalogDocument`, provenance + `imageLocalPaths` + `ittfApproval`)
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
- Initial repository structure, documentation stubs (`README`, `ROADMAP`, `CONTRIBUTING`), GitHub issue/PR templates, MIT license

### Changed

- Root `README.md` refreshed — user-facing features/demo/roadmap merged with maintainer quick start, ADR links, and live catalog counts (**693** blades, **976** rubbers, **1669** total)
- Spanish UI copy uses **goma(s)** (never “caucho(s)”) for user-facing rubber wording; ITTF technical English terms (`EquipmentCode`, racket coverings) kept where needed
- Local SPA catalog (~**1665** products) merges Dandoy + VP Sport + ZonaTT (maderas + gomas) + CL rubber seeds by `sourceId`; rubbers annotated with batch ITTF approval facts
- ADR-002 / ADR-005 note custom EN/ES dictionaries and locale in Zustand (no major i18n library)
- Viscaria CS / PH / ALC catalog photos refreshed (owned local assets)
- Catalog images optimized to **max 720px JPEG q72** or **WebP+alpha** when studio white/black bg detected
- Catalog publish **merges by sourceId** (blades + rubbers coexist in one `catalog.json`)
- TT11 sources marked `cloudflareBlocked` (automated GET fails challenge); prefer Dandoy / VP Sport / ZonaTT for live ingestion
- ADR-009 amended: multi-source related registry (not TT11-only); ITTF via admin API batch monitor; links `docs/DATA_SOURCES.md` and `scrapers/`
- ADR-002 stack table lists Fuse.js as accepted catalog search dependency (per ADR-010)
- Root `README.md` Technology section aligned with ADR-002 (Vite + React 19 SPA, not Next.js); status updated for catalog + builder
- `docs/decisions/README.md` now points to canonical `docs/adr/`

### Planned

- System architecture (`docs/architecture/ARCHITECTURE.md`)
- Additional live parsers (ProTT, etc.) after robots/ToS review
