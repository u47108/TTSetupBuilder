# Product Vision — TTSetupBuilder

> The world's best visual table tennis equipment database and setup builder.

**Status:** Living document  
**Audience:** Product, design, engineering, AI assistants working on this repo  
**Constraint:** This is **not** an ecommerce website. There is no cart, no checkout, no “Buy now” as a primary action.

---

## 1. One-sentence vision

TTSetupBuilder is a photography-first platform for discovering, understanding, comparing, and composing table tennis equipment — and for exploring how professionals actually play with it.

---

## 2. What we are (and are not)

### 2.1 We are

| Analogy | What we take from it |
|---------|----------------------|
| **PCPartPicker** | Compatibility-aware composition; clear “build” mental model; side-by-side specs; community-readable setups |
| **Apple Store** | Product photography as hero; calm hierarchy; materials and detail; premium browsing without clutter |
| **Steam** | Rich discovery surfaces; tags, similarity, “you might also like”; media-forward product pages; collections |
| **IMDB** | Entity graph (products ↔ players ↔ setups ↔ eras); deep pages; credits-like relationships; “people also viewed” |
| **Google Photos** | Visual density; fast scrolling; search that feels like finding a photo; gallery as first-class UX |

The product should feel like **opening a curated equipment museum that you can search, compare, and assemble** — not like browsing a shop.

### 2.2 We are not

- A retailer or marketplace
- A price-comparison engine (prices may appear as *reference context*, never as the page’s job)
- A blog with a thin product shell
- A generic SaaS dashboard
- A “dark mode admin panel” for rackets

**Anti-goals (explicit):**

- Do not optimize conversion funnels.
- Do not bury photography under CTAs, badges, or promo chips.
- Do not design pages around SKU variants before the visual identity of the product is clear.
- Do not treat the racket builder as a checkout configurator.

---

## 3. Problem statement

Table tennis equipment research is fragmented across:

- Manufacturer sites (marketing copy, incomplete catalogs, weak comparison)
- Forums and social posts (anecdotal, hard to search, inconsistent photos)
- Retailers (sales-first layouts, low-quality or inconsistent imagery)
- Spreadsheets and Discord tips (not visual, not durable, not shareable)

Players and enthusiasts cannot easily answer:

1. What does this blade / rubber / shoe *look like* in honest detail?
2. How does it relate to similar gear?
3. Who uses it, and in what full setup?
4. Can I compose a coherent racket and see it as a system?
5. How do I discover options I don’t already know by name?

**TTSetupBuilder exists to close that gap** with a single, visual, searchable knowledge base.

---

## 4. North-star outcome

A user who arrives with curiosity (not a shopping list) should leave with:

- A clearer mental model of the equipment landscape
- A shortlist of relevant products they *understand*
- Optionally, a saved racket build and/or player setups they care about
- The ability to return later and continue exploration without starting over

**North-star metric (directional, not vanity):**  
*Successful exploration sessions* — sessions where the user viewed product photography in depth, used search or comparison meaningfully, and/or engaged with a build or player setup — relative to total sessions.

Secondary signals: time-to-first meaningful photo view, comparison usage rate, builder completion rate, player-setup depth, return visits within 7/30 days.

**Non-metrics we refuse to optimize early:** add-to-cart equivalents, affiliate click-through, revenue.

---

## 5. Primary user jobs

### Job A — Discover

“Show me equipment I didn’t know how to ask for.”

Surfaces: visual grids, collections, tags, eras, brands, playing styles, “similar to…”, featured photography.

### Job B — Search

“Find this exact thing — or the closest match — fast.”

Surfaces: instant search, fuzzy name matching, filters that don’t destroy visual browsing, photo-aware results.

### Job C — Compare

“Put these next to each other and tell me the differences that matter.”

Surfaces: multi-select comparison, aligned photography, structured attributes, honest “unknown” states.

### Job D — Build

“Assemble a racket as a system I can see and share.”

Surfaces: interactive racket builder, compatibility rules, visual preview, export/share of a setup.

### Job E — Explore professionals

“See what the best players actually use — as full setups, not rumor lists.”

Surfaces: player pages, setup timelines, equipment credits, cross-links into product pages.

### Job F — Learn

“Understand what this product is for without marketing fluff.”

Surfaces: structured product knowledge, materials, intended use, historical notes, community-sourced clarity (later).

### Job G — Find similar

“Given this rubber/blade, what else sits in the same neighborhood?”

Surfaces: similarity graph, visual neighbors, attribute proximity, “players who use X also use Y.”

---

