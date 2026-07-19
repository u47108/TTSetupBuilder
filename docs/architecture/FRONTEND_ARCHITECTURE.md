# Frontend Architecture — TTSetupBuilder

> Architecture requirements for the photography-first Next.js frontend in a monorepo.

| Field | Value |
|-------|--------|
| **Status** | Architecture requirements (pre-bootstrap) |
| **Target stack** | Next.js **15** (App Router), React 19, TypeScript, TailwindCSS, Framer Motion, Zustand, TanStack Query |
| **App** | `apps/web` (not bootstrapped yet) |
| **Audience** | Frontend engineers, AI coding agents, reviewers |
| **Constraint** | Documentation only until Phase 1 architecture is accepted — no `create-next-app` in this doc’s scope |

**Read first:** [Product Vision](../PRODUCT_VISION.md).

**Aligned with:**  
[Product Vision](../PRODUCT_VISION.md), [Navigation & IA](../NAVIGATION.md), [Data Model](../DATA_MODEL.md), [Design System](../ui/DESIGN_SYSTEM.md), [Component Library](../ui/COMPONENT_LIBRARY.md), [Functional Requirements](../FUNCTIONAL_REQUIREMENTS.md).

**Also planned:** system `ARCHITECTURE.md`, ADRs under `docs/decisions/`.

**Routing authority:** [`docs/NAVIGATION.md`](../NAVIGATION.md) is canonical for public paths. This document maps those routes onto Next.js 15 App Router conventions.

---

## 0. Design principles (non-negotiable)

1. **RSC-first.** Server Components are the default. Client Components are islands for interactivity only.
2. **Photography is a product feature.** Image pipeline, LCP, CDN variants, and grid virtualization are first-class requirements — not “later polish.”
3. **Not ecommerce.** No cart/checkout mental models in routes, state, or chrome. Compare tray ≠ cart.
4. **Shareable state via URL** for exploration verbs (search, filters, compare sets, builds) wherever practical.
5. **Explicit caching (Next.js 15).** Opt **in** to cache; do not assume Next 14 defaults.
6. **Catalog scale.** Assume thousands of products, large media libraries, dense grids — architecture must not only work for demos of ~12 items.
7. **Monorepo boundaries.** UI primitives and domain types live in packages; the app composes routes and data.

### 0.1 Anti-patterns (global)

| Anti-pattern | Why it fails here |
|--------------|-------------------|
| Marking entire `app/` trees with `"use client"` | Inflates JS, kills RSC streaming benefits, forces client data fetching |
| Fetching catalog/PDP data in `useEffect` when an RSC/`loader` path suffices | Worse TTFB/LCP, duplicate caches, SEO gaps |
| Shipping Framer Motion + heavy galleries on every route | Ruins CWV on browse/search |
| Treating compare tray like a shopping cart (opaque, non-shareable) | Conflicts with product vision and URL-first exploration |
| Unoptimized `<img>` / full-resolution heroes in grids | Destros LCP and bandwidth on photo grids |
| Client-only search that blocks first paint | Search is a primary job; must feel instant without waiting on a fat bundle |
| Ignoring missing media | Broken thumbnails are data debt; UI must surface “no photo” honestly |

---

## 1. Folder structure

### 1.1 Monorepo layout (target)

```text
TTSetupBuilder/
├── apps/
│   └── web/                          # Next.js 15 App Router application
│       ├── src/
│       │   ├── app/                  # Routes, layouts, loading/error/not-found
│       │   ├── components/           # App-specific composition (not design-system primitives)
│       │   ├── features/             # Feature modules (builder, compare, search, gallery…)
│       │   ├── lib/                  # Server/client utilities, env, observability
│       │   ├── hooks/                # App-level hooks (client)
│       │   └── styles/               # Global CSS / Tailwind entry
│       ├── public/                   # Static assets (favicons, OG defaults — not product media)
│       ├── next.config.ts
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── ui/                           # @ttsetupbuilder/ui — primitives & DS components
│   ├── types/                        # @ttsetupbuilder/types — domain + API contracts
│   ├── config/                       # @ttsetupbuilder/config — ESLint, TS, Tailwind presets
│   ├── database/                     # @ttsetupbuilder/database — schema/client (server-only usage)
│   └── …                             # Future: search client SDK, media helpers, etc.
├── scrapers/
├── prompts/
└── docs/
```

### 1.2 `apps/web` App Router structure (aligned with NAVIGATION.md)

Route segments follow [`docs/NAVIGATION.md`](../NAVIGATION.md) §3. Prefer **route groups** for chrome variants without polluting URLs.

