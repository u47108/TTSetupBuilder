# Data Model — TTSetupBuilder

> Normalized relational design for a photography-first table tennis equipment knowledge base (not ecommerce).

**Status:** Living architecture document (documentation only — no schema implementation yet)  
**Audience:** Software architects, backend engineers, search/infra owners, AI assistants working on this repo  
**Companion:** [`PRODUCT_VISION.md`](./PRODUCT_VISION.md), [`ROADMAP.md`](../ROADMAP.md)  
**Constraint:** Stores are **reference context only**. There is no cart, checkout, inventory commerce, or order lifecycle in this model.

---

## 1. Goals and non-goals

### 1.1 Goals

Design a **3NF-leaning** relational model that can support:

| Workload | Scale target |
|----------|--------------|
| Products (canonical models) | **100,000+** |
| Product variants (thickness, color, size, …) | Several× products |
| Players | Hundreds → low thousands |
| Coaches / tournaments | Hundreds → thousands |
| Images / videos | Large media libraries (multi-million rows over time) |
| Search / compare / discovery | Heavy read; typed filters; alias resolution; similarity |
| Setups (player + user builds) | High cardinality many-to-many with products |

The model must preserve PRODUCT_VISION principles:

- One **canonical product** per real-world model; variants nest underneath (not catalog spam).
- **Media is inventory**, with provenance and rights.
- Attributes and setup claims carry **source confidence**.
- Aliases and multilingual names are first-class for search.
- Player equipment history is a **timeline graph**, not a rumor list.

### 1.2 Non-goals

- Marketplace: SKUs-as-offers, stock, pricing engines, carts, payments.
- Full biography CMS for players (light career context only).
- Replacing manufacturer official catalogs as legal system of record.
- Implementing SQL, migrations, or ORM mappings in this document.

### 1.3 Design verdict (read this first)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Product subtypes (Blade, Rubber, …) | **Joined-table inheritance** (Class Table Inheritance) | Distinct typed attributes; selective indexes per subtype; avoids wide sparse STI rows at 100k+ |
| Catalog identity | `product` (canonical) + `product_variant` | Matches vision: sponge thickness / color are variants, not separate browse heroes by default |
| Media | First-class `image` / `video` + polymorphic `media_link` | Photography doctrine; one asset → many entities; rights/provenance central |
| Taxonomy | `category` tree + `tag` graph | Categories are structural; tags are discovery/Steam-like |
| Stores | `store` + `store_product_link` only | Reference URLs; no inventory |
| Similarity / compare | Explicit relationship tables + optional later embeddings | Explainable “why similar”; compare is session/URL state, not a persisted commerce cart |
| Intentional denormalization | Few, named counters and search documents | Called out explicitly; never silent |

---

## 2. Naming and type conventions

### 2.1 Naming

| Convention | Rule | Example |
|------------|------|---------|
| Tables | `snake_case`, singular preferred for entity tables | `product`, `player_setup` |
| Join / link tables | `entity_a_entity_b` or purpose-named | `product_tag`, `media_link` |
| Primary keys | `id` — UUID (`uuid`) preferred for public entities; bigint acceptable for high-churn link tables | `product.id` |
| Foreign keys | `{table}_id` | `brand_id` |
| Timestamps | `created_at`, `updated_at` (timestamptz, NOT NULL) on mutable entities | |
| Soft delete | `deleted_at` (timestamptz, NULL) where recovery matters | products, media, reviews |
| Slugs | `slug` unique within scope; URL-safe | `brand.slug`, `product.slug` unique per brand or globally |
| Status / enum-like | PostgreSQL enums **or** checked text; document as ENUM here | `publication_status` |
| Booleans | `is_` / `has_` prefix | `is_published` |
| Counts (denorm) | `*_count` suffix | `image_count` |

### 2.2 Logical types (implementation-agnostic)

| Logical type | Meaning |
|--------------|---------|
| `UUID` | Public stable identifier |
| `BIGINT` | Surrogate / high-volume link PK |
| `TEXT` | Unbounded string |
| `VARCHAR(n)` | Bounded string |
| `CITEXT` / case-insensitive text | Optional for aliases / emails |
| `INT` / `SMALLINT` | Integers |
| `NUMERIC(p,s)` | Exact decimals (weights, ratings when present) |
| `BOOLEAN` | True/false |
| `TIMESTAMPTZ` | Instant with time zone |
| `DATE` | Calendar date |
| `JSONB` | Structured extensibility / provenance bags (sparingly) |
| `ENUM(...)` | Closed vocabulary |
| `TSVECTOR` | Full-text search document (Postgres) |
| `VECTOR(n)` | Optional later embeddings (pgvector or external) |

### 2.3 Shared enums

```text
publication_status := draft | review | published | archived
confidence_level   := unknown | rumored | community | editorial | manufacturer | verified
media_rights       := unknown | owned | licensed | fair_use_claim | manufacturer_press | user_upload | restricted
media_source_kind  := editorial | manufacturer | scraper | user | partner | unknown
review_moderation  := pending | approved | rejected | flagged | withdrawn
setup_kind         := player_pro | user_build | editorial
setup_slot         := blade | rubber_fh | rubber_bh | ball | shoes | apparel | glue | other
handedness         := left | right | unknown
playing_style      := attacker | defender | allround | unknown | other
sex_category       := male | female | mixed | unknown   -- sport registration, not identity politics
entity_type        := product | product_variant | brand | player | coach | tournament
                     | setup | collection | category | store | review | image | video
```

### 2.4 Soft constraints on JSONB

Use `JSONB` only for:

- Provenance envelopes (`source_url`, `scraped_at`, scraper job id)
- Sparse manufacturer attribute bags not yet promoted to columns
- Localization maps when a full `i18n` table is premature

Do **not** put core filterable attributes (ply count, sponge hardness band, shoe size system) only in JSONB if they drive search at catalog scale.

---

## 3. Conceptual architecture

```text
                         ┌─────────────┐
                         │   brand     │
                         └──────┬──────┘
                                │ 1:N
                         ┌──────▼──────┐         ┌──────────────┐
              ┌──────────│   product   │─────────│  category    │
              │          └──────┬──────┘         └──────────────┘
              │                 │ 1:N
              │          ┌──────▼──────────┐
              │          │ product_variant │
              │          └─────────────────┘
              │
   joined subtypes (0..1 each, exclusive by product_kind)
              │
   ┌──────────┼──────────┬─────────┬────────┬─────────┬──────────┐
   ▼          ▼          ▼         ▼        ▼         ▼          ▼
 blade     rubber      ball      glue    shoes    apparel   (future…)
              │
              │ N:M via setup_item / media_link / product_tag / …
              ▼
   ┌──────────────────────────────────────────────────────────────┐
   │  player · coach · tournament · setup · review · store · media │
   └──────────────────────────────────────────────────────────────┘
```

### 3.1 Product vs variant vs category

| Concept | Definition | Browse UX role |
|---------|------------|----------------|
| **Category** | Taxonomy node (Blade, Rubber, Shoes, …); hierarchical | Facet / navigation |
| **Product** | Canonical real-world **model** (e.g. Butterfly Tenergy 05) | Primary PDP / grid hero |
| **Variant** | Sellable or measurable option under a product (2.1 mm, red, EU 42) | Nested on PDP; filterable; setup slots may pin a variant |
| **Subtype row** | Typed attributes for that category (`rubber.topsheet_name`, …) | Spec tables / compare matrix |

### 3.2 Why joined subtypes (not STI)

**Single-table inheritance (STI)** would put blade ply, rubber sponge hardness, shoe last shape, and apparel size charts on one wide `product` table with mostly NULL columns. At 100k+ products and heavy filtered search (“innerfiber offensive blades under 90g”), that becomes:

- Bloated row width and buffer cache pressure
- Weak partial indexes (many columns irrelevant per kind)
- Fragile migrations when one subtype evolves

**Joined-table inheritance:** `product` holds shared identity/publication/media counts; `blade`, `rubber`, `ball`, `glue`, `shoes`, `apparel` hold typed columns with a **1:1 PK = `product_id`**. Queries that only need catalog cards hit `product` (+ brand + primary image). Spec/compare queries join one subtype.

**Exclusivity rule:** `product.product_kind` must match exactly one subtype table presence (enforced in application + deferred DB check / trigger in implementation phase).

---

## 4. Entity catalog (index)

### Required domain entities

