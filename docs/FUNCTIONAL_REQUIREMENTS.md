# Functional Requirements — TTSetupBuilder

| Field | Value |
|-------|--------|
| Document ID | FR-TTSB-001 |
| Version | 0.1.0 |
| Status | Draft — living requirements baseline |
| Audience | Product, engineering, design, QA, AI coding agents |
| Related docs | [PRODUCT_VISION.md](./PRODUCT_VISION.md), [ROADMAP.md](../ROADMAP.md) |
| Scope constraint | **Not ecommerce.** No cart, checkout, or primary purchase conversion flows. |

**Requirement notation**

| Prefix | Meaning |
|--------|---------|
| FR | Functional requirement (system shall…) |
| NFR | Non-functional requirement |
| US | User story |
| FF | Future / deferred feature |
| MoSCoW | Must / Should / Could / Won’t (this release horizon) |

Priority horizon maps to roadmap phases unless noted:

- **P2** — Phase 2 (Database + Search)
- **P3** — Phase 3 (Builder)
- **P4** — Phase 4 (Scrapers / scale ingestion)
- **P5** — Phase 5 (AI Assistant)
- **P6** — Phase 6 (Community)
- **Admin** — cross-cutting operational capability (may land incrementally)

---

## 1. Purpose

This document specifies **what the software must do** for TTSetupBuilder: a photography-first table tennis equipment database enabling discovery, search, comparison, racket composition, professional setup exploration, learning, and similarity browsing.

It does **not** specify implementation, UI frameworks, or APIs. Those belong in architecture and design docs.

---

## 2. Definitions

| Term | Definition |
|------|------------|
| Product / Equipment | Canonical catalog entity (blade, rubber, shoe, accessory, etc.) |
| Variant | Nested option under a product (e.g., sponge thickness, color) |
| Player | Professional (or notable competitive) athlete entity |
| Setup | Coherent equipment configuration (player-attributed or user-created) |
| Build | User-created setup produced via the Racket Builder |
| Collection | Curated or algorithmic grouping of products/players |
| Compare set | Ordered selection of products for side-by-side comparison |
| Media asset | Image (later video) linked to one or more entities with metadata |
| Alias | Alternate name/string that resolves to a canonical entity |
| Confidence | Provenance label: manufacturer / editorial / community / inferred |

---

## 3. User Personas

### 3.1 Persona P1 — Curious Intermediate Player (“Maya”)

| Attribute | Detail |
|-----------|--------|
| Goal | Understand gear options and shortlist without buying pressure |
| Frequency | Weekly browsing; spikes before equipment changes |
| Skills | Knows common brand names; weak on obscure aliases |
| Needs | Fast search, clear photos, similar items, light learning content |
| Pain | Fragmented forums; retailer pages; inconsistent photos |

### 3.2 Persona P2 — Setup Builder (“Luis”)

| Attribute | Detail |
|-----------|--------|
| Goal | Compose and share a coherent racket setup |
| Frequency | Intense sessions when changing blade/rubbers |
| Skills | Understands FH/BH pairing; wants compatibility guidance |
| Needs | Builder, compare, open-from-player-setup, shareable links |
| Pain | Spreadsheets; Discord screenshots; no visual system view |

### 3.3 Persona P3 — Pro Gear Follower (“Asha”)

| Attribute | Detail |
|-----------|--------|
| Goal | See what professionals use and how setups evolve |
| Frequency | Regular exploration of players and tournaments eras |
| Skills | Recognizes many pros; tracks rumor vs confirmed gear |
| Needs | Player profiles, setup timelines, confidence labels, deep links to products |
| Pain | Unsourced rumors; outdated wiki lists |

### 3.4 Persona P4 — Visual Browser (“Ken”)

| Attribute | Detail |
|-----------|--------|
| Goal | Discover by looking, not by knowing the name |
| Frequency | Casual long scroll sessions |
| Skills | Low keyword precision; high visual preference |
| Needs | Dense photo grids, collections, filters that preserve visuals |
| Pain | Text-heavy catalogs; tiny thumbnails |

### 3.5 Persona P5 — Equipment Researcher (“Sofia”)

| Attribute | Detail |
|-----------|--------|
| Goal | Accurate attributes, relationships, historical context |
| Frequency | Deep research sessions |
| Skills | High; sensitive to false precision |
| Needs | Structured attributes, provenance, compare matrix, honest unknowns |
| Pain | Marketing ratings treated as fact |

### 3.6 Persona P6 — Contributor / Moderator (“Omar”) — Phase 6+ / Admin