```text
apps/web/src/app/
├── layout.tsx                        # Root: fonts, providers shell, global a11y landmarks
├── template.tsx                      # Optional: per-navigation motion reset (use sparingly)
├── page.tsx                          # Explore / Home (`/`)
├── loading.tsx                       # Root fallback (minimal)
├── error.tsx                         # Root error boundary
├── not-found.tsx
├── robots.ts
├── sitemap.ts
├── opengraph-image.tsx               # Optional default OG
├── (app)/                            # Primary product chrome: nav + compare indicator + search
│   ├── layout.tsx
│   ├── search/page.tsx               # Dedicated search (`?q=` & filters)
│   ├── equipment/
│   │   ├── page.tsx                  # Category browse hub
│   │   ├── loading.tsx
│   │   └── [category]/page.tsx     # Category photo grid
│   ├── products/
│   │   └── [slug]/
│   │       ├── page.tsx              # PDP — media-first
│   │       ├── loading.tsx
│   │       └── opengraph-image.tsx
│   ├── brands/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── players/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       ├── page.tsx
│   │       └── loading.tsx
│   ├── setups/
│   │   └── [id]/page.tsx           # Player setup detail (optional deep page)
│   ├── collections/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── builder/
│   │   ├── page.tsx                  # New / resume build
│   │   ├── [buildId]/page.tsx
│   │   ├── from/[setupId]/page.tsx  # Seed from player setup
│   │   └── loading.tsx
│   ├── compare/page.tsx              # Compare workspace (URL encodes selection)
│   ├── videos/ …                     # Overflow content (phase-gated)
│   ├── reviews/ …
│   ├── news/ …
│   └── account/ …                    # When auth exists
├── (admin)/admin/ …                  # Separate chrome + auth boundary
├── api/                              # Route Handlers only when needed (webhooks, BFF, auth)
└── actions/                          # Optional colocation of Server Actions (or under features/)
```

**Canonical URL policy** (from NAVIGATION.md — do not invent alternate public paths):

| Surface | Canonical path | Notes |
|---------|----------------|-------|
| Home / Explore | `/` | One composition; photography-led |
| Search | `/search` | `q`, filters, sort as URL state |
| Equipment hub | `/equipment` | Category browse hub |
| Category grid | `/equipment/[category]` | Taxonomy from DATA_MODEL |
| Product detail | `/products/[slug]` | Media-first PDP |
| Brands | `/brands`, `/brands/[slug]` | Discovery hub, not storefront |
| Players | `/players`, `/players/[slug]` | Setup timeline on detail |
| Player setup | `/setups/[id]` | Optional deep page |
| Compare | `/compare` | Selection in URL (+ tray persistence) |
| Builder | `/builder`, `/builder/[buildId]`, `/builder/from/[setupId]` | Shareable builds |
| Collections | `/collections`, `/collections/[slug]` | Editorial / algorithmic |
| Account | `/account/*` | Auth-gated; force-dynamic |
| Admin | `/admin/*` | Separate chrome; never in public primary nav |

Paths must remain shareable and SEO-stable (public **slugs**; opaque IDs only where NAVIGATION already specifies, e.g. setups/builds).

### 1.3 Feature modules (`src/features/*`)

Colocate by product verb, not by technical layer alone:

```text
features/
├── catalog/          # Grid, filters, infinite scroll bridge
├── product/          # PDP gallery, attributes, used-by
├── search/           # Typeahead, results, empty states
├── compare/          # Tray, workspace, URL sync
├── builder/          # Racket composition, compatibility UI
├── players/          # Player entity surfaces
├── collections/
├── media/            # Image helpers, blur placeholders, gallery primitives (app-level)
└── shell/            # Nav, command palette, compare indicator
```

Each feature may expose:

- `*.server.tsx` / server-only data helpers
- `*.tsx` Client islands
- `*.store.ts` Zustand slices (client)
- `*.queries.ts` TanStack Query keys & queryOptions
- `*.schema.ts` Zod (shared with API contracts when possible)

### 1.4 Shared packages

| Package | Responsibility | Import from `apps/web` |
|---------|----------------|------------------------|
| `@ttsetupbuilder/ui` | Buttons, inputs, dialogs, grid shells, skeleton primitives, focus rings — **no** product fetching | Yes |
| `@ttsetupbuilder/types` | `Product`, `Player`, `Setup`, `MediaAsset`, API DTOs | Yes (types-only in client bundles preferred) |
| `@ttsetupbuilder/config` | Shared ESLint/TS/Tailwind — consumed by tooling | Via extends, not runtime |
| `@ttsetupbuilder/database` | DB client/schema | **Server-only** in `apps/web` (never import from Client Components) |

**Package rules:**

- `packages/ui` must not import from `apps/web`.
- `packages/ui` should not import `next/navigation` unless a deliberate “next adapter” subpath exists; prefer headless primitives.
- Domain types belong in `packages/types`, not duplicated in the app.
- Mark server-only modules with `server-only` package import to fail builds if leaked to client.

### 1.5 Import aliases