## 6. Core entities (product domain)

These entities are the permanent vocabulary of the product. UI, search, and data model must orbit them.

### 6.1 Equipment (Product)

Anything a player might choose as gear. Categories include (non-exhaustive):

- Blades (woods)
- Rubbers (forehand / backhand oriented listing, but product is singular)
- Balls
- Shoes
- Apparel (optional later)
- Tables / barriers / robots (optional later)
- Accessories (glue, edge tape, cleaners — carefully scoped)

Each product has:

- Identity (canonical name, brand, aliases, SKUs if known)
- **Primary photography set** (non-negotiable quality bar)
- Category and taxonomy
- Structured attributes (speed/spin/control ratings *when sourced*; materials; ply; sponge thickness options as *variants*, not separate “sales SKUs” in the UX sense)
- Relationships (similar products, often paired with, supersedes/superseded by)
- Appearances in player setups and user builds

### 6.2 Brand

Manufacturer or label. Brand pages are discovery hubs, not storefronts.

### 6.3 Player (Professional)

A competitive player entity with:

- Identity and career context (light; we are not a full biography site first)
- Setup history over time
- Links to equipment entities
- Photography of the player *in service of equipment storytelling* (secondary to product photos)

### 6.4 Setup

A coherent configuration:

- **Player setup** — attributed, dated when possible (“2024 World Championships blade/rubber combination”)
- **User build** — created in the racket builder; shareable; private by default until shared

A setup is a first-class object, not a footnote on a product page.

### 6.5 Collection / List

Curated or algorithmic groupings: “Chinese national team FH rubbers”, “All-wood offensive blades”, “Shoes favored on plastic ball era”, etc.

### 6.6 Media asset

Photos (and later video) with metadata: angle, lighting notes, source, rights, product linkage. **Media is not decoration; it is inventory.**

---

## 7. Photography doctrine (the most important asset)

### 7.1 Principle

If the photography is weak, the product fails — regardless of feature completeness.

Users should feel they can *inspect* equipment: grain of the blade face, sponge texture, logo placement, rubber topsheet sheen, shoe sole pattern.

### 7.2 Quality bar (target)

For core catalog items (blades, rubbers, high-interest accessories):

| Shot type | Purpose |
|-----------|---------|
| Hero / packshot | Immediate recognition in grids |
| Detail / macro | Material truth |
| Angle set (front, back, edge) | Spatial understanding |
| In-context (optional) | Scale and use — never replace hero clarity |
| Comparison plate (optional) | Same lighting across products for fair compare |

Consistency across the catalog matters more than occasional spectacular one-offs.

### 7.3 UX implications of photography-first

1. **Grids are photo grids**, not title + thumbnail + price rows.
2. Product pages open on media; text supports the eye, not the reverse.
3. Comparison views align photos before aligning tables.
4. Search results remain visually scannable at high density.
5. Lazy-loading and responsive image pipelines are product features, not infra trivia.
6. Empty or missing photo states are treated as data debt, visibly tracked — not silent broken thumbnails.

### 7.4 What photography must never be forced to compete with

- Floating promo badges
- Aggressive sale ribbons
- Dense metadata chrome on the image itself
- Autoplay video that steals focus from still inspection (if video arrives later, it is opt-in and secondary)

---

## 8. Experience pillars

Five pillars rank above all feature requests. If a proposal conflicts with a pillar, the pillar wins.

### 8.1 Photography

Visual truth and beauty of equipment.

### 8.2 Speed

Perceived and actual performance: instant search, snappy grids, fast navigation between related entities. Exploration dies if every click feels heavy.

### 8.3 Comparison

Fair, structured, multi-item comparison as a native verb — not a bolted-on table.

### 8.4 Search

Name search, alias search, filter search, and “visual neighborhood” discovery must all feel first-class.

### 8.5 Discoverability

Users who don’t know the right keyword still find paths: tags, similar items, player graphs, collections, “explore” surfaces.

---

## 9. Key product surfaces

### 9.1 Home / Explore

**Job:** Invite visual wandering.

- Large photography
- A few curated entry points (not a dashboard of widgets)
- Clear paths: Equipment · Players · Builder · Search
- Avoid first-viewport clutter (stats strips, news modules, affiliate banners)

Mood: Apple Store calm + Steam discovery energy, without Steam’s commercial noise.

### 9.2 Equipment catalog (browse)

**Job:** Scan thousands of products without fatigue.

- Dense but breathable photo grid
- Sticky, lightweight filters (category, brand, playing distance/style tags, era)
- Sort that respects exploration (relevance, newest photography, popularity of views — not “best selling”)
- Infinite or paginated loading that never feels broken