| Attribute | Detail |
|-----------|--------|
| Goal | Improve catalog quality (data, photos, setups) |
| Needs | Submission flows, moderation queues, audit trail |
| Pain | Unstructured community edits without review |

### 3.7 Persona P7 — Administrator (“Admin”)

| Attribute | Detail |
|-----------|--------|
| Goal | Operate catalog integrity at thousands of products / hundreds of players |
| Needs | CRUD, media management, merge/dedupe, scrape review, publish controls |
| Pain | Manual spreadsheet ops; inconsistent media |

### 3.8 Persona P8 — Guest Visitor

| Attribute | Detail |
|-----------|--------|
| Goal | Explore without account friction |
| Needs | Full public browse/search/compare/view; soft prompts to save only when needed |
| Constraint | Builds/favorites persistence may be local or require auth (see FR-AUTH) |

---

## 4. User Stories

### 4.1 Discovery & navigation

| ID | Story | Priority |
|----|-------|----------|
| US-NAV-01 | As a guest, I want a clear primary navigation so I can reach Equipment, Players, Builder, and Search in one action. | Must / P2 |
| US-NAV-02 | As a visual browser, I want an Explore/home surface led by photography so I can start without a keyword. | Must / P2 |
| US-NAV-03 | As a user, I want breadcrumb or equivalent orientation so I know where I am in brand/category/product hierarchy. | Should / P2 |
| US-NAV-04 | As a user, I want deep links to any product, player, setup, build, compare set, or collection. | Must / P2–P3 |
| US-NAV-05 | As a user, I want a persistent compare indicator showing how many items are selected. | Must / P2 |

### 4.2 Search

| ID | Story | Priority |
|----|-------|----------|
| US-SEA-01 | As Maya, I want typeahead search with photo thumbnails so I can confirm the right model quickly. | Must / P2 |
| US-SEA-02 | As Maya, I want aliases and colloquial names to resolve to canonical products. | Must / P2 |
| US-SEA-03 | As Ken, I want filters that do not collapse the experience into a text table. | Must / P2 |
| US-SEA-04 | As Sofia, I want to search by brand, category, and structured attributes. | Must / P2 |
| US-SEA-05 | As a user, I want empty states with suggested queries and popular explorations. | Should / P2 |
| US-SEA-06 | As a user, I want search to include players and setups, not only products. | Should / P2 |

### 4.3 Products

| ID | Story | Priority |
|----|-------|----------|
| US-PRD-01 | As Ken, I want a photo-first product page so I can inspect equipment visually. | Must / P2 |
| US-PRD-02 | As Sofia, I want structured attributes with unknown/unverified states. | Must / P2 |
| US-PRD-03 | As Asha, I want to see which professionals use a product and in which setups. | Must / P2 |
| US-PRD-04 | As Maya, I want similar products from every product page. | Must / P2 |
| US-PRD-05 | As Luis, I want to add a product to compare or to the builder from the product page. | Must / P2–P3 |
| US-PRD-06 | As a user, I want variants (thickness/color) nested under one product identity. | Must / P2 |

### 4.4 Players

| ID | Story | Priority |
|----|-------|----------|
| US-PLY-01 | As Asha, I want a player profile with current/notable setups. | Must / P2 |
| US-PLY-02 | As Asha, I want a timeline of equipment changes with dates when known. | Should / P2 |
| US-PLY-03 | As Sofia, I want confidence labels on equipment claims (confirmed vs rumored). | Must / P2 |
| US-PLY-04 | As Luis, I want to open a player setup in the builder. | Must / P3 |
| US-PLY-05 | As a user, I want every listed item to link to its product entity. | Must / P2 |

### 4.5 Compare

| ID | Story | Priority |
|----|-------|----------|
| US-CMP-01 | As Luis, I want to multi-select products from grids/search/PDP into a compare set. | Must / P2 |
| US-CMP-02 | As Maya, I want aligned photography in the compare workspace. | Must / P2 |
| US-CMP-03 | As Sofia, I want an attribute matrix that highlights differences. | Must / P2 |
| US-CMP-04 | As a user, I want to pin a baseline product in compare. | Should / P2 |
| US-CMP-05 | As a user, I want a shareable compare URL. | Must / P2 |
| US-CMP-06 | As a user, I want a maximum compare set size with clear UX when exceeded. | Must / P2 |

### 4.6 Builder