| # | Entity | Section |
|---|--------|---------|
| 1 | `brand` | §5.1 |
| 2 | `category` | §5.2 |
| 3 | `product` | §5.3 |
| 4 | `product_variant` | §5.4 |
| 5 | `blade` | §5.5 |
| 6 | `rubber` | §5.6 |
| 7 | `ball` | §5.7 |
| 8 | `glue` | §5.8 |
| 9 | `shoes` | §5.9 |
| 10 | `apparel` | §5.10 |
| 11 | `player` | §5.11 |
| 12 | `coach` | §5.12 |
| 13 | `tournament` | §5.13 |
| 14 | `store` | §5.14 |
| 15 | `review` | §5.15 |
| 16 | `image` | §5.16 |
| 17 | `video` | §5.17 |

### Supporting entities (normalization / scale)

| # | Entity | Why it exists |
|---|--------|---------------|
| 18 | `product_alias` | Multilingual / colloquial search identity |
| 19 | `product_relationship` | Similar / supersedes / often-paired (explainable graph) |
| 20 | `tag` + `product_tag` | Steam-like discovery without polluting category tree |
| 21 | `collection` + `collection_item` | Editorial/algorithmic slices |
| 22 | `setup` + `setup_item` | First-class builds / pro configurations |
| 23 | `player_setup` | Timed attribution of a setup to a player (eras) |
| 24 | `media_link` | Polymorphic attachment of image/video to any entity |
| 25 | `image_rendition` | Responsive derivatives (CDN sizes) |
| 26 | `store_product_link` | Reference-only external URLs |
| 27 | `brand_relationship` | Parent group, OEM, co-brand |
| 28 | `player_coach` | Coaching relationships over time |
| 29 | `tournament_entry` | Player participation; optional setup snapshot link |
| 30 | `product_attribute_source` | Provenance for disputed numeric/text attributes |
| 31 | `search_document` | Denormalized FTS / typeahead projection |
| 32 | `compare_snapshot` (optional) | Shareable compare URLs (not a cart) |

Approximate **entity/table count in this model: 32+** (core 17 + supporting). Implementation may merge a few projection tables into materialized views.

---

## 5. Core entities (detailed)

---

### 5.1 Brand

#### Purpose

Manufacturer or label. Discovery hub pages (not storefronts). Owns products; may have corporate parent relationships.

#### Fields

| Field | Type | Null | Constraints / notes |
|-------|------|------|---------------------|
| `id` | UUID | NO | PK |
| `slug` | VARCHAR(120) | NO | UNIQUE |
| `name` | VARCHAR(200) | NO | Canonical display name |
| `name_native` | VARCHAR(200) | YES | e.g. Chinese characters |
| `country_code` | CHAR(2) | YES | ISO 3166-1 alpha-2 HQ / origin |
| `founded_year` | SMALLINT | YES | |
| `website_url` | TEXT | YES | Official site |
| `short_description` | TEXT | YES | Editorial blurb |
| `logo_image_id` | UUID | YES | FK → `image.id` (nullable until media exists) |
| `publication_status` | ENUM | NO | Default `draft` |
| `product_count` | INT | NO | **Denorm** counter; default 0 |
| `created_at` | TIMESTAMPTZ | NO | |
| `updated_at` | TIMESTAMPTZ | NO | |
| `deleted_at` | TIMESTAMPTZ | YES | Soft delete |

#### Relationships

| Related | Cardinality | FK / join |
|---------|-------------|-----------|
| `product` | 1:N | `product.brand_id` → `brand.id` |
| `brand_relationship` | 1:N (as subject or object) | see §6.10 |
| `image` (logo) | N:1 | `logo_image_id` |
| Media gallery | N:M | via `media_link` |

#### Indexes

| Name | Columns | Notes |
|------|---------|-------|
| `pk_brand` | `id` | |
| `uq_brand_slug` | `slug` | WHERE `deleted_at IS NULL` (partial unique if soft-delete) |
| `ix_brand_status_name` | `(publication_status, name)` | Directory listing |
| `ix_brand_name_trgm` | `name` gist/gin trigram | Fuzzy brand search |

#### Future scalability

- Read replicas for brand directory + product grids.
- Partitioning unnecessary at brand cardinality (low thousands).
- Cache brand pages aggressively; invalidate on product_count / logo change.

---

### 5.2 Category

#### Purpose

Structural taxonomy for equipment (Blade, Rubber, Ball, Glue, Shoes, Apparel, Accessories, …). Hierarchical for navigation; **not** a substitute for tags.

#### Fields

| Field | Type | Null | Constraints / notes |
|-------|------|------|---------------------|
| `id` | UUID | NO | PK |
| `parent_id` | UUID | YES | FK → `category.id`; NULL = root |
| `slug` | VARCHAR(120) | NO | UNIQUE among siblings or globally unique (prefer **global**) |
| `name` | VARCHAR(120) | NO | |
| `product_kind` | VARCHAR(40) | YES | Maps to subtype when leaf is typed (`blade`, `rubber`, …); NULL for abstract parents |
| `sort_order` | INT | NO | Default 0 |
| `path` | VARCHAR(500) | NO | Materialized path `/blades/offensive` for cheap subtree queries (**intentional denorm**) |
| `depth` | SMALLINT | NO | |
| `is_leaf` | BOOLEAN | NO | |
| `description` | TEXT | YES | |
| `created_at` | TIMESTAMPTZ | NO | |
| `updated_at` | TIMESTAMPTZ | NO | |

#### Relationships

| Related | Cardinality | FK / join |
|---------|-------------|-----------|
| Self (tree) | N:1 parent | `parent_id` |
| `product` | 1:N | `product.category_id` (primary category) |
| Optional M:N secondary categories | via `product_category` if needed later | Prefer tags for secondary facets |

#### Indexes

| Name | Columns | Notes |
|------|---------|-------|
| `uq_category_slug` | `slug` | |
| `ix_category_parent_sort` | `(parent_id, sort_order)` | Children listing |
| `ix_category_path` | `path` varchar_pattern_ops / ltree alternative | Subtree (`path LIKE '/blades/%'`) |

#### Future scalability

- Prefer `ltree` or closure table if taxonomy depth/editing complexity grows.
- Categories are tiny; cache entire tree in memory at app edge.

---

### 5.3 Product (canonical)

#### Purpose

The **canonical equipment model** — primary unit of the catalog, PDP, compare, and discovery. Variants and subtype rows hang off this entity.

#### Fields

| Field | Type | Null | Constraints / notes |
|-------|------|------|---------------------|
| `id` | UUID | NO | PK |
| `brand_id` | UUID | NO | FK → `brand.id` |
| `category_id` | UUID | NO | FK → `category.id` (primary) |
| `product_kind` | VARCHAR(40) | NO | `blade` \| `rubber` \| `ball` \| `glue` \| `shoes` \| `apparel` \| `other` — must match subtype |
| `slug` | VARCHAR(200) | NO | UNIQUE with brand: `(brand_id, slug)` |
| `name` | VARCHAR(300) | NO | Canonical English (or editorial lingua franca) name |
| `subtitle` | VARCHAR(300) | YES | Short line under title |
| `summary` | TEXT | YES | Honest short description |
| `released_on` | DATE | YES | First known release |
| `discontinued_on` | DATE | YES | |
| `era_label` | VARCHAR(80) | YES | e.g. `plastic_ball`, editorial |
| `publication_status` | ENUM | NO | |
| `confidence_level` | ENUM | NO | Overall record confidence |
| `primary_image_id` | UUID | YES | FK → `image.id` — grid hero |
| `primary_variant_id` | UUID | YES | FK → `product_variant.id` — default option shown |
| `image_count` | INT | NO | Denorm |
| `video_count` | INT | NO | Denorm |
| `setup_appearance_count` | INT | NO | Denorm — “used in N setups” |
| `view_count` | BIGINT | NO | Denorm / analytics rollup (eventual) |
| `search_rank_boost` | NUMERIC(6,3) | NO | Editorial boost; default 0 |
| `attributes_ext` | JSONB | YES | Sparse non-filter keys only |
| `created_at` | TIMESTAMPTZ | NO | |
| `updated_at` | TIMESTAMPTZ | NO | |
| `published_at` | TIMESTAMPTZ | YES | |
| `deleted_at` | TIMESTAMPTZ | YES | |

**Integrity notes:**

- `primary_variant_id` must belong to this product (deferrable FK / app check).
- `primary_image_id` should also appear in `media_link` for the product (consistency job).

#### Relationships

| Related | Cardinality | FK / join |
|---------|-------------|-----------|
| `brand` | N:1 | `brand_id` |
| `category` | N:1 | `category_id` |
| `product_variant` | 1:N | |
| Subtype tables | 1:0..1 | `blade` / `rubber` / … |
| `product_alias` | 1:N | |
| `product_relationship` | N:M | |
| `product_tag` | N:M | |
| `setup_item` | 1:N | |
| `review` | 1:N | |
| `store_product_link` | 1:N | |
| Media | N:M | `media_link` |

#### Indexes