### 9.3 Search

**Job:** Resolve intent in under a second of perceived latency.

Capabilities:

- Exact and fuzzy name match (brands, model numbers, colloquial names)
- Alias resolution (“Hurricane 3” ↔ “H3” ↔ local-language names)
- Typeahead with photo thumbnails
- Filters applied without leaving the visual results metaphor
- Empty states that suggest similar queries and popular explorations

Search is a **place**, not only a header box.

### 9.4 Product detail page (PDP)

**Job:** Make the user understand the object.

Layout philosophy:

1. Media gallery dominates
2. Identity and taxonomy next
3. Structured attributes
4. “Used by” professionals
5. Similar equipment
6. Appears in setups / builds
7. Learning notes / lore (sourced)

There is **no** primary purchase CTA. External links, if any, live as low-emphasis references (“Manufacturer page”, “Community discussion”) — never as the page’s purpose.

### 9.5 Comparison

**Job:** Decide between N items with eyes and attributes.

- Select from grid, search, or PDP (“Add to compare”)
- Dedicated compare workspace with synchronized photo slots
- Attribute matrix with highlight of differences
- Ability to pin a “baseline” product
- Shareable compare URLs

Target: feel as natural as PCPartPicker’s compare, with photography closer to a studio lookbook.

### 9.6 Racket builder

**Job:** Compose a system: blade + FH rubber + BH rubber (+ optional extras).

Principles:

- Visual assembly is central (see the racket as a whole)
- Compatibility and conventions are guidance, not punitive walls (document assumptions)
- Specs aggregate into a readable build summary
- Save / share / duplicate builds
- “Open this player’s setup in builder” as a bridge from pro exploration

This is **PCPartPicker for rackets**, presented with **Apple-level product respect**.

### 9.7 Player pages

**Job:** IMDB-like entity page for a player’s equipment story.

- Current / notable setups with photography of the gear
- Timeline of equipment changes when known
- Cross-links to every product entity
- Related players (teammates, same equipment cluster) as discovery, carefully — avoid tabloid framing

### 9.8 Similar equipment

**Job:** Neighborhood exploration.

Entry points from every PDP and many compare states.

Signals may include: brand family, attributes, co-occurrence in setups, editorial tags, embedding-based similarity (later). UX must explain *why* something is similar when possible (“same sponge hardness band”, “often FH pair with …”).

### 9.9 Collections

**Job:** Human-meaningful slices of the catalog.

Editorial and algorithmic collections power discoverability at scale when the catalog reaches thousands of SKUs.

---

## 10. Information architecture (conceptual)

```text
Explore
├── Equipment
│   ├── Category → Brand → Product
│   ├── Search
│   ├── Compare tray / workspace
│   └── Similar / Collections
├── Players
│   ├── Player → Setups → Products
│   └── Equipment co-occurrence
├── Builder
│   ├── New build
│   ├── From player setup
│   └── Saved builds
└── Learn (lightweight; grows with catalog quality)
```

Global chrome stays minimal: search, primary nav, compare indicator, account/saved (when auth exists).

---

## 11. Interaction principles

1. **Eyes first, text second.** If a screen works with images muted, the design failed.
2. **One job per major section.** Don’t stack unrelated modules to “use the space.”
3. **Selection is a verb.** Multi-select for compare should feel as native as single open.
4. **State is shareable.** Builds, compares, and filtered explorations should be URL-addressable where practical.
5. **Honesty over completeness.** Prefer “Unknown” / “Unverified” over invented ratings.
6. **Density with grace.** Thousands of products require density; density must remain elegant (Steam library energy, Apple spacing discipline).
7. **Keyboard and power-user paths.** Search shortcuts, compare shortcuts, builder efficiency — without hiding the visual path.
8. **Motion serves orientation.** Transitions clarify hierarchy (gallery → detail, grid → compare), not decoration.

---

## 12. Content & data principles

### 12.1 Canonical truth

One canonical product entity per real-world model (with variants for sponge thickness, color, etc., nested under the product — not exploding the catalog into unbrowseable SKU spam).

### 12.2 Provenance

Attributes and setup claims should carry source confidence:

- Manufacturer
- Verified editorial
- Community-submitted (later, moderated)
- Inferred / AI-suggested (always labeled)

### 12.3 Scale assumptions

Design and architecture must assume:

- **Thousands** of products
- **Hundreds** of professional players
- Many-to-many relationships between players, setups, and products
- Large media libraries (image CDN, variants, responsive sizes)