| ID | Story | Priority |
|----|-------|----------|
| US-BLD-01 | As Luis, I want to compose blade + FH rubber + BH rubber as a visual system. | Must / P3 |
| US-BLD-02 | As Luis, I want compatibility guidance that informs without hard-blocking exploration. | Should / P3 |
| US-BLD-03 | As Luis, I want to save, duplicate, and share builds. | Must / P3 |
| US-BLD-04 | As Luis, I want aggregated build summary specs from selected parts. | Should / P3 |
| US-BLD-05 | As a guest, I want to use the builder before creating an account (persist locally or prompt to save). | Should / P3 |

### 4.7 Images / media

| ID | Story | Priority |
|----|-------|----------|
| US-IMG-01 | As Ken, I want high-quality galleries with multiple angles on products. | Must / P2 |
| US-IMG-02 | As Ken, I want fast-loading responsive images while browsing large grids. | Must / P2 / NFR |
| US-IMG-03 | As Sofia, I want alt text and captions for accessibility and clarity. | Must / P2 |
| US-IMG-04 | As Admin, I want media assets linked to entities with source/rights metadata. | Must / Admin |
| US-IMG-05 | As a user, I want missing-image states to be explicit, not broken icons. | Must / P2 |

### 4.8 Reviews (community)

| ID | Story | Priority |
|----|-------|----------|
| US-REV-01 | As Maya, I want to read moderated reviews on products after community launch. | Could / P6 |
| US-REV-02 | As Omar, I want reviews distinguishable from manufacturer claims. | Must / P6 |
| US-REV-03 | As Admin, I want report/moderate/remove review tools. | Must / P6 |

### 4.9 AI Assistant

| ID | Story | Priority |
|----|-------|----------|
| US-AI-01 | As Maya, I want to ask natural-language questions grounded in the catalog. | Must / P5 |
| US-AI-02 | As Sofia, I want AI answers to cite products/players/setups and label uncertainty. | Must / P5 |
| US-AI-03 | As a user, I want AI to open compare/builder with suggested items, not only chat text. | Should / P5 |
| US-AI-04 | As a user, I do **not** want AI to invent unverifiable ratings or purchase pressure. | Must / P5 |

### 4.10 Admin

| ID | Story | Priority |
|----|-------|----------|
| US-ADM-01 | As Admin, I want CRUD for products, brands, players, setups, collections, and aliases. | Must / Admin |
| US-ADM-02 | As Admin, I want to upload, reorder, and deprecate media assets. | Must / Admin |
| US-ADM-03 | As Admin, I want merge/dedupe tools for duplicate products. | Should / Admin |
| US-ADM-04 | As Admin, I want to review scraper outputs before publish (Phase 4+). | Must / P4 |
| US-ADM-05 | As Admin, I want publish/unpublish and audit logs. | Must / Admin |

---

## 5. Functional Requirements — Cross-cutting

### 5.1 Platform scope

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-SCOPE-01 | The system shall provide a public web application for browsing equipment, players, search, comparison, and (from P3) builds. | Must |
| FR-SCOPE-02 | The system shall **not** provide shopping cart, checkout, payment, inventory, or order management. | Must |
| FR-SCOPE-03 | The system shall **not** present a primary “Buy now” or equivalent conversion CTA on product or builder surfaces. | Must |
| FR-SCOPE-04 | External retailer or manufacturer links, if present, shall be secondary references and shall not dominate layout or interaction. | Must |
| FR-SCOPE-05 | The system shall support catalog scale of at least thousands of products and hundreds of players without changing primary UX metaphors. | Must |

### 5.2 Identity & persistence

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-01 | The system shall allow unauthenticated users to browse products, players, search, and compare. | Must / P2 |
| FR-AUTH-02 | The system shall support authenticated accounts for saving builds, favorites, and (P6) reviews. | Should / P3–P6 |
| FR-AUTH-03 | Until auth exists, the system may persist compare sets and draft builds in client-local storage with clear loss-risk messaging. | Could / P2–P3 |
| FR-AUTH-04 | Shareable URLs for products, players, setups, compare sets, collections, and builds shall work without requiring the viewer to be the owner. | Must |

### 5.3 Entity model (behavioral)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ENT-01 | The system shall maintain canonical Product entities with category, brand, name, and aliases. | Must / P2 |
| FR-ENT-02 | The system shall support Product Variants nested under a Product without forcing each variant to appear as an unrelated top-level catalog item by default. | Must / P2 |
| FR-ENT-03 | The system shall maintain Brand, Player, Setup, Collection, and Media Asset entities as first-class browsable/linkable resources where applicable. | Must / P2 |
| FR-ENT-04 | The system shall represent many-to-many relationships among Players, Setups, and Products. | Must / P2 |
| FR-ENT-05 | Attribute and setup claims shall support a confidence/provenance field visible in UI where claims could be disputed. | Must / P2 |
| FR-ENT-06 | The system shall allow “Unknown” / “Unverified” attribute values; it shall not fabricate numeric ratings to fill gaps. | Must |