| Alias | Maps to | Usage |
|-------|---------|--------|
| `@/*` | `apps/web/src/*` | App-local only |
| `@ttsetupbuilder/ui` | `packages/ui` | Primitives |
| `@ttsetupbuilder/types` | `packages/types` | Domain |
| `@ttsetupbuilder/database` | `packages/database` | Server data access |

Configure consistently in `apps/web/tsconfig.json` and package `exports`. Prefer package names over deep relative `../../../packages/...`.

**Anti-pattern:** Importing `@ttsetupbuilder/database` from a file that is (or becomes) a Client Component — forces bundling secrets or Node APIs into the browser.

---

## 2. State management — decision matrix

Four state classes exist. **Do not collapse them into one store.**

### 2.1 Decision matrix

| Concern | Source of truth | Tool | Lifetime | Shareable? |
|---------|-----------------|------|----------|------------|
| Product / player / collection **catalog data** | Server / API / DB | **RSC fetch** + optional **TanStack Query** for client pagination/refetch | Request / cache TTL | Via URL for list filters; entity via slug |
| Search results (initial) | Server | RSC on `/search` | Request + ISR/tag cache | **Yes — URL** (`q`, filters) |
| Search typeahead (interactive) | Client | TanStack Query (debounced) | Short staleTime | Query string mirrors committed search |
| Compare **selection** | URL + local persistence | URL searchParams **primary**; Zustand tray **secondary** | Session / long-lived | **Yes — URL** |
| Builder composition (in progress) | Client + optional draft ID | **Zustand** + URL/`buildId` when saved | Session until save | Saved builds: **yes** |
| UI chrome (modal open, gallery index local) | Client | React state or tiny Zustand slice | Ephemeral | No |
| Auth session | Cookie / server | NextAuth or equivalent (future) + RSC | Session | N/A |
| Feature flags / experiments | Server env + edge config | Server read; pass as props | Deploy / request | No |
| Form draft noise | Client | React state | Ephemeral | No |

### 2.2 Zustand — when and how

**Use Zustand for:**

- Compare **tray UX** (open/closed, last-focused slot) while selection IDs live in URL
- Racket **builder** working copy (blade, FH, BH, extras, validation messages)
- Cross-route ephemeral UI that is too noisy for the URL (e.g., gallery lightbox open — but deep-linkable slide index may still be URL)

**Do not use Zustand for:**

- Server catalog lists
- Cached HTTP responses (that is TanStack Query or Next cache)
- Anything that must be correctly restored from a shared link without localStorage

**Persistence policy (compare tray):**

1. **URL is canonical** for the set of compared product IDs/slugs (e.g. `/compare?ids=a,b,c` or path segments — choose one scheme in NAVIGATION and stick to it).
2. Zustand + `localStorage` (or `sessionStorage`) may **hydrate** the tray when the user has no URL selection yet (return visitor).
3. On conflict, **URL wins**.
4. Never persist PII in tray storage.

**Builder state:**

- Working draft: Zustand (optionally `persist` middleware for crash-safety).
- Published/shared build: server entity + `/builder/[buildId]`; load via RSC; client store hydrates from server props once.

### 2.3 TanStack Query — when and how

**Use TanStack Query for:**

- Client-side **infinite scroll** pages after first RSC paint
- Typeahead / suggest endpoints
- Mutations that need optimistic UI then reconcile (favorites, save build — when auth exists)
- Polling only if a real realtime need appears (default: **no**)

**Defaults (requirements):**

- Query keys factory per feature: `equipmentKeys.detail(slug)`, `searchKeys.results(params)`, etc.
- Prefer `queryOptions` / `mutationOptions` patterns for reuse with RSC hydration (`dehydratedState`) when bridging.
- `staleTime` for catalog fragments: generous for photography metadata (e.g. 60s–5m); short for user-private data.
- Do **not** set global `gcTime` so high that memory balloons on long explore sessions with huge image lists — paginate query caches.

**Anti-pattern:** Fetching the full PDP in the client when the page is a Server Component. Prefer RSC for first paint; use Query only for subsequent interactions (related carousels, “load more angles”).

### 2.4 URL state

Must be URL-backed:

- Search query and filters
- Catalog sort / category
- Compare set
- Builder `buildId` when saved
- Optional: gallery image index on PDP (`?i=2`) for shareable deep links

Use `nuqs` or Next `searchParams` with a single parsing layer (Zod). Avoid ad-hoc `router.push` string concatenation.

### 2.5 Server state

RSC + Next Data Cache / Full Route Cache hold **public catalog truth**. Client stores hold **user intent**. Never mirror the entire catalog into Zustand.

---

## 3. API layer

### 3.1 Preferred access paths