| Name | Columns | Notes |
|------|---------|-------|
| `pk_product` | `id` | |
| `uq_product_brand_slug` | `(brand_id, slug)` WHERE `deleted_at IS NULL` | |
| `ix_product_kind_status_pub` | `(product_kind, publication_status, published_at DESC)` | Kind grids |
| `ix_product_brand_status` | `(brand_id, publication_status)` | Brand pages |
| `ix_product_category_status` | `(category_id, publication_status)` | Category browse |
| `ix_product_primary_image` | `primary_image_id` | Join for grids |
| `ix_product_name_trgm` | `name` | Fuzzy |
| `ix_product_attrs_ext_gin` | `attributes_ext` gin | Only if queried |
| Partial | `(publication_status)` WHERE `deleted_at IS NULL AND publication_status = 'published'` | Hot path |

#### Future scalability

- **Partition** by `product_kind` or hash of `id` only if single-table size / vacuum becomes painful (often 100k is fine unpartitioned on modern Postgres with good indexes).
- **Read replicas** for catalog browse; primary for editorial writes.
- **Materialized view** `product_card` (id, name, brand, primary image URL, kind, key specs) for grid APIs.
- Archive `archived` + soft-deleted products to cold storage tables yearly if needed.
- Denorm counters updated via triggers or async workers — never on hot request path with full COUNT(*).

---

### 5.4 Product variant

#### Purpose

Options under a canonical product: sponge thickness, color, handle type, shoe size, apparel size/colorway, ball color, etc. Enables precise setup pinning and compare without exploding browse identity.

#### Fields

| Field | Type | Null | Constraints / notes |
|-------|------|------|---------------------|
| `id` | UUID | NO | PK |
| `product_id` | UUID | NO | FK → `product.id` ON DELETE CASCADE |
| `sku_code` | VARCHAR(120) | YES | Manufacturer SKU if known; not required |
| `slug_suffix` | VARCHAR(80) | NO | e.g. `21-red`; unique per product |
| `display_name` | VARCHAR(200) | NO | “2.1 mm / Red” |
| `option_group` | VARCHAR(80) | NO | `sponge_thickness`, `color`, `handle`, `size`, `colorway`, … |
| `option_value` | VARCHAR(120) | NO | Normalized value string |
| `option_value_num` | NUMERIC(10,3) | YES | For sortable numeric options (2.1) |
| `color_hex` | CHAR(7) | YES | Optional UI swatch |
| `is_default` | BOOLEAN | NO | At most one default per product |
| `sort_order` | INT | NO | |
| `publication_status` | ENUM | NO | Variant can be draft while product published |
| `barcode` | VARCHAR(64) | YES | |
| `attributes_ext` | JSONB | YES | |
| `created_at` | TIMESTAMPTZ | NO | |
| `updated_at` | TIMESTAMPTZ | NO | |
| `deleted_at` | TIMESTAMPTZ | YES | |

**Multi-dimension variants:** Prefer **one row per concrete combination** (2.1 + red) rather than exploding into independent axes joined at query time — simpler setup_item FKs. If combinatorial explosion appears (shoes sizes × widths × colors), introduce `variant_option` EAV **only for that product_kind** in a later ADR; do not EAV the whole catalog prematurely.

#### Relationships

| Related | Cardinality | FK / join |
|---------|-------------|-----------|
| `product` | N:1 | `product_id` |
| `setup_item` | 1:N optional | `setup_item.product_variant_id` |
| Media | N:M | variant-specific packshots via `media_link` |

#### Indexes

| Name | Columns | Notes |
|------|---------|-------|
| `uq_variant_product_suffix` | `(product_id, slug_suffix)` WHERE `deleted_at IS NULL` | |
| `ix_variant_product_sort` | `(product_id, sort_order)` | |
| `ix_variant_product_group_value` | `(product_id, option_group, option_value)` | Filter |
| `uq_variant_default` | `(product_id)` WHERE `is_default AND deleted_at IS NULL` | Partial unique |
| `uq_variant_sku` | `sku_code` WHERE `sku_code IS NOT NULL` | Partial unique |

#### Future scalability

- High row counts (millions) remain manageable with `(product_id, …)` leading indexes.
- Partition by hash(`product_id`) only if vacuum/index bloat demands it.
- CDN caches variant-specific images keyed by variant id.

---

### 5.5 Blade (product subtype)

#### Purpose

Typed attributes for blade / wood products. 1:1 with `product` where `product_kind = 'blade'`.

#### Fields

| Field | Type | Null | Constraints / notes |
|-------|------|------|---------------------|
| `product_id` | UUID | NO | PK, FK → `product.id` ON DELETE CASCADE |
| `construction` | VARCHAR(80) YES | `all_wood`, `innerfiber`, `outerfiber`, `carbon`, `other` |
| `ply_count` | SMALLINT | YES | |
| `weight_min_g` | NUMERIC(6,2) | YES | Typical range |
| `weight_max_g` | NUMERIC(6,2) | YES | |
| `thickness_mm` | NUMERIC(5,2) | YES | |
| `speed_rating` | NUMERIC(5,2) | YES | **Only when sourced**; nullable preferred over fake precision |
| `control_rating` | NUMERIC(5,2) | YES | |
| `stiffness_rating` | NUMERIC(5,2) | YES | |
| `rating_scale_note` | VARCHAR(120) | YES | “Butterfly 1–100”, etc. |
| `handle_types_available` | TEXT[] | YES | `FL`, `ST`, `AN`, … — or normalize to variant.option |
| `blade_type` | VARCHAR(40) | YES | `offensive`, `allround`, `defensive`, … |
| `composition_notes` | TEXT | YES | Ply recipe narrative |
| `created_at` | TIMESTAMPTZ | NO | |
| `updated_at` | TIMESTAMPTZ | NO | |

#### Relationships

| Related | Cardinality | FK / join |
|---------|-------------|-----------|
| `product` | 1:1 | `product_id` |

#### Indexes

| Name | Columns | Notes |
|------|---------|-------|
| `ix_blade_construction_type` | `(construction, blade_type)` | Faceted browse |
| `ix_blade_weight` | `(weight_min_g, weight_max_g)` | Range filters |
| `ix_blade_ply` | `ply_count` | |

#### Future scalability

- Compare matrix joins `product` ⋉ `blade` for N selected ids — fine at interactive N≤10.
- Promote popular filter columns; leave lore in `composition_notes`.
- Optional denorm of top 3 blade filters onto `product_card` MV.

---

### 5.6 Rubber

#### Purpose

Typed attributes for rubber sheets. Product is singular; FH/BH is a **usage slot in setups**, not two products (per PRODUCT_VISION).

#### Fields

| Field | Type | Null | Constraints / notes |
|-------|------|------|---------------------|
| `product_id` | UUID | NO | PK/FK → `product` |
| `rubber_type` | VARCHAR(40) | YES | `inverted`, `short_pips`, `long_pips`, `anti`, `other` |
| `sponge_hardness` | VARCHAR(40) | YES | Manufacturer label (`47.5`, `Soft`, …) |
| `sponge_hardness_num` | NUMERIC(5,2) | YES | Normalized numeric when parseable |
| `topsheet_name` | VARCHAR(120) | YES | |
| `speed_rating` | NUMERIC(5,2) | YES | Sourced only |
| `spin_rating` | NUMERIC(5,2) | YES | |
| `control_rating` | NUMERIC(5,2) | YES | |
| `rating_scale_note` | VARCHAR(120) | YES | |
| `is_tacky` | BOOLEAN | YES | |
| `is_tensor` | BOOLEAN | YES | Marketing/tech family flags — careful labeling |
| `thickness_options_note` | TEXT | YES | Human note; concrete options live in `product_variant` |
| `ittf_approval_code` | VARCHAR(80) | YES | If known |
| `created_at` | TIMESTAMPTZ | NO | |
| `updated_at` | TIMESTAMPTZ | NO | |

#### Relationships

| Related | Cardinality | FK / join |
|---------|-------------|-----------|
| `product` | 1:1 | |
| Variants | thicknesses/colors | `product_variant.option_group` |

#### Indexes

| Name | Columns | Notes |
|------|---------|-------|
| `ix_rubber_type_hardness` | `(rubber_type, sponge_hardness_num)` | |
| `ix_rubber_tacky_tensor` | `(is_tacky, is_tensor)` WHERE not null | Partial |
| `ix_rubber_ittf` | `ittf_approval_code` WHERE NOT NULL | |

#### Future scalability

- Cross-brand rating normalization is an **application concern** (see vision open questions); store raw + `rating_scale_note`, optionally a parallel `normalized_*` computed offline.
- Similarity edges often dense for rubbers — see `product_relationship`.

---

### 5.7 Ball

#### Purpose

Ball products (training / competition), including era (celluloid vs plastic) as structured data for collections and history.

#### Fields