---

## 6. Navigation Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-NAV-01 | The system shall provide global primary navigation including at minimum: Explore (or Home), Equipment, Players, Builder (from P3), and Search access. | Must |
| FR-NAV-02 | Search shall be reachable from all primary pages (global search entry). | Must / P2 |
| FR-NAV-03 | The system shall expose a compare tray/indicator globally when the compare feature is available. | Must / P2 |
| FR-NAV-04 | Equipment browsing shall support hierarchy navigation: Category → Brand (optional) → Product, and flat filtered views. | Must / P2 |
| FR-NAV-05 | All primary entities shall have stable, bookmarkable routes. | Must |
| FR-NAV-06 | The Explore/Home surface shall prioritize photography and a small number of entry paths; it shall not present a dense dashboard of unrelated modules in the first viewport. | Must |
| FR-NAV-07 | The system shall provide a responsive navigation pattern suitable for mobile and desktop. | Must |
| FR-NAV-08 | Keyboard access to open search shall be supported (power-user shortcut). | Should / P2 |
| FR-NAV-09 | Broken or unpublished entities shall resolve to a controlled not-found/unavailable state, not a blank page. | Must |
| FR-NAV-10 | Collections, when available, shall be navigable from Explore and from relevant product/player contexts. | Should / P2 |

**Conceptual IA (normative intent)**

```text
Explore
├── Equipment (browse / filter / search results)
│   ├── Product detail
│   ├── Compare workspace
│   └── Collections / Similar
├── Players
│   ├── Player profile
│   └── Setup detail → Products
├── Builder (P3+)
│   ├── New build / edit build
│   └── Open from player setup
└── Search (omnibox + results place)
```

---

## 7. Search Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-SEA-01 | The system shall provide full-text and fuzzy matching against product names, brands, and aliases. | Must / P2 |
| FR-SEA-02 | The system shall provide typeahead suggestions within a perceived interactive latency budget (see NFR-PERF). | Must / P2 |
| FR-SEA-03 | Typeahead suggestions shall include a thumbnail image when a product media asset exists. | Must / P2 |
| FR-SEA-04 | Search results shall remain visually scannable (photo-forward result items), not price-row lists. | Must / P2 |
| FR-SEA-05 | The system shall support filtering by category, brand, and approved structured attributes. | Must / P2 |
| FR-SEA-06 | Applying filters shall update results without destroying the user’s ability to continue visual browsing. | Must / P2 |
| FR-SEA-07 | Search shall support finding Players by name and common aliases. | Should / P2 |
| FR-SEA-08 | Search shall support finding Setups by player name and notable labels when indexed. | Could / P2–P3 |
| FR-SEA-09 | Empty result states shall present suggested alternative queries and discovery entry points. | Should / P2 |
| FR-SEA-10 | The system shall support multilingual alias resolution for catalog identity strings. | Should / P2 |
| FR-SEA-11 | Search result URLs shall encode query and active filters for sharing/bookmarking. | Must / P2 |
| FR-SEA-12 | The system shall debias result presentation away from commercial ranking (no “sponsored products” placement). | Must |
| FR-SEA-13 | “Find similar” shall be available from product context and shall produce a browsable result set with optional similarity rationale when available. | Must / P2 |

---

## 8. Product Details Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PRD-01 | Each Product shall have a detail page (PDP) whose primary region is the media gallery. | Must / P2 |
| FR-PRD-02 | The PDP shall display canonical name, brand, category, and aliases (aliases may be progressive disclosure). | Must / P2 |
| FR-PRD-03 | The PDP shall display structured attributes with explicit Unknown/Unverified handling. | Must / P2 |
| FR-PRD-04 | The PDP shall list Professionals / Setups that include the product, with links to those entities. | Must / P2 |
| FR-PRD-05 | The PDP shall present Similar Equipment. | Must / P2 |
| FR-PRD-06 | The PDP shall allow Add to Compare. | Must / P2 |
| FR-PRD-07 | The PDP shall allow Add to Builder / Use in Build (from P3). | Must / P3 |
| FR-PRD-08 | Variants shall be selectable on the PDP without navigating to unrelated product identities by default. | Must / P2 |
| FR-PRD-09 | The PDP shall support learning/notes content when editorial content exists; absence shall not break the page. | Should / P2 |
| FR-PRD-10 | The PDP shall not include a primary purchase conversion module. | Must |
| FR-PRD-11 | The PDP shall expose media lightbox/zoom suitable for inspection (see Images). | Must / P2 |
| FR-PRD-12 | The PDP shall indicate media completeness debt when required shot types are missing (admin-visible always; optionally subtle public indicator). | Could / Admin–P2 |