```text
Browser
  └─ RSC / Server Actions ──► packages/database or internal services
  └─ (optional) Route Handlers / BFF ──► same
  └─ TanStack Query ──► public JSON endpoints (search suggest, page 2+)
```

**Order of preference:**

1. **Server Components** call typed server functions (`lib/server/equipment.ts`) that talk to DB or upstream APIs.
2. **Server Actions** for mutations (save build, future favorites) with Zod validation and `revalidateTag` / `revalidatePath`.
3. **Route Handlers** (`app/api/*`) for: third-party webhooks, cookie-based auth callbacks, or endpoints that must be called from non-RSC clients (mobile later). Avoid turning the app into a generic REST dump.
4. **TanStack Query** against stable JSON routes for interactive fetch.

### 3.2 Contract rules

- DTOs live in `@ttsetupbuilder/types` (or Zod schemas shared as single source → inferred types).
- Never return raw DB rows across the wire; map to public DTOs (hide internal IDs if slugs are public).
- Errors: typed problem payloads (`code`, `message`, `details?`) — map to UI at boundaries.
- Versioning: start unversioned under same origin; if public API hardens later, `/api/v1`.

### 3.3 Server-only boundary

```text
lib/server/**          # import 'server-only'
features/**/*.server.ts
```

Client features receive **serialized props** or call **Server Actions** / HTTP APIs — never import DB clients.

### 3.4 Anti-patterns

- Parallel duplicate fetches: RSC loads product, client Query loads the same product on mount without hydration.
- Exposing scraper or admin APIs on the public Next app without authz.
- Fat BFF that re-implements the database package ad hoc in Route Handlers.

---

## 4. Image loading (photography-first)

Photography is inventory ([Product Vision §7](../PRODUCT_VISION.md)). The frontend image system is a **core product subsystem**.

### 4.1 Requirements

| Requirement | Detail |
|-------------|--------|
| Use `next/image` | Mandatory for catalog grids, PDP heroes, compare slots, search thumbnails |
| CDN | Product media served from an image CDN (Cloudinary, Imgix, Cloudflare Images, or equivalent) — not only `/public` |
| Responsive `srcset` | Via `next/image` `sizes` + CDN width params; define **size tokens** per surface |
| Blur placeholder | `placeholder="blur"` with `blurDataURL` (LQIP) from media pipeline; solid color only as last resort |
| Priority / LCP | Exactly **one** LCP candidate per route (home hero or PDP primary); `priority` sparingly |
| Aspect consistency | Grid cells share aspect ratio tokens from design system |
| Missing media | Explicit empty state component — never broken icon soup |
| Rights / alt | Alt text from media metadata; decorative images `alt=""` only when truly decorative |

### 4.2 Surface-specific `sizes` (requirements targets)

| Surface | Typical display | `sizes` guidance |
|---------|-----------------|------------------|
| Catalog grid thumb | ~150–280px CSS | `(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw` (tune to columns) |
| Search typeahead thumb | ~40–64px | `64px` |
| PDP hero | Dominant viewport | `(max-width: 768px) 100vw, 60vw` (match layout) |
| Compare slot | Column width | Per-column vw |
| OG images | 1200×630 | Separate pipeline; not `next/image` in page |

### 4.3 CDN integration pattern

- Store **canonical asset IDs/URLs** in the data model (`MediaAsset`).
- `next.config` `images.remotePatterns` allowlist CDN hosts only.
- Prefer CDN transforms (width, quality, format `auto`/`webp`/`avif`) over shipping multi-MB originals to the browser.
- Generate LQIP at ingest (scraper/editorial pipeline), store on `MediaAsset.blurDataURL` or derived URL.

### 4.4 Gallery behavior

- PDP gallery: Server-render **primary** image for LCP; hydrate Client island for zoom, keyboard, and additional angles.
- Prefetch **next** angle on intent (hover/focus), not the entire angle set.
- Comparison: aligned slots must request **same shot type** when available (hero vs hero) — media metadata `shotType` is required in DATA_MODEL alignment.

### 4.5 LCP budget (image-heavy)

- Home / PDP: LCP element = hero image; aim **LCP ≤ 2.5s** on mid-tier mobile (4G).
- Do not lazy-load the LCP image.
- Avoid layout shift: reserve aspect-ratio boxes; no late-loaded chrome over the hero.
- Fonts: `next/font` with `display: swap` and subsetting; do not block LCP with unused weights.

### 4.6 Anti-patterns

- CSS `background-image` for product photography (hurts alt, priority, and srcset control).
- Client-only gallery that leaves an empty hole until JS loads.
- One 4000px asset reused for every thumb.
- Autoplay video competing with still inspection (Product Vision §7.4).

---

## 5. Caching

Next.js 15 uses **opt-in** caching for `fetch` and GET Route Handlers. Document intent explicitly in code.

### 5.1 Cache layers (mental model)

