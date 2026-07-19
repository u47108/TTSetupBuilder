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
├── apps/web          # Next.js application (planned)
├── packages/         # Shared packages (ui, types, config, database)
├── scrapers/         # Data collection scripts
├── prompts/          # AI prompt templates
└── docs/             # Architecture, UI, roadmap, decisions
```

---

## Technology

- Next.js
- React
- TypeScript
- TailwindCSS
- Framer Motion
- Zustand
- TanStack Query

---

## Documentation

| Doc | Purpose |
|-----|---------|
| [Product Vision](./docs/PRODUCT_VISION.md) | What we are building and why (photography-first equipment database) |
| [Design System](./docs/ui/DESIGN_SYSTEM.md) | UI requirements: tokens, themes, photography, chrome rules |
| [Component Library](./docs/ui/COMPONENT_LIBRARY.md) | Intended React component inventory (`packages/ui` vs `apps/web`) |
| [Functional Requirements](./docs/FUNCTIONAL_REQUIREMENTS.md) | Personas, user stories, FR/NFR for every feature area |
| [Data Model](./docs/DATA_MODEL.md) | Normalized relational model for catalog, players, media, setups |
| [Navigation & IA](./docs/NAVIGATION.md) | App navigation, routes, and screen-level information architecture |
| [Frontend Architecture](./docs/architecture/FRONTEND_ARCHITECTURE.md) | Next.js 15 App Router: RSC-first structure, state, images, caching, SSR/ISR |
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