---

## 9. Player Profile Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PLY-01 | Each Player shall have a profile page with identity and equipment-focused content. | Must / P2 |
| FR-PLY-02 | The profile shall present current and/or notable setups with linked products. | Must / P2 |
| FR-PLY-03 | Each equipment claim shall display a confidence/provenance label. | Must / P2 |
| FR-PLY-04 | The profile shall support a chronological setup timeline when dated data exists. | Should / P2 |
| FR-PLY-05 | Player photography, if present, shall remain secondary to equipment photography in information priority. | Should |
| FR-PLY-06 | The profile shall provide navigation from setup items to Product PDPs. | Must / P2 |
| FR-PLY-07 | The profile shall provide “Open in Builder” for a selected setup (P3). | Must / P3 |
| FR-PLY-08 | Related players / co-occurrence discovery may be shown; content shall avoid tabloid or non-equipment gossip framing. | Could / P2 |
| FR-PLY-09 | Unpublished or sparse players shall render honest empty states rather than placeholder fake setups. | Must |

---

## 10. Builder Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-BLD-01 | The system shall provide a Racket Builder to compose at minimum: Blade, Forehand Rubber, Backhand Rubber. | Must / P3 |
| FR-BLD-02 | The builder shall present a visual assembly / preview of the selected configuration. | Must / P3 |
| FR-BLD-03 | The builder shall allow replacing any slot via search/browse without leaving the builder context (modal or embedded picker acceptable). | Must / P3 |
| FR-BLD-04 | The builder shall display a structured summary of selected parts and available aggregated attributes. | Should / P3 |
| FR-BLD-05 | The builder shall provide compatibility/convention guidance messages; hard blocks shall be used only for structurally invalid combinations if defined by rules. | Should / P3 |
| FR-BLD-06 | Users shall be able to save a Build as a first-class Setup-like object. | Must / P3 |
| FR-BLD-07 | Users shall be able to duplicate and edit existing builds. | Must / P3 |
| FR-BLD-08 | Builds shall be shareable via URL. | Must / P3 |
| FR-BLD-09 | Users shall be able to create a build prefilled from a Player Setup. | Must / P3 |
| FR-BLD-10 | Optional accessory slots (edge tape, etc.) may be supported later without breaking core three-slot flows. | Could / FF |
| FR-BLD-11 | The builder shall not implement checkout or purchase flows. | Must |

---

## 11. Compare Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CMP-01 | Users shall be able to add/remove products to a Compare Set from catalog grids, search results, and PDPs. | Must / P2 |
| FR-CMP-02 | The system shall enforce a maximum compare set size (configurable; recommended default 3–4) and communicate limits in UI. | Must / P2 |
| FR-CMP-03 | The Compare Workspace shall display aligned photography slots for each selected product. | Must / P2 |
| FR-CMP-04 | The Compare Workspace shall display an attribute matrix and visually emphasize differing attributes. | Must / P2 |
| FR-CMP-05 | Users shall be able to pin one product as baseline for difference highlighting. | Should / P2 |
| FR-CMP-06 | Compare Sets shall be addressable by shareable URL encoding selected product identities (and optional pin). | Must / P2 |
| FR-CMP-07 | Users shall be able to clear the compare set and remove individual items. | Must / P2 |
| FR-CMP-08 | Compare shall support same-category comparisons primarily; cross-category compare may warn or limit attributes shown. | Should / P2 |
| FR-CMP-09 | From Compare, users shall be able to open any product PDP or (P3) send a product into Builder. | Should / P2–P3 |

---

## 12. Reviews Requirements

> Community reviews are **Phase 6**. Requirements below are normative for that phase.

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-REV-01 | Authenticated users shall be able to submit a review on a Product. | Could / P6 |
| FR-REV-02 | Reviews shall be visually and semantically separated from manufacturer/editorial attributes. | Must / P6 |
| FR-REV-03 | Reviews shall support moderation states: pending, published, rejected, removed. | Must / P6 |
| FR-REV-04 | Users shall be able to report reviews. | Must / P6 |
| FR-REV-05 | Admins/moderators shall be able to approve, reject, or remove reviews with audit logging. | Must / P6 |
| FR-REV-06 | Review content shall not be required for PDP completeness; PDPs remain valuable with zero reviews. | Must |
| FR-REV-07 | The system shall not gate core exploration features behind writing a review. | Must |
| FR-REV-08 | Star/score aggregates, if shown, shall disclose sample size and shall not invent scores. | Should / P6 |