| Layer | Where | What we cache | Invalidation |
|-------|--------|---------------|--------------|
| **Request memoization** | Single RSC render | Deduped `fetch`/loader calls | End of request |
| **Data Cache** | Next server | `fetch` with `cache: 'force-cache'` or `next: { revalidate, tags }` | `revalidateTag` / time |
| **Full Route Cache** | Next server | Static RSC payload + HTML for cacheable routes | Time / path / tag / deploy |
| **Router Cache** | Browser | Prefetched segment payloads | Next 15 defaults: dynamic pages **staleTime 0**; layouts still partial; back/forward restore |
| **CDN (images & optionally HTML)** | Edge | Media variants; optional HTML at CDN | Asset hash / purge API |
| **TanStack Query** | Browser | Interactive/client pages | `staleTime` / mutations / `invalidateQueries` |
| **localStorage** | Browser | Compare tray hydrate only | Manual / version key |

### 5.2 Next.js 15 conventions for this product

**Public catalog (equipment, players, collections, PDP):**

- Prefer **ISR-style** caching: `fetch(url, { next: { revalidate: N, tags: ['product:'+slug] } })` or route segment `export const revalidate = N`.
- Tag granularity: `product:{slug}`, `player:{slug}`, `catalog:{category}`, `home`.
- After editorial/scraper updates: `revalidateTag` from trusted server jobs (not from public clients).

**Search:**

- Initial results: short `revalidate` or dynamic if personalization exists (default: **no personalization** early → cacheable by query key carefully).
- Typeahead: usually **dynamic / no long Data Cache**; rely on edge/search engine latency + TanStack `staleTime` ~10–30s.

**User-specific (future auth):**

- `force-dynamic` or `cache: 'no-store'` for private builds/favorites.
- Never put private data in Full Route Cache.

**GET Route Handlers:**

- Not cached by default in Next 15 — set `export const revalidate` or `dynamic = 'force-static'` only when intentionally static.

### 5.3 `'use cache'` / Cache Components

- Next.js 15.x introduced experimental directions toward explicit `'use cache'`; **stable, primary guidance for this repo’s Next 15 target** remains:
  - established App Router patterns: `revalidate`, `fetch` cache options, `unstable_cache` for non-fetch work,
  - `revalidatePath` / `revalidateTag` after mutations.
- Treat `'use cache'` + `cacheLife` / `cacheTag` as **evolving** — adopt only when the pinned Next 15.x minor documents them as supported for our deployment target; do not block architecture on experimental APIs.
- Prefer **portable** patterns (tags + revalidate) so upgrades to later Next majors are additive.

### 5.4 RSC payload vs TanStack Query

- First navigation to PDP/catalog: **RSC payload** (cached when tagged).
- Client “load more” / infinite scroll: **TanStack Query** pages; do not refetch page 1 on mount if dehydrated from RSC.
- Avoid double-caching the same entity with divergent TTLs without a documented key strategy.

### 5.5 HTTP caching

- HTML/RSC from Next: controlled by framework + hosting (Vercel/etc.).
- JSON API responses: set `Cache-Control` deliberately (`public, s-maxage=…, stale-while-revalidate=…` for public suggest; `private, no-store` for authed).
- Images: long-lived immutable URLs (content-hash or CDN versioning).

### 5.6 Anti-patterns

- Assuming Next 14 “fetch cached by default.”
- Caching authenticated HTML at the CDN.
- Infinite `revalidate = false` for home without a purge pipeline — stale photography is a product bug.
- Relying only on client Query cache for SEO-critical pages.

---

## 6. Error handling

### 6.1 Layered model

| Layer | Mechanism | User experience |
|-------|-----------|-----------------|
| Route segment | `error.tsx` | Replace segment; recover via reset; keep parent layout chrome when possible |
| Global | Root `error.tsx` | Last resort full-page error |
| Not found | `not-found.tsx` + `notFound()` | Honest empty entity (“Product not in database”) |
| Component | Error boundary around risky client islands (gallery, 3D later) | Isolate failure; rest of PDP works |
| Mutations | Server Action result / toast | Inline field errors + optional toast |
| Network (Query) | Query `isError` UI | Retry; no silent empty grids |

### 6.2 Policies

- **Expected emptiness ≠ error.** Zero search hits → empty state with suggestions. Missing product slug → `notFound()`.
- **Toasts:** for **confirmations and failures of user-initiated actions** (save build, copy link, add-to-compare overflow). Not for every fetch failure on first paint — prefer in-route error UI.
- **Toast library:** one system only (e.g. Sonner); live region compliant.
- **Logging:** `error.tsx` and Action catch blocks report to observability with route, digest, and request id — never leak stacks to users.
- **Partial failure:** if “Used by players” fails but product core loaded, show product + inline error for the secondary section (streaming-friendly).

### 6.3 Anti-patterns

