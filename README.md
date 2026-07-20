# 🏓 TTSetupBuilder

**Build, customize and share your table tennis setup.**

TTSetupBuilder is a free, open-source web application — a **visual equipment database**, not a shop — that lets players discover blades and rubbers, compare gear, and compose shareable racket setups.

🌐 **Live demo:** [Builder](https://u47108.github.io/TTSetupBuilder/builder) · [Home](https://u47108.github.io/TTSetupBuilder/)

---

## Features

- 🏓 Browse **693** blades and **976** rubbers in a unified local catalog
- 🔍 Fast client-side search and filtering (Fuse.js, offline-first)
- 🎨 Visual setup builder — blade, handle, FH/BH rubbers, optional player photo
- 📤 Share your racket setup as a poster PNG
- ⚖️ Side-by-side product comparison
- 📚 Continuously growing equipment database via owned scrapers and images
- 🌍 Runs entirely in the browser — no runtime dependency on retailer sites
- 📱 Responsive, dark-only UI tuned for product photography

---

## Database

| Category       | Count |
| -------------- | ----: |
| Blades         | **693** |
| Rubbers        | **976** |
| Total products | **1669** |

Sources: Dandoy, VP Sport, ZonaTT (maderas + gomas), CL rubber seeds, Tabletennis Reference PDP seeds — merged locally. Discontinued blades and rubbers stay in the catalog when players still use them. See [Data sources](./docs/DATA_SOURCES.md).

---

## Why this project?

Table tennis gear research is scattered across retailer pages, forums, and spreadsheets. TTSetupBuilder is a **photography-first visual database** — closer to browsing a curated equipment museum than shopping online.

Unlike ecommerce sites, we prioritize large product photos, professional setups, smart search, comparison, and an interactive builder. There is **no cart, checkout, or “Buy now”** as a primary action ([ADR-001](./docs/adr/ADR-001-project-scope.md)).

Full product rationale: [Product Vision](./docs/PRODUCT_VISION.md).

---

## Roadmap

### Equipment database

- More blades, rubbers, and better images
- Historical and vintage products
- Additional approved scrape sources after robots/ToS review

### ITTF integration *(in progress)*

- Approved rubbers sync via batch monitor (`pnpm ittf`)
- Expiration tracking, builder/detail validation notices, catalog `ittfApproval` annotations
- No live ITTF API calls from the SPA ([ADR-014](./docs/adr/ADR-014-offline-first-data-ownership.md))

Phased delivery details: [ROADMAP.md](./ROADMAP.md) · [Development Roadmap](./docs/roadmap/DEVELOPMENT_ROADMAP.md)

---

## Future plans

- Professional players database and setup exploration
- Equipment timeline and image galleries
- Reviews and richer media per product
- AI assistant as an assistive overlay (not a homepage chatbot)
- RAG knowledge base over owned catalog data

---

## Community contributions

Report incorrect images, missing products, wrong names or specs, or outdated ITTF status — open an issue or pull request. Guidelines: [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Repository structure

```text
TTSetupBuilder
├── apps/web          # Vite + React 19 SPA
├── packages/types    # Shared TypeScript types
├── packages/         # ui, config, database (placeholders)
├── scrapers/         # Offline data collection and catalog publish
├── prompts/          # AI prompt templates
└── docs/             # Architecture, UI, roadmap, ADRs
```

---

## Quick start

```bash
pnpm install
pnpm --filter web dev
```

Scrapers (default dry-run, no site hammering):

```bash
pnpm scrape -- --list
pnpm scrape -- --source=zonatt-maderas
pnpm scrape -- --source=dandoy-blades --no-dry-run --fetch-listing --download-images --publish --limit=50
```

ITTF racket-coverings approval is annotated offline (`pnpm ittf` → `ittfApproval` on rubbers); the SPA never calls ITTF at runtime.

```bash
pnpm --filter @ttsetupbuilder/scrapers ittf -- run
```

Build: `pnpm --filter web build`. Details: [`apps/web/README.md`](./apps/web/README.md), [`scrapers/README.md`](./scrapers/README.md).

### Live site (GitHub Pages)

Settings → Pages → Source: **GitHub Actions**. After a green **Deploy GitHub Pages** run, the app is at **https://u47108.github.io/TTSetupBuilder/** (builder: `/builder`).

Local build with the same base path:

```bash
VITE_BASE_PATH=/TTSetupBuilder/ pnpm --filter web build
```

---

## Technology

Per [ADR-002](./docs/adr/ADR-002-tech-stack.md):

- React 19 · Vite · TypeScript · TailwindCSS
- TanStack Query · Zustand · React Router · Framer Motion
- Node.js 22 LTS · pnpm

SPA — no SSR. Compatible with GitHub Pages and Cloudflare Pages.

---

## Documentation

| Doc | Purpose |
|-----|---------|
| [AGENTS.md](./AGENTS.md) | Instructions for AI agents and contributors (ADRs first) |
| [ADRs](./docs/adr/) | **Source of truth** for architecture decisions |
| [Product Vision](./docs/PRODUCT_VISION.md) | What we are building and why (photography-first equipment database) |
| [Design System](./docs/ui/DESIGN_SYSTEM.md) | UI requirements: tokens, themes, photography, chrome rules |
| [Component Library](./docs/ui/COMPONENT_LIBRARY.md) | Intended React component inventory |
| [Functional Requirements](./docs/FUNCTIONAL_REQUIREMENTS.md) | Personas, user stories, FR/NFR |
| [Data Model](./docs/DATA_MODEL.md) | Normalized model for catalog, players, media, setups |
| [Data Sources](./docs/DATA_SOURCES.md) | Approved scrape sources, roles, ethics |
| [Scrapers](./scrapers/README.md) | Offline ingestion package (`@ttsetupbuilder/scrapers`) |
| [Navigation & IA](./docs/NAVIGATION.md) | Routes and screen-level information architecture |
| [Frontend Architecture](./docs/architecture/FRONTEND_ARCHITECTURE.md) | Historical notes — **superseded by ADRs** where conflicting |
| [Roadmap](./ROADMAP.md) | High-level phased delivery |
| [Development Roadmap](./docs/roadmap/DEVELOPMENT_ROADMAP.md) | Deployable milestones (M1–M9) |

**Changelog:** [CHANGELOG.md](./CHANGELOG.md)

---

## Screenshots

UI captures and visual references live in [`docs/screenshots/`](./docs/screenshots/) (placeholder — assets added as the SPA stabilizes).

---

## Status

🚧 **Early development** — web app **v0.1.0** · SPA + local catalog + builder

- Vite + React SPA (`apps/web`), Feature First layout, dark-only shell, EN/ES i18n
- Local catalog **1669** products with owned images under `public/catalog/`
- Builder: blade + handle (FL/ST/AN/CS/PH) + rubbers + player photo / share PNG
- ITTF approval notices on builder and product detail (offline batch data)
- Deploy target: GitHub Pages (see Quick start)

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Author

Luis Nuñez

## License

[MIT](./LICENSE) — Luis Nuñez ([@u47108](https://github.com/u47108))