---

## 13. Images / Media Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-IMG-01 | Products shall support multiple media assets ordered for gallery display. | Must / P2 |
| FR-IMG-02 | The system shall support shot-type metadata (e.g., hero, detail, front, back, edge, in-context). | Should / P2 / Admin |
| FR-IMG-03 | Public grids and typeahead shall use appropriately sized image variants (responsive images). | Must / P2 |
| FR-IMG-04 | Galleries shall support zoom/lightbox inspection. | Must / P2 |
| FR-IMG-05 | Every public image shall have alt text; missing alt text is a content defect. | Must / P2 |
| FR-IMG-06 | Media assets shall store source and rights/attribution metadata in the admin data model. | Must / Admin |
| FR-IMG-07 | Missing media shall render an explicit placeholder state, not a broken image icon. | Must / P2 |
| FR-IMG-08 | The system shall not overlay promotional badges, sale ribbons, or dense metadata chrome on primary product imagery. | Must |
| FR-IMG-09 | Video media, if introduced later, shall be opt-in and secondary to still photography. | Could / FF |
| FR-IMG-10 | Image delivery shall support lazy loading for large grids without layout collapse (reserved space / aspect ratio). | Must / P2 |
| FR-IMG-11 | Admin users shall be able to reorder, replace, and deprecate media assets without deleting historical references improperly. | Must / Admin |

---

## 14. AI Assistant Requirements

> Phase 5. AI assists exploration; it does not replace catalog UX.

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AI-01 | The system shall provide an AI assistant capable of answering equipment questions using retrieval grounded in catalog entities (RAG or equivalent). | Must / P5 |
| FR-AI-02 | AI responses shall cite or link referenced Products, Players, and/or Setups when those entities underpin the answer. | Must / P5 |
| FR-AI-03 | AI responses shall label uncertainty and refuse to fabricate attributes not present in grounded sources. | Must / P5 |
| FR-AI-04 | The assistant shall be able to propose actions: open PDP, add to compare, open builder with suggestions. | Should / P5 |
| FR-AI-05 | The assistant shall not present purchase CTAs or affiliate-oriented recommendations as primary output. | Must / P5 |
| FR-AI-06 | The assistant shall be reachable without blocking search, browse, compare, or builder usage (non-modal-only dependency). | Should / P5 |
| FR-AI-07 | The system shall log AI interactions for quality evaluation in a privacy-conscious manner (policy-defined retention). | Should / P5 |
| FR-AI-08 | The system shall enforce safety filters against harmful or off-domain misuse while remaining useful for equipment Q&A. | Must / P5 |
| FR-AI-09 | “Similar equipment” and recommendation features may use embeddings; user-facing copy shall not claim false precision. | Should / P5 |

---

## 15. Admin Panel Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ADM-01 | The system shall provide an authenticated Admin Panel restricted to authorized roles. | Must / Admin |
| FR-ADM-02 | Admins shall perform CRUD on Brands, Products, Variants, Aliases, Players, Setups, Collections, and Media Assets. | Must / Admin |
| FR-ADM-03 | Admins shall set publish/unpublish (or draft/published) state on entities. | Must / Admin |
| FR-ADM-04 | Admins shall manage confidence/provenance on attributes and setup claims. | Must / Admin |
| FR-ADM-05 | Admins shall upload and organize media, including ordering and shot-type labels. | Must / Admin |
| FR-ADM-06 | Admins shall merge duplicate Products/Players with redirect or alias preservation. | Should / Admin |
| FR-ADM-07 | Admins shall view audit logs for create/update/delete/publish actions. | Must / Admin |
| FR-ADM-08 | From Phase 4, admins shall review scraper ingestion candidates (accept/reject/edit) before catalog publish. | Must / P4 |
| FR-ADM-09 | Admins shall moderate community reviews and reports (Phase 6). | Must / P6 |
| FR-ADM-10 | The Admin Panel shall support search within admin lists for operational efficiency at catalog scale. | Must / Admin |
| FR-ADM-11 | Role-based access shall distinguish at least Admin vs Moderator (optional finer roles later). | Should / Admin |
| FR-ADM-12 | Destructive actions (delete/merge) shall require confirmation and be auditable. | Must / Admin |