- `window.alert` for API errors.
- Catch-all client boundary that hides RSC errors without recovery.
- Toasting on every React Query miss during scroll.

---

## 7. Loading strategy

### 7.1 `loading.tsx` + Suspense

- Provide `loading.tsx` for heavy segments: `/equipment`, PDP, `/players/[slug]`, `/builder`, `/search`.
- Prefer **skeletons that match photography layout** (aspect-ratio gray/blur blocks) over generic spinners — perceived performance and CLS.
- Use nested `<Suspense>` for secondary PDP sections (“Similar”, “Used by”) so the hero streams first.

### 7.2 Streaming priorities (PDP example)

1. Identity shell + **primary image** (LCP)
2. Core attributes
3. Gallery thumbs / additional angles
4. Used-by / similar / setups

### 7.3 Infinite grids

- First page: RSC.
- Subsequent pages: client fetch + skeleton row at bottom.
- Preserve scroll restoration on back navigation (App Router + careful cache).

### 7.4 Anti-patterns

- Full-route blocker spinner with no layout reserve (CLS + anxiety).
- Skeleton that doesn’t match final grid → layout jump.
- Waiting for all secondary sections before showing hero.

---

## 8. Code splitting

### 8.1 Requirements

- Route-based splitting via App Router (default).
- Feature islands: dynamic import Client Components that are heavy:
  - Framer Motion-enhanced galleries
  - Builder canvas / visual assembler
  - Compare matrix virtualization
  - Future AI assistant panel
- Keep `packages/ui` entrypoints **tree-shakeable** (avoid barrel files that re-export everything into one chunk).

### 8.2 Provider placement

Root layout providers must be minimal:

- Theme (if any) / toast viewport
- TanStack `QueryClientProvider` (client island wrapping children)
- Compare tray provider (thin)

**Do not** wrap the entire app in Framer Motion `MotionConfig` that pulls animation into every route unless measured cost is trivial.

### 8.3 Anti-patterns

- Oversized shared `components/index.ts` barrels.
- Importing builder code from the home page.
- Single `"use client"` layout that client-renders the whole marketing/explore experience.

---

## 9. Lazy loading

| Asset / module | Strategy |
|----------------|----------|
| Below-fold grid images | `next/image` default lazy |
| LCP / hero | `priority` |
| Builder route JS | `next/dynamic` with skeleton |
| Compare workspace heavy grid | Load on `/compare` or when tray opens workspace |
| Typeahead panel | Load on focus / first character |
| Analytics / observability | Load after idle / interaction |
| Framer Motion | Import only inside animated islands |

**Virtualization:** For large catalogs, use windowing (e.g. TanStack Virtual) once grids exceed ~100–150 DOM nodes — measure before adding complexity; photography grids are expensive in layout and decode.

---

## 10. Performance — Core Web Vitals budgets

Photography-first UIs fail CWV without budgets. Treat these as **release gates** for primary routes (`/`, `/equipment`, PDP, `/search`).

### 10.1 Budgets (targets)

| Metric | Target (p75 mobile) | Notes |
|--------|---------------------|-------|
| **LCP** | ≤ 2.5s | Hero image optimized; priority; CDN |
| **INP** | ≤ 200ms | Keep handlers light; debounce search; avoid huge synchronous work on keypress |
| **CLS** | ≤ 0.1 | Aspect-ratio reserves; font strategy; no late-injected badges on images |
| **TTFB** | ≤ 0.8s (cache hit) | ISR/CDN for public pages |
| JS (route initial) | Tight budget — set numeric cap at bootstrap (e.g. ≤ 150–200KB gzipped critical) | Measure with Next bundle analyzer |

### 10.2 Image-heavy specific rules

- Cap concurrent image decodes in view (grid column count × quality).
- Prefer AVIF/WebP via CDN/`next/image`.
- Quality defaults: thumbs 60–75; hero 75–85 — tune with visual QA, not max quality everywhere.
- Avoid animating `width`/`height` of images; animate opacity/transform only.

### 10.3 Motion

- Framer Motion for orientation (grid → PDP, tray → compare), not continuous decoration.
- Respect `prefers-reduced-motion`.

### 10.4 Measurement

- Local: Lighthouse CI on key routes with representative image fixtures.
- Prod: RUM (Web Vitals) — see Observability §16-adjacent.

---

## 11. Accessibility

Visual-first ≠ vision-only ([Product Vision §13](../PRODUCT_VISION.md)).

### 11.1 Requirements

- Semantic landmarks: `header`, `main`, `nav`, `search`.
- Focus visible on all interactive controls (design-system token).
- Keyboard: search shortcut, compare add/remove, gallery arrows, builder slots.
- Alt text from media metadata; product name fallback.
- Compare tray and dialogs: focus trap, `Escape`, return focus.
- Live regions for toast and “added to compare.”
- Color contrast for text over photography: use scrims/surfaces from design system — never low-contrast text on busy images.
- Hit targets ≥ 44px on mobile for primary actions.
- Do not rely on color alone for attribute differences in compare matrix.