| Field | Type | Null | Constraints / notes |
|-------|------|------|---------------------|
| `product_id` | UUID | NO | PK/FK |
| `material` | VARCHAR(40) | YES | `plastic`, `celluloid`, `other` |
| `diameter_mm` | NUMERIC(4,1) | YES | Typically 40 / 40+ |
| `star_rating` | SMALLINT | YES | 1–3 competition marking if applicable |
| `seam_type` | VARCHAR(40) | YES | |
| `color` | VARCHAR(40) | YES | Default color; variants for multi-color packs |
| `ittf_approved` | BOOLEAN | YES | |
| `created_at` | TIMESTAMPTZ | NO | |
| `updated_at` | TIMESTAMPTZ | NO | |

#### Relationships

1:1 with `product`. Appear in `setup_item` with `slot = ball` when a full match setup includes ball choice.

#### Indexes

| Name | Columns | Notes |
|------|---------|-------|
| `ix_ball_material_diameter` | `(material, diameter_mm)` | Era filters |
| `ix_ball_ittf` | `ittf_approved` WHERE TRUE | Partial |

#### Future scalability

- Low cardinality relative to rubbers/blades; no special partitioning.

---

### 5.8 Glue

#### Purpose

Adhesives / boosters / assembly liquids carefully scoped as accessories (not a chemistry marketplace).

#### Fields

| Field | Type | Null | Constraints / notes |
|-------|------|------|---------------------|
| `product_id` | UUID | NO | PK/FK |
| `glue_kind` | VARCHAR(40) | YES | `water_based`, `voc`, `booster`, `cleaner`, `other` |
| `voc_compliant` | BOOLEAN | YES | Regional rules vary — store claim + provenance |
| `application_notes` | TEXT | YES | Editorial; safety disclaimers belong in CMS copy, not only DB |
| `dry_time_minutes` | INT | YES | Approximate |
| `created_at` | TIMESTAMPTZ | NO | |
| `updated_at` | TIMESTAMPTZ | NO | |

#### Relationships

1:1 `product`. Optional `setup_item` slot `glue`.

#### Indexes

| Name | Columns | Notes |
|------|---------|-------|
| `ix_glue_kind` | `glue_kind` | |

#### Future scalability

- Small catalog; monitor legal/compliance metadata needs via `product_attribute_source`.

---

### 5.9 Shoes

#### Purpose

Table tennis / indoor court shoes as first-class equipment for visual discovery and player setups.

#### Fields

| Field | Type | Null | Constraints / notes |
|-------|------|------|---------------------|
| `product_id` | UUID | NO | PK/FK |
| `shoe_kind` | VARCHAR(40) | YES | `tt_specific`, `indoor_court`, `other` |
| `outsole_pattern` | VARCHAR(80) | YES | |
| `upper_material` | VARCHAR(80) | YES | |
| `weight_g` | NUMERIC(6,2) | YES | Claimed pair or single — document in notes |
| `cushioning_notes` | TEXT | YES | |
| `width_fit` | VARCHAR(40) | YES | `narrow`, `standard`, `wide` |
| `size_system` | VARCHAR(20) | YES | `EU`, `US_M`, `UK`, … — sizes as variants |
| `created_at` | TIMESTAMPTZ | NO | |
| `updated_at` | TIMESTAMPTZ | NO | |

#### Relationships

1:1 `product`. Size/colorways → `product_variant`. Player setups may include shoes.

#### Indexes

| Name | Columns | Notes |
|------|---------|-------|
| `ix_shoes_kind_fit` | `(shoe_kind, width_fit)` | |

#### Future scalability

- Size matrices can explode variants; consider kind-specific variant modeling ADR if >50 variants/product average.

---

### 5.10 Apparel

#### Purpose

Shirts, shorts, skirts, jackets, etc. Secondary to blades/rubbers in v1 intent but modeled for completeness and national-team collections.

#### Fields

| Field | Type | Null | Constraints / notes |
|-------|------|------|---------------------|
| `product_id` | UUID | NO | PK/FK |
| `apparel_kind` | VARCHAR(40) | YES | `shirt`, `shorts`, `skirt`, `jacket`, `pants`, `other` |
| `fit` | VARCHAR(40) | YES | |
| `material` | VARCHAR(120) | YES | |
| `competition_legal_note` | TEXT | YES | Color contrast rules etc. — editorial |
| `created_at` | TIMESTAMPTZ | NO | |
| `updated_at` | TIMESTAMPTZ | NO | |

#### Relationships

1:1 `product`. Size/color → variants.

#### Indexes

| Name | Columns | Notes |
|------|---------|-------|
| `ix_apparel_kind` | `apparel_kind` | |

#### Future scalability

- Lowest priority for photography pipeline; allow `publication_status = draft` en masse without blocking core kinds.

---

### 5.11 Player

#### Purpose

Competitive / notable player entity for IMDB-like equipment storytelling: identity, light career context, setup timelines, tournament appearances.

#### Fields

| Field | Type | Null | Constraints / notes |
|-------|------|------|---------------------|
| `id` | UUID | NO | PK |
| `slug` | VARCHAR(160) | NO | UNIQUE |
| `display_name` | VARCHAR(200) | NO | |
| `name_native` | VARCHAR(200) | YES | |
| `country_code` | CHAR(2) | YES | Representing federation affiliation primary |
| `sex_category` | ENUM | YES | Sport category when relevant |
| `handedness` | ENUM | YES | |
| `playing_style` | ENUM | YES | Coarse; refine with tags |
| `birth_date` | DATE | YES | Privacy: omit day if needed → use `birth_year` instead in impl |
| `birth_year` | SMALLINT | YES | Preferred lighter field |
| `active_from_year` | SMALLINT | YES | |
| `active_to_year` | SMALLINT | YES | NULL = active |
| `short_bio` | TEXT | YES | Equipment-relevant, not tabloid |
| `primary_image_id` | UUID | YES | FK → `image` |
| `publication_status` | ENUM | NO | |
| `confidence_level` | ENUM | NO | For bio facts overall |
| `created_at` | TIMESTAMPTZ | NO | |
| `updated_at` | TIMESTAMPTZ | NO | |
| `deleted_at` | TIMESTAMPTZ | YES | |

#### Relationships

| Related | Cardinality | Notes |
|---------|-------------|-------|
| `player_setup` | 1:N | Timed setups |
| `tournament_entry` | 1:N | |
| `player_coach` | N:M | via link table |
| Media | N:M | `media_link` |
| Products | N:M | **through setups**, not a flat “uses” without dates |

#### Indexes

| Name | Columns | Notes |
|------|---------|-------|
| `uq_player_slug` | `slug` WHERE deleted null | |
| `ix_player_country_status` | `(country_code, publication_status)` | |
| `ix_player_name_trgm` | `display_name` | |
| `ix_player_style_hand` | `(playing_style, handedness)` | |

#### Future scalability

- Thousands of players is small vs products; optimize for graph walks (setup → products).
- Avoid storing dense career match stats here (out of scope).

---

### 5.12 Coach

#### Purpose

Coach entity for relationship graph (who coaches whom, national team staff) as discovery context — not a coaching marketplace.

#### Fields

| Field | Type | Null | Constraints / notes |
|-------|------|------|---------------------|
| `id` | UUID | NO | PK |
| `slug` | VARCHAR(160) | NO | UNIQUE |
| `display_name` | VARCHAR(200) | NO | |
| `name_native` | VARCHAR(200) | YES | |
| `country_code` | CHAR(2) | YES | |
| `short_bio` | TEXT | YES | |
| `primary_image_id` | UUID | YES | |
| `publication_status` | ENUM | NO | |
| `created_at` | TIMESTAMPTZ | NO | |
| `updated_at` | TIMESTAMPTZ | NO | |
| `deleted_at` | TIMESTAMPTZ | YES | |

#### Relationships

| Related | Cardinality | Notes |
|---------|-------------|-------|
| `player_coach` | N:M | Dated coaching links |
| `tournament` | optional staff links later | defer unless needed |
| Media | N:M | |

#### Indexes

| Name | Columns | Notes |
|------|---------|-------|
| `uq_coach_slug` | `slug` | |
| `ix_coach_name_trgm` | `display_name` | |

#### Future scalability

- Low volume; no partitioning.

---

### 5.13 Tournament

#### Purpose

Competition events used to date player setups (“World Championships 2024 configuration”) and power era collections. Not a live scoring system.

#### Fields