Performance budgets and search indexing are product requirements from day one of implementation planning — even while this vision phase remains documentation-only.

### 12.4 International names

Equipment culture is multilingual. Aliases and localized names are part of search identity, not an afterthought.

---

## 13. Trust & ethics

- No dark patterns that push purchases
- Clear distinction between fact, estimate, and opinion
- Respect for image rights and attribution
- Player equipment claims labeled by confidence (rumored vs confirmed)
- Accessibility: visual-first does not mean vision-only — alt text, captions, and structured data are mandatory for a serious database

---

## 14. Success scenarios (narrative)

### Scenario A — The curious intermediate

Maya hears “Dignics 09C” in a podcast. She searches, lands on a photo-heavy product page, opens similar rubbers, adds three to compare, then opens a player who uses one of them. She leaves with a shortlist and a mental model — without buying anything.

### Scenario B — The builder

Luis wants a new setup. He starts from a pro’s 2023 setup in the builder, swaps the blade, compares two FH candidates side by side with matched photos, saves a build link to Discord.

### Scenario C — The visual browser

Asha doesn’t know what she wants. She opens Explore, filters “innerfiber blades”, scrolls a photography grid like a gallery, favorites four heroes, and later uses “find similar” from her favorite.

### Scenario D — The researcher

Kenji is writing notes on equipment eras. He uses player timelines and collection pages to map which rubbers dominated a period, jumping constantly between player and product entities (IMDB-style graph walking).

---

## 15. Explicit non-features (near-term)

Out of scope until the visual database and core exploration loops are excellent:

- Cart, checkout, inventory, shipping
- Affiliate-optimized layouts
- Heavy social feed / Instagram clone
- Real-time multiplayer anything
- Full CRM / seller tools
- Generic “AI chatbot homepage” that replaces search and photography

AI recommendations (when they arrive) must **assist exploration**, not replace the catalog experience or invent unverifiable product claims.

---

## 16. Phased product intent (aligned with roadmap)

| Phase | Product intent |
|-------|----------------|
| **1** | Vision, architecture, UI direction — establish taste and constraints |
| **2** | Product + player databases + search — the catalog becomes real |
| **3** | Racket builder — composition as a first-class verb |
| **4** | Scrapers — scale acquisition carefully with quality gates (esp. media) |
| **5** | AI assistant — recommendation and Q&A grounded in the database (RAG) |
| **6** | Community — reviews, contributions, shared builds — without turning into a marketplace |

Each phase must leave photography, speed, comparison, search, and discoverability stronger than before.

---

## 17. Design taste summary (for Cursor and humans)

When generating UI or copy, ask:

1. Does photography lead?
2. Would this screen still make sense if we removed every sales affordance?
3. Can I compare or find similar from here in ≤2 interactions?
4. Does this help at *catalog scale* (thousands), not only at demo scale (12 products)?
5. Is this closer to a **database you love browsing** than a **store you endure**?

If the answer fails any of these, redesign before coding.

---

## 18. Brand of the experience (emotional target)

Users should feel:

- **Respect** for the equipment and the sport
- **Clarity** instead of hype
- **Momentum** while exploring
- **Confidence** that data is careful
- **Desire to keep browsing** because the visuals and relationships reward curiosity

They should never feel:

- Upsold
- Lost in a dashboard
- Distrusted by fake precision
- Fatigued by chrome

---

## 19. Open questions (to resolve in architecture / ADRs)

These do not block this vision; they must be answered before implementation hardens:

1. Variant model: how sponge thicknesses and colors nest under products in UX vs data.
2. Rating systems: adopt manufacturer scales, normalize across brands, or avoid pseudo-precision?
3. Media pipeline: editorial photography standards vs community uploads vs scraped images.
4. Auth timing: when do saved builds and favorites require accounts?
5. Offline / PWA ambitions for tournament-side browsing.
6. Localization strategy for UI vs catalog aliases.

---

## 20. Document control

| Field | Value |
|-------|--------|
| Title | Product Vision — TTSetupBuilder |
| Location | `docs/PRODUCT_VISION.md` |
| Companion docs (planned) | `docs/architecture/ARCHITECTURE.md`, ADRs in `docs/decisions/` |
| Change policy | Update when product intent shifts; link significant changes from `CHANGELOG.md` |

---

**Bottom line:** TTSetupBuilder wins by being the most trustworthy, fastest, and most beautiful way to *see and understand* table tennis equipment — and to compose and relate it through players and builds — not by selling it.