### 11.2 Testing

- Automated: axe on critical routes in CI.
- Manual: keyboard-only pass on PDP, search, compare, builder.

---

## 12. SEO

### 12.1 Requirements

- Server-rendered HTML for all public entity pages (RSC).
- Unique `<title>` and meta description per entity via `generateMetadata`.
- Canonical URLs for products/players/collections.
- `sitemap.ts` including products/players (chunk if large).
- `robots.ts` — allow public catalog; disallow private/user routes when they exist.
- Open Graph images: prefer product hero derivative; fallback brand OG.
- Structured data (JSON-LD): `Product`, `Person` (player), `BreadcrumbList` — **without** Offer/price as primary (not a store). If reference prices appear later, mark carefully and sparingly.
- Clean slugs; stable redirects when names change (alias table).

### 12.2 Anti-patterns

- Client-only entity pages.
- Duplicate titles (“TTSetupBuilder” on every page).
- Indexing infinite filter combinations — `noindex` thin facet URLs or canonicalize to primary browse.

---

## 13. SSR (Server-Side Rendering)

In App Router terms: **dynamic rendering** on each request when data must be fresh or request-specific.

### 13.1 When to SSR (dynamic)

- Authenticated views (saved private builds)
- Preview/draft editorial
- Requests that read cookies/headers for personalization
- Immediately-after-mutation confirmation surfaces when cache not yet warmed

### 13.2 How

- Avoid accidental dynamic opt-in: calling `cookies()`, `headers()`, or uncached `fetch` in a layout forces dynamic for the subtree — isolate personalization to small children.
- Prefer passing user-specific bits as a client island fed by a tiny dynamic server child rather than dynamizing the entire catalog layout.

---

## 14. ISR (Incremental Static Regeneration)

### 14.1 Primary strategy for the catalog

Public photography database pages should be **mostly ISR / time+tag revalidated**, not fully static forever and not fully dynamic.

| Route type | Suggested approach |
|------------|--------------------|
| Home / Explore | `revalidate` minutes–hour + tag `home` |
| Equipment index | `revalidate` + tags per category |
| PDP | On-demand `revalidateTag('product:'+slug)` after media/attribute updates; fallback time-based |
| Player pages | Same pattern with `player:` tags |
| Collections | Revalidate when membership changes |

### 14.2 On-demand revalidation

- Scraper/editorial pipeline calls a **protected** server endpoint or queue worker that invokes `revalidateTag`.
- Never expose unauthenticated purge.

### 14.3 Build-time static generation

- `generateStaticParams` for top-N popular products/players at build; remainder on-demand ISR.
- Do not try to SSG the entire catalog at once once scale hits thousands + heavy media.

---

## 15. Client Components

### 15.1 Allowed reasons to use `"use client"`

- Event handlers (click, drag, keyboard)
- Browser APIs (localStorage, IntersectionObserver, clipboard)
- Zustand / TanStack Query / Framer Motion
- Controlled inputs (search box, builder slots)
- Compare tray interactions

### 15.2 Rules

- Push `"use client"` to **leaf** components.
- Pass server-fetched data as props; do not re-fetch the same data on mount without cause.
- Keep Client Component files small; extract presentational children that can stay server components when possible (pass as `children`).

### 15.3 Anti-patterns

- `"use client"` on `layout.tsx` for the whole app.
- Large client tables for catalog browse when a server-rendered grid + small client pager works.
- Storing server secrets or privileged tokens in client state.

---

## 16. Server Components

### 16.1 Default

Every component is a Server Component unless marked otherwise.

### 16.2 Responsibilities

- Data fetching for public pages
- `generateMetadata`
- Access to `packages/database` and secrets
- Composing Client islands into a server tree
- Streaming with Suspense

### 16.3 Composition pattern

```text
ProductPage (Server)
  ├─ ProductHeroImage (Server, priority image)
  ├─ ProductGallery (Client island) ← receives images[] props
  ├─ ProductAttributes (Server)
  ├─ Suspense → UsedByPlayers (Server)
  └─ Suspense → SimilarEquipment (Server)
```

### 16.4 Anti-patterns

- Serial waterfalls of unrelated awaits — use `Promise.all` where safe.
- Passing non-serializable props (functions, class instances) into Client Components.
- Importing client-only modules into server files accidentally (build will fail — keep boundaries clean).

---

## 17. Routing alignment & key product flows

### 17.1 Global chrome

Per NAVIGATION.md §4: Explore, Equipment, Players, Builder, Compare (+ overflow for Videos/Reviews/News/Collections/Brands), search utility, compare tray indicator, eventual account. No ecommerce cart icon. Sticky header must not obscure PDP heroes (prefer hide-on-scroll-down on mobile).