| Field | Type | Null | Constraints / notes |
|-------|------|------|---------------------|
| `id` | UUID | NO | PK |
| `slug` | VARCHAR(200) | NO | UNIQUE |
| `name` | VARCHAR(300) | NO | |
| `short_name` | VARCHAR(120) | YES | “WTTC 2024” |
| `tournament_level` | VARCHAR(40) | YES | `world`, `continental`, `national`, `wtt`, `other` |
| `start_date` | DATE | YES | |
| `end_date` | DATE | YES | |
| `year` | SMALLINT | NO | Denorm from dates for easy filters |
| `host_country_code` | CHAR(2) | YES | |
| `city` | VARCHAR(120) | YES | |
| `publication_status` | ENUM | NO | |
| `created_at` | TIMESTAMPTZ | NO | |
| `updated_at` | TIMESTAMPTZ | NO | |

#### Relationships

| Related | Cardinality | Notes |
|---------|-------------|-------|
| `tournament_entry` | 1:N | Players in event |
| `player_setup` | 1:N optional | `player_setup.tournament_id` when setup is event-specific |
| Media | N:M | Event photography (secondary to product media) |

#### Indexes

| Name | Columns | Notes |
|------|---------|-------|
| `uq_tournament_slug` | `slug` | |
| `ix_tournament_year_level` | `(year DESC, tournament_level)` | |
| `ix_tournament_dates` | `(start_date, end_date)` | |

#### Future scalability

- Partition by `year` if historical scraping creates large entry tables (entries grow faster than tournaments).

---

### 5.14 Store (reference only)

#### Purpose

External retailer / community shop **as a reference destination**. Explicitly **not** inventory, price engine, or checkout. Links appear as low-emphasis references on PDPs.

#### Fields

| Field | Type | Null | Constraints / notes |
|-------|------|------|---------------------|
| `id` | UUID | NO | PK |
| `slug` | VARCHAR(120) | NO | UNIQUE |
| `name` | VARCHAR(200) | NO | |
| `website_url` | TEXT | NO | Base URL |
| `country_code` | CHAR(2) | YES | Primary market |
| `is_manufacturer_store` | BOOLEAN | NO | Default false |
| `notes` | TEXT | YES | Editorial trust notes |
| `publication_status` | ENUM | NO | |
| `created_at` | TIMESTAMPTZ | NO | |
| `updated_at` | TIMESTAMPTZ | NO | |

**Forbidden fields (do not add without ADR + vision change):** `cart_*`, `inventory_qty`, `checkout_url` as primary CTA metadata, payment credentials, shipping tables.

#### Relationships

| Related | Cardinality | Notes |
|---------|-------------|-------|
| `store_product_link` | 1:N | URL references per product (optional variant) |

#### Indexes

| Name | Columns | Notes |
|------|---------|-------|
| `uq_store_slug` | `slug` | |
| `ix_store_country` | `country_code` | |

#### Future scalability

- Tiny dimension table; cache forever.

---

### 5.15 Review

#### Purpose

Community or editorial written opinions about products (Phase 6 intent). Must support **moderation** and **provenance** so reviews never look like fake precision or stealth ads.

#### Fields

| Field | Type | Null | Constraints / notes |
|-------|------|------|---------------------|
| `id` | UUID | NO | PK |
| `product_id` | UUID | NO | FK → `product` |
| `product_variant_id` | UUID | YES | Optional specificity |
| `author_user_id` | UUID | YES | FK to future `user` table; NULL for imported |
| `author_display_name` | VARCHAR(120) | YES | Snapshot for imports |
| `title` | VARCHAR(200) | YES | |
| `body` | TEXT | NO | |
| `rating` | SMALLINT | YES | 1–5 if used; nullable for unrated essays |
| `play_level` | VARCHAR(40) | YES | Self-reported |
| `hands_on_months` | INT | YES | Experience with product |
| `source_kind` | ENUM media_source_kind-like | NO | `user`, `editorial`, `imported`, … |
| `source_url` | TEXT | YES | |
| `moderation_status` | ENUM review_moderation | NO | Default `pending` |
| `moderation_notes` | TEXT | YES | Internal |
| `moderated_at` | TIMESTAMPTZ | YES | |
| `moderated_by` | UUID | YES | Staff user id |
| `is_verified_purchase` | BOOLEAN | NO | **Always false / unused** in non-ecommerce — prefer omit or lock false |
| `helpful_count` | INT | NO | Denorm |
| `publication_status` | ENUM | NO | Must be published **and** approved to show |
| `created_at` | TIMESTAMPTZ | NO | |
| `updated_at` | TIMESTAMPTZ | NO | |
| `deleted_at` | TIMESTAMPTZ | YES | |

**Note:** `is_verified_purchase` conflicts with non-ecommerce positioning; recommend **excluding** from v1 schema or fixing to FALSE with check constraint. Listed here only to forbid marketplace mimicry.

#### Relationships

| Related | Cardinality | Notes |
|---------|-------------|-------|
| `product` | N:1 | |
| `product_variant` | N:1 optional | |
| Media | N:M optional | user photos via `media_link` with rights=`user_upload` |

#### Indexes

| Name | Columns | Notes |
|------|---------|-------|
| `ix_review_product_mod_pub` | `(product_id, moderation_status, publication_status, created_at DESC)` | PDP list |
| `ix_review_pending` | `(moderation_status, created_at)` WHERE `pending` | Mod queue |
| `ix_review_author` | `author_user_id` WHERE NOT NULL | |

#### Future scalability

- Partition by `created_at` (monthly) when community volume grows.
- Full-text index on `body` for moderation search.
- Toxicity / spam scoring as side table later — do not bloat review row early.

---

### 5.16 Image

#### Purpose

First-class photographic asset. Core of the product. Holds identity, storage pointers, rights, provenance, and technical metadata — **not** merely a URL string on `product`.

#### Fields

| Field | Type | Null | Constraints / notes |
|-------|------|------|---------------------|
| `id` | UUID | NO | PK |
| `storage_key` | TEXT | NO | Object storage key (S3/GCS) — canonical |
| `original_filename` | VARCHAR(300) | YES | |
| `mime_type` | VARCHAR(100) | NO | |
| `byte_size` | BIGINT | YES | |
| `width_px` | INT | YES | |
| `height_px` | INT | YES | |
| `aspect_ratio` | NUMERIC(8,4) | YES | Denorm width/height |
| `checksum_sha256` | CHAR(64) | YES | Dedup |
| `shot_type` | VARCHAR(40) | YES | `hero`, `detail`, `macro`, `angle_front`, `angle_back`, `edge`, `in_context`, `comparison_plate`, `logo`, `other` |
| `angle_label` | VARCHAR(80) | YES | Freeform studio notes |
| `lighting_notes` | TEXT | YES | |
| `alt_text` | TEXT | YES | Accessibility — required before `published` in editorial workflow |
| `caption` | TEXT | YES | |
| `rights` | ENUM media_rights | NO | |
| `license_note` | TEXT | YES | |
| `attribution` | TEXT | YES | Photographer / source credit |
| `source_kind` | ENUM media_source_kind | NO | |
| `source_url` | TEXT | YES | |
| `source_confidence` | ENUM confidence_level | NO | |
| `captured_at` | TIMESTAMPTZ | YES | |
| `color_space` | VARCHAR(40) | YES | |
| `is_primary_candidate` | BOOLEAN | NO | Editorial flag |
| `quality_score` | NUMERIC(4,2) | YES | Internal pipeline score |
| `publication_status` | ENUM | NO | |
| `exif_ext` | JSONB | YES | Stripped of GPS if privacy policy requires |
| `created_at` | TIMESTAMPTZ | NO | |
| `updated_at` | TIMESTAMPTZ | NO | |
| `deleted_at` | TIMESTAMPTZ | YES | |

#### Relationships

| Related | Cardinality | Notes |
|---------|-------------|-------|
| `image_rendition` | 1:N | Derivatives |
| `media_link` | 1:N | Attached to products, players, … |
| Referenced as `primary_image_id` | from product/brand/player | |

#### Indexes

| Name | Columns | Notes |
|------|---------|-------|
| `uq_image_checksum` | `checksum_sha256` WHERE NOT NULL | Dedup ingest |
| `ix_image_status_shot` | `(publication_status, shot_type)` | |
| `ix_image_quality` | `(quality_score DESC)` WHERE published | Editorial queues |
| `ix_image_created` | `created_at DESC` | |

#### Future scalability

- **Partition** images by `created_at` or hash id when multi-million.
- Blob bytes live in object storage; DB holds metadata only.
- Renditions table keeps DB from storing every CDN URL on the parent.
- Cold-archive rejected/deleted metadata after legal retention window.
- Read-heavy: CDN + signed URLs; DB not on critical path for bytes.

---

### 5.17 Video

#### Purpose

Opt-in secondary media (PRODUCT_VISION: never steal focus from still inspection). First-class asset with rights/provenance parallel to images.

#### Fields

