# TTSetupBuilder

> The ultimate visual table tennis equipment database and setup builder.

---

## Vision

TTSetupBuilder is an open-source platform focused on discovering, comparing and building professional table tennis equipment setups.

Unlike ecommerce websites, TTSetupBuilder prioritizes:

- 📸 Large product photography
- 🏓 Professional player setups
- 🔍 Smart search
- ⚖️ Equipment comparison
- 🛠 Interactive racket builder
- 🤖 AI-powered recommendations
- 📚 Unified equipment database

---

## Planned Features

- Equipment Database
- Professional Players
- Interactive Racket Builder
- Product Comparison
- Equipment Timeline
- AI Assistant
- Reviews
- Image Gallery
- Equipment Search
- Scrapers
- RAG Knowledge Base

---

## Repository Structure

```text
TTSetupBuilder
├── apps/web          # Vite + React SPA (planned)
├── packages/         # Shared packages (ui, types, config, database)
├── scrapers/         # Data collection scripts
├── prompts/          # AI prompt templates
└── docs/             # Architecture, UI, roadmap, ADRs
```

---

## Technology

Per [ADR-002](./docs/adr/ADR-002-tech-stack.md):

- React 19
- Vite
- TypeScript
- TailwindCSS
- TanStack Query
- Zustand
- React Router
- Framer Motion
- Node.js 22 LTS
- pnpm

SPA — no SSR required. Compatible with GitHub Pages and Cloudflare Pages.

---

## Documentation

| Doc | Purpose |
|-----|---------|
| [AGENTS.md](./AGENTS.md) | Instructions for AI agents and contributors (ADRs first) |
| [ADRs](./docs/adr/) | **Source of truth** for architecture decisions |
| [Product Vision](./docs/PRODUCT_VISION.md) | What we are building and why (photography-first equipment database) |
| [Design System](./docs/ui/DESIGN_SYSTEM.md) | UI requirements: tokens, themes, photography, chrome rules |
| [Component Library](./docs/ui/COMPONENT_LIBRARY.md) | Intended React component inventory (`packages/ui` vs `apps/web`) |
| [Functional Requirements](./docs/FUNCTIONAL_REQUIREMENTS.md) | Personas, user stories, FR/NFR for every feature area |
| [Data Model](./docs/DATA_MODEL.md) | Normalized relational model for catalog, players, media, setups |
| [Navigation & IA](./docs/NAVIGATION.md) | App navigation, routes, and screen-level information architecture |
| [Frontend Architecture](./docs/architecture/FRONTEND_ARCHITECTURE.md) | Historical Next.js-oriented notes — **superseded by ADRs where conflicting** |
| [Architecture index](./docs/architecture/README.md) | Architecture docs folder |
| [Roadmap](./ROADMAP.md) | High-level phased delivery |
| [Development Roadmap](./docs/roadmap/DEVELOPMENT_ROADMAP.md) | Deployable milestones (M1–M9), acceptance criteria, complexity |

## Status

🚧 Early Development

Documentation first. Application bootstrap comes after architecture.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)