### 17.2 Compare tray persistence

1. User adds items from grid/PDP/search → update URL compare params + tray store.
2. Tray survives navigations via Zustand; selection survives share via URL.
3. Opening Compare workspace routes to `/compare` with same params.
4. Max N items (define in FUNCTIONAL_REQUIREMENTS; enforce in UI with message).

### 17.3 Builder state

- `/builder` — empty or hydrated from local draft.
- “Open player setup in builder” — navigates with seed query or creates draft server-side then redirects to `/builder/[buildId]`.
- Compatibility guidance is non-punitive (Product Vision §9.6).

### 17.4 Search

- `/search?q=` is canonical; header typeahead commits here on Enter.
- Filters sync to URL; RSC renders results for SEO and first paint.
- Debounced suggest uses Query + lightweight endpoint.

---

## 18. Environment configuration

### 18.1 Files (target)

| File | Scope |
|------|--------|
| `.env.example` | Documented keys (committed) |
| `.env.local` | Developer secrets (gitignored) |
| Hosting env | Production/staging |

### 18.2 Variable conventions

- `NEXT_PUBLIC_*` only for **truly public** values (CDN base URL, public analytics write key).
- Server-only: database URLs, revalidation secrets, auth secrets, scraper callback secrets.
- Validate env at build/runtime with Zod (`lib/env.ts`) — fail fast on missing server secrets.
- Feature flags: prefer server-read flags passed as props over shipping all flags publicly.

### 18.3 Monorepo

- Each app/package reads only what it needs.
- Shared public constants may live in `packages/config` if non-secret.

---

## 19. Observability (high level)

Instrument without harming CWV.

| Signal | Approach |
|--------|----------|
| Web Vitals | `useReportWebVitals` or platform RUM; sample on photo-heavy routes |
| Errors | Boundary digests + server logs; correlate with `x-request-id` |
| Performance | Trace SSR/ISR timings for PDP and search |
| Product analytics | Privacy-respecting events: photo view depth, compare use, builder save — **not** affiliate funnels |
| Images | CDN metrics (cache hit ratio, transform latency) |

Load third-party scripts via `next/script` with `afterInteractive` or `lazyOnload`. No blocking tags in `<head>` beyond essentials.

---

## 20. Styling & motion alignment

- TailwindCSS with shared preset from `@ttsetupbuilder/config`.
- Design tokens and component APIs: follow `docs/ui/DESIGN_SYSTEM.md` and `COMPONENT_LIBRARY.md` when published.
- Framer Motion only in Client islands; respect reduced motion.
- Photography-first layout rules from Product Vision override decorative dashboard patterns.

---

## 21. Testing strategy (frontend)

| Layer | Focus |
|-------|--------|
| Unit | URL parsers, compare selection reducers, builder compatibility helpers |
| Component | UI package primitives; gallery keyboard behavior |
| Integration | Search params ↔ tray sync |
| e2e (Playwright) | Explore → PDP → compare → builder smoke; LCP smoke with fixtures |
| Visual | Optional screenshot diffs for PDP/grid |

Do not block Phase 1 docs on full e2e; require fixtures for image pipeline before performance CI.

---

## 22. Security notes (frontend-relevant)

- CSP-friendly script loading.
- No `dangerouslySetInnerHTML` for CMS HTML without sanitization.
- Authz on Server Actions (never trust client-only checks).
- Rate-limit public suggest APIs.
- Revalidation endpoint protected by secret.

---

## 23. Bootstrap checklist (when implementation starts)

1. Pin Next.js 15 App Router in `apps/web` with `src/`.
2. Wire monorepo aliases and `server-only` boundaries.
3. Establish image remotePatterns + media DTO.
4. Implement Explore + Equipment grid + PDP RSC with ISR tags.
5. Add search URL + typeahead Query.
6. Add compare URL + tray persistence.
7. Add builder Zustand + shareable `buildId`.
8. Add error/loading/not-found per critical segment.
9. Turn on Web Vitals + bundle analysis gates.
10. Reconcile paths with `docs/NAVIGATION.md` when available.

---

## 24. Document control

| Field | Value |
|-------|--------|
| Title | Frontend Architecture — TTSetupBuilder |
| Location | `docs/architecture/FRONTEND_ARCHITECTURE.md` |
| Depends on | `docs/PRODUCT_VISION.md` |
| Change policy | Update with Next major upgrades and IA changes; note in `CHANGELOG.md` |

**Bottom line:** Build an RSC-first, ISR-friendly Next.js 15 app where photography performance and shareable exploration state (search, compare, builder) are architectural pillars — and where Zustand, TanStack Query, and the URL each own a clear slice of state without bloating the client.
