# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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

- Root `README.md` Technology section aligned with ADR-002 (Vite + React 19 SPA, not Next.js)
- `docs/decisions/README.md` now points to canonical `docs/adr/`

### Planned

- System architecture (`docs/architecture/ARCHITECTURE.md`)
- Vite + React SPA bootstrap in `apps/web` (per ADR-002 / ADR-003)

## [0.1.0] - 2026-07-19

### Added

- Initial repository structure
- Documentation stubs (`README`, `ROADMAP`, `CONTRIBUTING`)
- GitHub issue and pull request templates
- MIT license