| Field | Type | Null | Constraints / notes |
|-------|------|------|---------------------|
| `id` | UUID | NO | PK |
| `storage_key` | TEXT | YES | If self-hosted |
| `external_url` | TEXT | YES | YouTube/Vimeo etc. — CHECK one of storage/external present |
| `mime_type` | VARCHAR(100) | YES | |
| `duration_seconds` | INT | YES | |
| `width_px` | INT | YES | |
| `height_px` | INT | YES | |
| `poster_image_id` | UUID | YES | FK → `image` |
| `title` | VARCHAR(300) | YES | |
| `description` | TEXT | YES | |
| `rights` | ENUM media_rights | NO | |
| `attribution` | TEXT | YES | |
| `source_kind` | ENUM media_source_kind | NO | |
| `source_url` | TEXT | YES | |
| `source_confidence` | ENUM confidence_level | NO | |
| `autoplay_allowed` | BOOLEAN | NO | Default **false** (vision) |
| `publication_status` | ENUM | NO | |
| `created_at` | TIMESTAMPTZ | NO | |
| `updated_at` | TIMESTAMPTZ | NO | |
| `deleted_at` | TIMESTAMPTZ | YES | |

#### Relationships

| Related | Cardinality | Notes |
|---------|-------------|-------|
| `media_link` | 1:N | |
| `poster_image` | N:1 | |

#### Indexes

| Name | Columns | Notes |
|------|---------|-------|
| `ix_video_status` | `(publication_status, created_at DESC)` | |
| `ix_video_poster` | `poster_image_id` | |

#### Future scalability

- Transcoding pipeline external; store rendition list in JSONB or `video_rendition` sibling if needed.
- Prefer linking out for large third-party hosts to reduce egress.

---

## 6. Supporting entities (detailed)

---

### 6.1 `product_alias`

#### Purpose

Search identity: colloquial names, local-language names, abbreviations (“H3”, “Hurricane 3”, “狂飙3”).

#### Fields

| Field | Type | Null | Constraints / notes |
|-------|------|------|---------------------|
| `id` | BIGINT | NO | PK |
| `product_id` | UUID | NO | FK |
| `alias` | VARCHAR(300) | NO | |
| `locale` | VARCHAR(16) | YES | BCP 47 (`zh-CN`, `ja`, …) |
| `alias_kind` | VARCHAR(40) | NO | `colloquial`, `abbreviation`, `localized`, `misspelling`, `former_name` |
| `normalized_alias` | VARCHAR(300) | NO | Lower/folded form for exact match |
| `created_at` | TIMESTAMPTZ | NO | |

#### Relationships

N:1 `product`.

#### Indexes

| Name | Columns | Notes |
|------|---------|-------|
| `uq_alias_product_norm` | `(product_id, normalized_alias)` | |
| `ix_alias_normalized` | `normalized_alias` | Exact resolve |
| `ix_alias_trgm` | `alias` | Fuzzy typeahead |
| `ix_alias_locale` | `(locale, normalized_alias)` | |

#### Future scalability

- Feed `search_document` on write.
- Consider OpenSearch/Elasticsearch synonym graph for massive alias sets.

---

### 6.2 `product_relationship`

#### Purpose

Explainable graph edges: similar-to, supersedes, often-paired-with, same-family. Supports Job G (find similar) without opaque-only embeddings.

#### Fields

| Field | Type | Null | Constraints / notes |
|-------|------|------|---------------------|
| `id` | BIGINT | NO | PK |
| `from_product_id` | UUID | NO | FK |
| `to_product_id` | UUID | NO | FK |
| `relationship_kind` | VARCHAR(40) | NO | `similar`, `supersedes`, `superseded_by`, `often_paired`, `same_series`, `visual_neighbor` |
| `score` | NUMERIC(8,5) | YES | Strength 0–1 |
| `reason_code` | VARCHAR(80) | YES | `same_hardness_band`, `co_occurrence`, `editorial` |
| `reason_text` | TEXT | YES | Human-readable “why” |
| `confidence_level` | ENUM | NO | |
| `source_kind` | VARCHAR(40) | NO | `editorial`, `co_occurrence_job`, `embedding`, `manual` |
| `created_at` | TIMESTAMPTZ | NO | |
| `updated_at` | TIMESTAMPTZ | NO | |
| CHECK | | | `from_product_id <> to_product_id` |

#### Relationships

N:N products (directed).

#### Indexes

| Name | Columns | Notes |
|------|---------|-------|
| `uq_rel_edge` | `(from_product_id, to_product_id, relationship_kind)` | |
| `ix_rel_from_kind_score` | `(from_product_id, relationship_kind, score DESC)` | PDP “similar” |
| `ix_rel_to` | `to_product_id` | Reverse walks |

#### Future scalability

- Co-occurrence jobs write batches; embeddings fill `score` with `source_kind=embedding` **in addition to** explainable edges when possible.
- Cap edges stored per product (top K) to avoid quadratic blowups; rest in ANN index external.

---

### 6.3 `tag` and `product_tag`

#### Purpose

Discovery facets that should not distort the category tree (“innerfiber”, “national-team-fh”, “plastic-ball-era”).

#### Fields — `tag`

| Field | Type | Null | Notes |
|-------|------|------|-------|
| `id` | UUID | NO | PK |
| `slug` | VARCHAR(120) | NO | UNIQUE |
| `name` | VARCHAR(120) | NO | |
| `namespace` | VARCHAR(40) | NO | `style`, `tech`, `era`, `editorial`, … |
| `description` | TEXT | YES | |
| `created_at` | TIMESTAMPTZ | NO | |

#### Fields — `product_tag`

| Field | Type | Null | Notes |
|-------|------|------|-------|
| `product_id` | UUID | NO | PK part |
| `tag_id` | UUID | NO | PK part |
| `weight` | NUMERIC(5,2) | YES | Optional ranking |
| `source_kind` | VARCHAR(40) | NO | |
| `created_at` | TIMESTAMPTZ | NO | |

#### Indexes

- `ix_product_tag_tag` (`tag_id`, `product_id`) for tag pages.
- `ix_tag_namespace_slug` (`namespace`, `slug`).

#### Future scalability

- Tag pages via covering indexes + product_card MV.
- Avoid unbounded free tags without moderation namespace.

---

### 6.4 `collection` and `collection_item`

#### Purpose

Curated or algorithmic groupings powering Explore (Steam-like).

#### Fields — `collection`

| Field | Type | Null | Notes |
|-------|------|------|-------|
| `id` | UUID | NO | PK |
| `slug` | VARCHAR(160) | NO | UNIQUE |
| `title` | VARCHAR(300) | NO | |
| `subtitle` | TEXT | YES | |
| `collection_kind` | VARCHAR(40) | NO | `editorial`, `algorithmic`, `system` |
| `hero_image_id` | UUID | YES | |
| `publication_status` | ENUM | NO | |
| `sort_mode` | VARCHAR(40) | NO | `manual`, `popularity`, `newest_media` |
| `created_at` / `updated_at` | TIMESTAMPTZ | NO | |

#### Fields — `collection_item`

| Field | Type | Null | Notes |
|-------|------|------|-------|
| `collection_id` | UUID | NO | PK part |
| `product_id` | UUID | NO | PK part |
| `sort_order` | INT | NO | |
| `annotation` | TEXT | YES | Why it’s in the collection |
| `added_at` | TIMESTAMPTZ | NO | |

#### Indexes

- `(collection_id, sort_order)` for rendering.
- `(product_id)` for “appears in collections”.

#### Future scalability

- Algorithmic collections regenerated into this table on a schedule (snapshot), keeping read path simple.

---

### 6.5 `setup` and `setup_item`

#### Purpose

First-class configuration object: pro configurations and user racket builds (PCPartPicker mental model).

#### Fields — `setup`

| Field | Type | Null | Notes |
|-------|------|------|-------|
| `id` | UUID | NO | PK |
| `slug` | VARCHAR(200) | YES | Unique when public/shareable |
| `setup_kind` | ENUM setup_kind | NO | `player_pro`, `user_build`, `editorial` |
| `title` | VARCHAR(300) | NO | |
| `description` | TEXT | YES | |
| `owner_user_id` | UUID | YES | For user builds |
| `visibility` | VARCHAR(20) | NO | `private`, `unlisted`, `public` |
| `based_on_setup_id` | UUID | YES | Fork/clone lineage |
| `confidence_level` | ENUM | NO | Especially for pro setups |
| `publication_status` | ENUM | NO | |
| `created_at` / `updated_at` | TIMESTAMPTZ | NO | |
| `deleted_at` | TIMESTAMPTZ | YES | |

#### Fields — `setup_item`