---

## 16. Collections & Discoverability Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-COL-01 | The system shall support Collections as named groups of products (and optionally players). | Should / P2 |
| FR-COL-02 | Collections shall have public pages with photo-forward presentation. | Should / P2 |
| FR-COL-03 | Explore may feature editorial collections as discovery entry points. | Should / P2 |
| FR-COL-04 | Algorithmic collections (e.g., “frequently compared with”) may appear when data supports them. | Could / P2–P5 |

---

## 17. Favorites / Shortlist Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-FAV-01 | Users shall be able to favorite/shortlist products for later exploration. | Should / P2–P3 |
| FR-FAV-02 | Favorites shall not be framed as a shopping wishlist with purchase intent UX. | Must |
| FR-FAV-03 | Authenticated favorites shall sync across sessions; guest favorites may be local-only. | Should |

---

## 18. Non-Functional Requirements

### 18.1 Performance

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-PERF-01 | Typeahead first suggestions shall become visible within **200 ms** of input debounce completion under normal network conditions for warm sessions (target). | Must |
| NFR-PERF-02 | Primary catalog grid interactions (scroll, filter apply) shall remain responsive; perceived jank from unoptimized images is a defect. | Must |
| NFR-PERF-03 | PDP LCP shall prioritize hero imagery; image pipeline shall provide sized variants. | Must |
| NFR-PERF-04 | Compare and Builder views shall load selected entity data without full-app reload. | Should |
| NFR-PERF-05 | The architecture shall assume growth to thousands of products and large media libraries without redesigning primary UX. | Must |

### 18.2 Scalability

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-SCALE-01 | Search indexing strategy shall support incremental catalog updates. | Must / P2 |
| NFR-SCALE-02 | Media storage shall support CDN-friendly delivery. | Must |
| NFR-SCALE-03 | Admin operations shall remain usable at full catalog scale (pagination, search, filters). | Must |

### 18.3 Reliability & data integrity

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-REL-01 | Canonical entity IDs/slugs shall remain stable; merges shall preserve resolvability via redirects or aliases. | Must |
| NFR-REL-02 | Unpublished entities shall not appear in public search/browse. | Must |
| NFR-REL-03 | Backups and restore procedures for catalog and media metadata shall exist before production launch. | Must |

### 18.4 Security

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-SEC-01 | Admin and moderation endpoints shall require authentication and authorization. | Must |
| NFR-SEC-02 | User-generated content (P6) shall be sanitized against XSS and abuse. | Must / P6 |
| NFR-SEC-03 | Secrets and credentials shall not be stored in the client repository or public env. | Must |
| NFR-SEC-04 | AI features shall prevent prompt injection from corrupting admin actions or leaking secrets. | Must / P5 |

### 18.5 Accessibility

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-A11Y-01 | The application shall meet WCAG 2.2 Level AA for core flows: search, browse, PDP, compare, builder, player profile. | Must |
| NFR-A11Y-02 | Images shall provide meaningful alt text; purely decorative images shall be marked appropriately. | Must |
| NFR-A11Y-03 | Keyboard navigation shall reach all primary interactive controls. | Must |
| NFR-A11Y-04 | Color alone shall not convey compare difference highlighting. | Must |

### 18.6 Usability & UX constraints

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-UX-01 | Photography shall lead product and explore surfaces; text supports visual inspection. | Must |
| NFR-UX-02 | One primary job per major section; avoid unrelated module stacking on first viewport. | Must |
| NFR-UX-03 | Motion shall orient (hierarchy transitions), not decorate excessively. | Should |
| NFR-UX-04 | Honest empty and unknown states are preferred over fake completeness. | Must |

### 18.7 Internationalization

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-I18N-01 | Catalog search shall support aliases across languages/scripts relevant to table tennis equipment culture. | Should / P2 |
| NFR-I18N-02 | UI locale expansion may follow after English baseline; data model shall not block localized names. | Should |

### 18.8 Observability

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-OBS-01 | The system shall emit analytics events for search, PDP view, compare usage, builder save/share, and player profile depth (privacy-aware). | Should |
| NFR-OBS-02 | Media failures and empty-result rates shall be monitorable. | Should |

### 18.9 Compliance & ethics