| Field | Type | Null | Notes |
|-------|------|------|-------|
| `id` | BIGINT | NO | PK |
| `setup_id` | UUID | NO | FK CASCADE |
| `slot` | ENUM setup_slot | NO | `blade`, `rubber_fh`, `rubber_bh`, … |
| `product_id` | UUID | NO | FK |
| `product_variant_id` | UUID | YES | Thickness/color when known |
| `quantity` | SMALLINT | NO | Default 1 |
| `notes` | TEXT | YES | “black FH”, tuning notes |
| `sort_order` | INT | NO | |
| UNIQUE | `(setup_id, slot)` | | One product per slot for racket slots (enforce for blade/FH/BH) |

#### Relationships

- Setup → many items → products/variants.
- `player_setup` attaches a setup to a player timeline.
- Builder “open player setup” clones into `user_build` with `based_on_setup_id`.

#### Indexes

| Name | Columns | Notes |
|------|---------|-------|
| `ix_setup_item_product` | `product_id` | “Appears in setups” |
| `ix_setup_kind_visibility` | `(setup_kind, visibility, updated_at DESC)` | |
| `ix_setup_owner` | `owner_user_id` WHERE NOT NULL | |

#### Future scalability

- Counter `product.setup_appearance_count` maintained asynchronously from `setup_item` writes.
- Public setups CDN-cacheable by slug.

---

### 6.6 `player_setup`

#### Purpose

Time-bounded attribution: which setup a player used in which era / tournament, with confidence labeling (rumored vs verified).

#### Fields

| Field | Type | Null | Notes |
|-------|------|------|-------|
| `id` | UUID | NO | PK |
| `player_id` | UUID | NO | FK |
| `setup_id` | UUID | NO | FK |
| `tournament_id` | UUID | YES | FK — event-specific |
| `valid_from` | DATE | YES | |
| `valid_to` | DATE | YES | NULL = current/unknown end |
| `is_current` | BOOLEAN | NO | Denorm flag; at most one current per player (partial unique) |
| `confidence_level` | ENUM | NO | Claim confidence |
| `source_kind` | VARCHAR(40) | NO | |
| `source_url` | TEXT | YES | |
| `source_notes` | TEXT | YES | |
| `created_at` / `updated_at` | TIMESTAMPTZ | NO | |

#### Indexes

| Name | Columns | Notes |
|------|---------|-------|
| `ix_player_setup_player_from` | `(player_id, valid_from DESC)` | Timeline |
| `uq_player_current_setup` | `(player_id)` WHERE `is_current` | Partial unique |
| `ix_player_setup_tournament` | `tournament_id` WHERE NOT NULL | |
| `ix_player_setup_setup` | `setup_id` | |

#### Future scalability

- Timeline APIs read this table + join setup_items + primary images — consider MV `player_setup_card`.

---

### 6.7 `media_link`

#### Purpose

Polymorphic association of `image` / `video` to any entity without duplicating blobs. Enables gallery-as-inventory across products, variants, players, tournaments, collections, reviews.

#### Fields

| Field | Type | Null | Notes |
|-------|------|------|-------|
| `id` | BIGINT | NO | PK |
| `media_type` | VARCHAR(10) | NO | `image` \| `video` |
| `image_id` | UUID | YES | CHECK exactly one of image/video |
| `video_id` | UUID | YES | |
| `entity_type` | ENUM entity_type | NO | |
| `entity_id` | UUID | NO | |
| `role` | VARCHAR(40) | NO | `gallery`, `hero`, `detail`, `comparison`, `avatar`, … |
| `sort_order` | INT | NO | |
| `is_primary` | BOOLEAN | NO | Per entity+media_type |
| `created_at` | TIMESTAMPTZ | NO | |

#### Indexes

| Name | Columns | Notes |
|------|---------|-------|
| `ix_media_link_entity` | `(entity_type, entity_id, media_type, sort_order)` | Gallery fetch |
| `ix_media_link_image` | `image_id` WHERE NOT NULL | Reverse: where used |
| `ix_media_link_video` | `video_id` WHERE NOT NULL | |
| Partial unique primary | `(entity_type, entity_id, media_type)` WHERE `is_primary` | |

#### Future scalability

- High write volume from scrapers — batch insert; dedupe on `(image_id, entity_type, entity_id)`.
- Partition by `entity_type` if enormous.

**Why polymorphic here:** Media attaches to many aggregates; a forest of `product_image`, `player_image`, … tables duplicates structure. Polymorphic link is acceptable when `entity_type` is constrained enum and always indexed as composite leading columns. Prefer **not** polymorphic for money/commerce — irrelevant here.

---

### 6.8 `image_rendition`

#### Purpose

Responsive derivatives (Google Photos / CDN density): widths, formats (avif/webp), quality.

#### Fields

| Field | Type | Null | Notes |
|-------|------|------|-------|
| `id` | BIGINT | NO | PK |
| `image_id` | UUID | NO | FK CASCADE |
| `rendition_kind` | VARCHAR(40) | NO | `thumb`, `card`, `pdp`, `zoom`, `full` |
| `storage_key` | TEXT | NO | |
| `width_px` | INT | NO | |
| `height_px` | INT | NO | |
| `mime_type` | VARCHAR(100) | NO | |
| `byte_size` | BIGINT | YES | |
| `created_at` | TIMESTAMPTZ | NO | |

#### Indexes

- UNIQUE `(image_id, rendition_kind, mime_type, width_px)`.
- `(image_id)` cluster-friendly.

#### Future scalability

- Immutable once written; regenerate by inserting new rows + cutover.
- Purge old renditions via lifecycle jobs.

---

### 6.9 `store_product_link`

#### Purpose

Reference-only URL from a product (optional variant) to a store page. Never drives inventory UI.

#### Fields

| Field | Type | Null | Notes |
|-------|------|------|-------|
| `id` | BIGINT | NO | PK |
| `store_id` | UUID | NO | FK |
| `product_id` | UUID | NO | FK |
| `product_variant_id` | UUID | YES | |
| `url` | TEXT | NO | |
| `link_label` | VARCHAR(120) | YES | “Manufacturer page”, “Community shop” |
| `sort_order` | INT | NO | |
| `is_primary_reference` | BOOLEAN | NO | Soft preference only |
| `last_checked_at` | TIMESTAMPTZ | YES | Link rot jobs |
| `is_dead` | BOOLEAN | NO | Default false |
| `created_at` / `updated_at` | TIMESTAMPTZ | NO | |

#### Indexes

- `(product_id, sort_order)`.
- `(store_id, product_id)`.
- Partial `(is_dead)` WHERE true for cleanup.

#### Future scalability

- Scraper/link-checker workers; no price columns without explicit vision change + ADR.

---

### 6.10 `brand_relationship`

#### Purpose

Corporate/OEM/co-brand graph (parent company, rebadged lines).

#### Fields

| Field | Type | Null | Notes |
|-------|------|------|-------|
| `id` | BIGINT | NO | PK |
| `from_brand_id` | UUID | NO | |
| `to_brand_id` | UUID | NO | |
| `relationship_kind` | VARCHAR(40) | NO | `parent`, `subsidiary`, `oem_for`, `co_brand` |
| `notes` | TEXT | YES | |
| `created_at` | TIMESTAMPTZ | NO | |

#### Indexes

UNIQUE `(from_brand_id, to_brand_id, relationship_kind)`.

---

### 6.11 `player_coach`

#### Purpose

Dated coaching relationships for discovery (“coached by”).

#### Fields

| Field | Type | Null | Notes |
|-------|------|------|-------|
| `id` | BIGINT | NO | PK |
| `player_id` | UUID | NO | |
| `coach_id` | UUID | NO | |
| `role` | VARCHAR(80) | YES | `personal`, `national_team`, … |
| `valid_from` / `valid_to` | DATE | YES | |
| `confidence_level` | ENUM | NO | |
| `source_url` | TEXT | YES | |
| `created_at` | TIMESTAMPTZ | NO | |

#### Indexes

`(player_id, valid_from DESC)`, `(coach_id)`.

---

### 6.12 `tournament_entry`

#### Purpose

Player participation in a tournament; optional link to the setup used at that event.

#### Fields

| Field | Type | Null | Notes |
|-------|------|------|-------|
| `id` | BIGINT | NO | PK |
| `tournament_id` | UUID | NO | |
| `player_id` | UUID | NO | |
| `event_category` | VARCHAR(80) | YES | `MS`, `WS`, `MD`, … |
| `result_text` | VARCHAR(120) YES | “R16”, “Champion” — light, not full draw graph |
| `player_setup_id` | UUID | YES | FK → `player_setup` |
| `created_at` | TIMESTAMPTZ | NO | |

#### Indexes

UNIQUE `(tournament_id, player_id, event_category)`.  
`(player_id, tournament_id)`.

#### Future scalability

- Partition by tournament year via parent tournament join or denorm `year` column.

---

### 6.13 `product_attribute_source`

#### Purpose