| ID | Requirement | Priority |
|----|-------------|----------|
| NFR-ETH-01 | Image rights and attribution shall be respected; undocumented rights are an ingestion blocker for publish. | Must |
| NFR-ETH-02 | Player equipment claims shall not be presented as confirmed without confidence labeling. | Must |
| NFR-ETH-03 | The product shall not optimize dark-pattern engagement that mimics ecommerce conversion tactics. | Must |

---

## 19. Future Features (Deferred)

| ID | Feature | Notes | Earliest |
|----|---------|-------|----------|
| FF-01 | Community reviews & ratings | See §12 | P6 |
| FF-02 | User-submitted photography with moderation | Strict quality/rights gates | P6 |
| FF-03 | AI Assistant (RAG) | See §14 | P5 |
| FF-04 | Scraper ingestion pipelines | Always admin-reviewed publish | P4 |
| FF-05 | Advanced similarity embeddings | Explainability required | P5 |
| FF-06 | Equipment timeline / era explorer | Cross-product historical UI | P6 / research |
| FF-07 | Video media | Secondary to stills | FF |
| FF-08 | PWA / offline tournament browsing | Open question in vision | FF |
| FF-09 | Apparel and table/robot categories | Expand taxonomy carefully | FF |
| FF-10 | Public API for catalog read access | Rate-limited; no PII | FF |
| FF-11 | Multi-rubber blade experiments beyond FH/BH | Keep builder simple first | FF |
| FF-12 | Reference price history widgets | Never primary UX; optional later | Won’t near-term |
| FF-13 | Social activity feed | Avoid Instagram-clone distraction | Won’t near-term |
| FF-14 | Marketplace / cart / checkout | Explicitly out of product scope | Won’t |

---

## 20. Acceptance Criteria — Epic samples

### 20.1 Epic: Photo-first PDP (P2)

- Given a published product with media, when a user opens the PDP, then the first meaningful paint emphasizes gallery/hero imagery.
- Given missing attributes, when the PDP renders, then Unknown/Unverified is shown rather than invented numbers.
- Given the PDP, when inspecting CTAs, then no primary purchase CTA is present.

### 20.2 Epic: Search (P2)

- Given an alias query, when the user searches, then the canonical product is suggested/found.
- Given typeahead, when suggestions render, then product suggestions include thumbnails when media exists.
- Given filters, when applied, then results URL is shareable and visual scanning remains possible.

### 20.3 Epic: Compare (P2)

- Given 2–N products in range, when user opens Compare, then photos align and attribute differences are highlighted.
- Given a compare URL shared to a guest, when opened, then the same set is restored.

### 20.4 Epic: Builder (P3)

- Given blade + FH + BH selected, when user saves, then a shareable build URL exists.
- Given a player setup, when user selects Open in Builder, then slots are prefilled.

### 20.5 Epic: AI Assistant (P5)

- Given a catalog-grounded question, when AI answers, then citations/links to entities are present.
- Given an unknown attribute, when asked, then AI states unknown rather than inventing a value.

---

## 21. Out of Scope (Normative)

The following shall **not** be implemented as product features of TTSetupBuilder:

1. Shopping cart, checkout, payments, fulfillment
2. Seller onboarding, inventory, SKU commerce ops
3. Affiliate-optimized layout variants as default experience
4. Advertising network placements on core exploration surfaces
5. Fabricated precision ratings to “complete” sparse data

---

## 22. Traceability

| Vision pillar | Primary FR sections |
|---------------|---------------------|
| Photography | §13 Images, §8 Product Details, NFR-UX/PERF |
| Speed | §7 Search, NFR-PERF |
| Comparison | §11 Compare |
| Search | §7 Search |
| Discoverability | §6 Navigation, §16 Collections, Similar (FR-SEA-13) |
| Builder | §10 Builder |
| Professionals | §9 Player Profiles |
| AI | §14 AI Assistant |
| Operations | §15 Admin Panel |
| Community | §12 Reviews, FF table |

| Persona | Primary stories |
|---------|-----------------|
| Maya | US-SEA-*, US-PRD-*, US-CMP-* |
| Luis | US-BLD-*, US-CMP-*, US-PLY-04 |
| Asha | US-PLY-*, US-PRD-03 |
| Ken | US-NAV-02, US-IMG-*, US-SEA-03 |
| Sofia | US-PRD-02, US-SEA-04, US-AI-02 |
| Admin | US-ADM-*, FR-ADM-* |

---

## 23. Document control

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-07-19 | Initial functional requirements baseline from Product Vision |

**Change policy:** Update this document when scope decisions change; record user-visible requirement shifts in `CHANGELOG.md`. Companion architecture docs specify *how*; this document specifies *what*.