Provenance for individual attributes when confidence differs field-by-field (speed rating from manufacturer vs weight from community).

#### Fields

| Field | Type | Null | Notes |
|-------|------|------|-------|
| `id` | BIGINT | NO | PK |
| `product_id` | UUID | NO | |
| `attribute_key` | VARCHAR(80) | NO | `speed_rating`, `weight_min_g`, … |
| `attribute_value` | TEXT | NO | Serialized value |
| `confidence_level` | ENUM | NO | |
| `source_kind` | VARCHAR(40) | NO | |
| `source_url` | TEXT | YES | |
| `recorded_at` | TIMESTAMPTZ | NO | |
| `is_current` | BOOLEAN | NO | |

#### Indexes

Partial unique current `(product_id, attribute_key)` WHERE `is_current`.

#### Future scalability

- History retained for audits; UI reads current only.

---

### 6.14 `search_document` (intentional denormalization)

#### Purpose

Single row projection for typeahead / FTS / rank boosting at 100k+ products without multi-join on every keystroke.

#### Fields

| Field | Type | Null | Notes |
|-------|------|------|-------|
| `entity_type` | VARCHAR(40) | NO | PK part (`product`, `player`, `brand`, …) |
| `entity_id` | UUID | NO | PK part |
| `title` | VARCHAR(400) | NO | |
| `subtitle` | VARCHAR(400) | YES | |
| `aliases_blob` | TEXT | YES | Concatenated aliases |
| `product_kind` | VARCHAR(40) | YES | |
| `brand_name` | VARCHAR(200) | YES | |
| `primary_image_id` | UUID | YES | |
| `publication_status` | ENUM | NO | |
| `search_vector` | TSVECTOR | YES | Weighted title/aliases/summary |
| `rank_boost` | NUMERIC(6,3) | NO | |
| `updated_at` | TIMESTAMPTZ | NO | |

#### Indexes

- GIN on `search_vector`.
- Trigram on `title` / `aliases_blob`.
- Partial WHERE `publication_status = 'published'`.

#### Future scalability

- Rebuild via triggers or CDC into OpenSearch when Postgres FTS saturates.
- Keep Postgres as source of truth; search index is disposable.

---

### 6.15 `compare_snapshot` (optional)

#### Purpose

Shareable compare URLs (vision: state is shareable). **Not** a cart.

#### Fields

| Field | Type | Null | Notes |
|-------|------|------|-------|
| `id` | UUID | NO | PK |
| `slug` | VARCHAR(64) | NO | UNIQUE short id |
| `product_ids` | UUID[] | NO | Ordered; max N enforced in app (e.g. 4–8) |
| `baseline_product_id` | UUID | YES | Pinned baseline |
| `created_by_user_id` | UUID | YES | |
| `created_at` | TIMESTAMPTZ | NO | |
| `expires_at` | TIMESTAMPTZ | YES | |

#### Indexes

`uq_compare_slug`, `(expires_at)` for GC.

---

## 7. Cross-cutting integrity rules

1. **Subtype exclusivity:** exactly one subtype row iff `product_kind` ∈ typed set; zero subtype rows for `other` until promoted.
2. **Variant ownership:** `product_variant.product_id` must match parent; setup_item variant must match item product.
3. **Publication cascade (logical):** unpublished products should not appear in public collections/search_document; enforce in writers.
4. **Media rights:** `publication_status=published` requires non-`restricted` rights and non-empty `alt_text` for editorial images (workflow rule).
5. **Setup slots:** racket setups should include at most one `blade`, one `rubber_fh`, one `rubber_bh`.
6. **Confidence:** player_setup and attribute claims default to `unknown`/`rumored`, never silently `verified`.
7. **Stores:** no price/inventory columns without ADR reversing PRODUCT_VISION anti-goals.
8. **Soft deletes:** unique slugs consider `deleted_at IS NULL` partial uniques.

---

## 8. Example relationship walks (query intent)

### 8.1 Product detail page

`product` → `brand`, `category`, subtype row, `product_variant`s, primary `image` + `media_link` gallery, `product_relationship` similar, `setup_item` → setups → `player_setup` → `player`, `store_product_link`, approved `review`s.

### 8.2 Player timeline

`player` → `player_setup` ordered by `valid_from` → `setup` → `setup_item` → `product` (+ primary image) → optional `tournament`.

### 8.3 Typeahead search

`search_document` WHERE published MATCH query OR trigram alias → return entity_type, id, title, primary_image_id.

### 8.4 Compare workspace

Client sends N product ids → fetch `product_card` + subtype attributes + aligned `shot_type=comparison_plate` or hero images; optional persist `compare_snapshot`.

### 8.5 Builder from pro setup

Load `player_setup` → clone `setup`/`setup_item` into `setup_kind=user_build` with `based_on_setup_id`.

---

## 9. Indexing strategy summary (100k+ products)

| Access pattern | Strategy |
|----------------|----------|
| Category/brand grids | Partial indexes on published products + `product_card` MV |
| Kind facets (blade construction, rubber hardness) | Indexes on subtype tables; join by PK |
| Name / alias search | `product_alias` + `search_document` FTS/trgm; later OpenSearch |
| Similar products | Top-K `product_relationship` per product |
| Appears in setups | `setup_item(product_id)` + denorm counter |
| Media galleries | `media_link(entity_type, entity_id, …)` |
| Moderation queues | Partial indexes on pending reviews / draft media |
| Link rot | `store_product_link(is_dead)` |

Avoid over-indexing write-heavy scraper landing tables; separate staging schemas in Phase 4.

---

## 10. Scalability playbook

### 10.1 Near term (Phase 2)

- Single Postgres primary + read replica.
- Object storage + CDN for images/videos.
- `search_document` maintained in-process or via queue.
- Denorm counters via async workers.

### 10.2 Growth

- Materialized views for cards and player timelines.
- OpenSearch/Elasticsearch for catalog search if FTS latency regresses.
- pgvector **or** external ANN for embeddings — store results back into `product_relationship` with reason codes when possible.
- Partition `media_link`, `image`, `review`, `setup_item` by time/hash when row counts demand.
- Archive soft-deleted / abandoned private user builds.

### 10.3 Intentional denormalization candidates (approved list)

| Artifact | Reason |
|----------|--------|
| `brand.product_count`, `product.image_count`, `setup_appearance_count` | Avoid COUNT(*) on hot paths |
| `category.path` | Cheap subtree |
| `tournament.year` | Filter without date math |
| `search_document` | Typeahead latency |
| `product_card` MV | Grid APIs |
| `player_setup.is_current` | Fast “current racket” |

Anything else must be justified in an ADR.

### 10.4 What we will not denormalize early

- Full subtype attributes onto `product` (defeats joined inheritance).
- Prices / stock onto products.
- Unbounded JSONB as the attribute system of record for filterable fields.

---

## 11. Mapping to PRODUCT_VISION jobs

| Job | Primary tables |
|-----|----------------|
| Discover | `collection`, `tag`, `product`, `image`, `product_relationship` |
| Search | `product_alias`, `search_document`, `brand`, `player` |
| Compare | `product` + subtypes + media; `compare_snapshot` |
| Build | `setup`, `setup_item`, variants |
| Explore professionals | `player`, `player_setup`, `tournament`, `tournament_entry` |
| Learn | `product` summary, `product_attribute_source`, editorial fields |
| Find similar | `product_relationship` (+ later embeddings) |

---

## 12. Open questions (data-model specific)

Resolved for this document unless overturned by ADR:

1. **STI vs joined:** joined subtypes — **decided**.
2. **Variant axes:** concrete combination rows first — **decided**; EAV only if shoes explode.
3. **Ratings normalization:** store raw + scale note; normalized columns optional offline — **decided direction**.
4. **User accounts:** `owner_user_id` / `author_user_id` reserved; `user` table out of scope until auth ADR.
5. **Polymorphic media_link:** accepted with constrained enum — **decided**.

Still open:

- Exact UUID vs ULID vs bigint for public ids.
- Whether secondary categories need `product_category` M:N.
- Embedding dimension / vendor for visual similarity.
- Retention policy for rejected media and PII in EXIF.

---

## 13. Document control

| Field | Value |
|-------|--------|
| Title | Data Model — TTSetupBuilder |
| Location | `docs/DATA_MODEL.md` |
| Language | English (architecture requirements style) |
| Implementation | **None in this change** — documentation only |
| Change policy | Update when entity semantics shift; note in `CHANGELOG.md` |

---

**Bottom line:** Canonical `product` + `product_variant`, **joined** typed subtypes, first-class **image/video** with rights-aware `media_link`, reference-only **stores**, provenance-rich **reviews/setups**, and explicit search/similarity projections give TTSetupBuilder a normalized backbone that can scale past 100k products without ecommerce contamination.
